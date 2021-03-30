const path = require("path");
const fs = require('fs');
const { exec } = require("child_process");
const delegate = require("component.delegate");
const { component } = require("./package.json");
const logging = require("component.logging");

function Component( { moduleName, username }){
    this.name = moduleName;
    this.username = username;
    this.installing = false;
};

Component.prototype.subscribe = async function({ channel }, callback) {
    for(const { moduleName } of this.publishers){
        await delegate.register({ context: moduleName, name: channel, overwriteDelegate: true }, callback);
    };
};

Component.prototype.publish =  async function({ channel }, params) {
    const results = [];
    for(const { moduleName } of this.subscribers){
        const result = await delegate.call({ context: moduleName, name: channel }, params);
        results.push(result);
    };
    return results.length === 1? results[0] : results;
};

Component.prototype.log = async function(message, data = null) {
    return logging.write(this.name, message, data);
};

Component.prototype.isInstalled = async function() {
    let config = await getComponentConfig(this.name);
    if (config.resolvedPath && config.packagePath) {
        this.installing = false;
        return true;
    }
    return false;
};

Component.prototype.reload = async function() {
    let config = await getComponentConfig(this.name);
    Object.assign(this, config);
};

Component.prototype.install = function() {
    return new Promise(async(resolve) => {
        let moduleToInstall = `${this.username}/${this.name}`;
        if (await this.isInstalled()){
            await this.log(`${moduleToInstall} installed.`);
            return await resolve();
        } else if (!this.installing) {
            await this.log(`installing ${moduleToInstall}`);
            exec(`npm install ${moduleToInstall} --no-save --no-package-lock`, () => {});
            this.installing = true;
        }
        setTimeout( async () => {
            resolve(await this.install());
        }, 1000);
    });
};

const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
}

const formatComponentName = (name) => {
    let parts = name.split(".");
    const componentIndex = parts.findIndex(x => x.toLowerCase() === "component");
    parts.splice(componentIndex,1);
    name = parts[0];
    delete parts[0];
    for(const part of parts){
        name = name + capitalize(part);
    };
    return name.replace("component","");
};

const resolvePackage = ({ mainFilePath }) => {
    const mainFileName = path.basename(mainFilePath);
    let packagePath = mainFilePath.replace(mainFileName,"package.json");
    if (!fs.existsSync(packagePath)){
        return undefined;
    }
    return require(packagePath);
};

const resolveModule = (componentModule) => {
    const moduleName = typeof componentModule === "string" ? componentModule: path.basename(componentModule.path);
    let { resolvedPath, packagePath } = {};
    try {
        resolvedPath = require.resolve(moduleName);
        const fileName = path.basename(resolvedPath);
        packagePath = resolvedPath.replace(fileName, "package.json");
        return { resolvedPath, packagePath };
    } catch(err) {

        let resolvedDir = path.join(__dirname,"../../");
        packagePath = path.join(resolvedDir, "package.json");
        let package = resolvePackage({ mainFilePath: packagePath });
        resolvedPath = package? path.join(resolvedDir, package.main) : null;
        packagePath = package? packagePath : null;
        if (package.name !== moduleName){
            resolvedPath = null;
            packagePath = null;
        }

        if (!resolvedPath && !packagePath){
            resolvedDir = path.join(__dirname,"node_modules", moduleName);
            if (__dirname.indexOf("node_modules") > -1){
                resolvedDir = path.join(__dirname,"../");
                resolvedDir = path.join(resolvedDir, moduleName);
            }
            packagePath = path.join(resolvedDir, "package.json");
            let package = resolvePackage({ mainFilePath: packagePath });
            resolvedPath = package? path.join(resolvedDir, package.main) : null;
            packagePath = package? packagePath : null;    
        }

        return { resolvedPath, packagePath, name: moduleName };
    }
};

const getPackage = ({ dirPath, packagePath }) => {
    if (!packagePath && dirPath){
        packagePath = path.join(dirPath, "package.json");
    }
    return resolvePackage({ mainFilePath: packagePath });
};

const getComponentConfig = async (componentModule) => {
    let config = {
        packagePath: null, 
        resolvedPath: null,
        name: null,
        friendlyName: null,
    };
    ({ packagePath: config.packagePath, resolvedPath: config.resolvedPath , name: config.name } = resolveModule(componentModule));
    if (!config.packagePath || !config.resolvedPath){
        return config;
    }
    let { name, component } = getPackage(config);
    component.name = name;
    Object.assign(config, component);
    config.friendlyName = formatComponentName(config.name);
    return config;
};

const componentRegister = [];
const registerComponent = async (moduleName) => {
    const { gitUsername } = component;
    const com = new Component({ moduleName, username: gitUsername });
    if (!(await com.isInstalled())) {
        await com.install();
        componentRegister.push(com);
        await com.reload();
        await logging.register({ moduleName });
        await delegate.call({ context: moduleName, name: "installed" }, {});
    }
    return com;
};

module.exports = {
    register: async (componentModule = "") => {
        if (!componentModule){
            throw new Error("invalid parameter: componentModule");
        }
        const config = await getComponentConfig(componentModule);
        let registeredComponent = componentRegister.filter( c => c.name === (config && config.name));
        if (!registeredComponent) {
            for(const { moduleName } of config.component.publishers) {
                await registerComponent(moduleName);
            };
            await registerComponent(config.name);
            for(const { moduleName } of config.component.subscribers) {
                await registerComponent(moduleName);
            };
        }
        const results = {};
        for(const registeredComponent of registeredComponents){
            results[formatComponentName(registeredComponent.name)] = registeredComponent;
        };
        return results;
    },
    on: async ({ eventName, moduleName }, callback) => {
        return await delegate.register({ context: moduleName, name: eventName, overwriteDelegate: true }, callback);
    },
    load: async ({ moduleName }) => {
        const registeredComponent = componentRegister.find( c => c.name === moduleName);
        if (!registeredComponent) {
            throw new Error(`component: "${moduleName}" is not registered.`);
        }
        const required = require(registeredComponent.resolvedPath);
        await delegate.call({ context: registeredComponent.name, name: "loaded" }, {});
        return required;
    }
};