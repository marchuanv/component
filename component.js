const path = require("path");
const fs = require('fs');
const { exec } = require("child_process");
const delegate = require("component.delegate");
const logging = require("component.logging");
const { component } = require("./package.json");

function Component( { moduleName, username, startPath }){
    this.name = moduleName;
    this.username = username;
    this.startPath = startPath;
};

Component.prototype.subscribe = async function({ name }, callback) {
    return await delegate.register({ context: this.name, name, overwriteDelegate: true }, callback);
};

Component.prototype.publish =  async function({ name, wildcard }, params) {
    const config = getComponentConfig({ moduleName: this,name });
    const results = [];
    for(const context of config.parent){
        const result = await delegate.call({ context, name, wildcard }, params);
        results.push(result);
    };
    return results.length === 1? results[0] : results;
};

Component.prototype.log = async function(message, data = null) {
    return logging.write(this.name, message, data);
};

Component.prototype.install = function() {
    return new Promise(async (resolve) => {
        let moduleToInstall = `${this.username}/${this.name}`;
        await logging.write(this.name, `installing ${moduleToInstall}`);
        exec(`npm install ${moduleToInstall} --no-save --no-package-lock`, () => {
            const id = setInterval(async () => {
                const info = resolveModule(moduleName);
                if (info) {
                    await logging.write(this.name, `${moduleToInstall} installed.`);
                    clearInterval(id);
                    resolve(info);
                }
            },100);
        });
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

const resolveModule = (moduleName) => {
    let { resolvedPath, packagePath } = {};
    try {
        if (moduleName){
            resolvedPath = require.resolve(moduleName);
            const fileName = path.basename(resolvedPath);
            packagePath = resolvedPath.replace(fileName, "package.json");
        } else {
            let resolvedDir = path.join(__dirname,"../../");
            packagePath = path.join(resolvedDir, "package.json");
            let package = resolvePackage({ mainFilePath: packagePath });
            resolvedPath = package? path.join(resolvedDir, package.main) : null;
            packagePath = package? packagePath : null;
        }
        return { resolvedPath, packagePath };
    } catch(err) {
        let resolvedDir = path.join(__dirname,"node_modules", moduleName);
        if (__dirname.indexOf("node_modules") > -1){
            resolvedDir = path.join(__dirname,"../");
            resolvedDir = path.join(resolvedDir, moduleName);
        }
        packagePath = path.join(resolvedDir, "package.json");
        let package = resolvePackage({ mainFilePath: packagePath });
        resolvedPath = package? path.join(resolvedDir, package.main) : null;
        packagePath = package? packagePath : null;
        return { resolvedPath, packagePath };
    }
};

const getPackage = ({ dirPath, packagePath }) => {
    if (!packagePath && dirPath){
        packagePath = path.join(dirPath, "package.json");
    }
    return resolvePackage({ mainFilePath: packagePath });
};

const getComponentConfig = ({ moduleName }) => {
    let config = {
        packagePath: null, 
        resolvedPath: null,
        name: null,
        friendlyName: null,
        parentName: null
    };
    ({ packagePath: config.packagePath, resolvedPath: config.resolvedPath } = resolveModule(moduleName));
    if (!config.packagePath || !config.resolvedPath){
        return config;
    }
    let { name, component } = getPackage(config);
    component.name = name;
    Object.assign(config, component);
    config.friendlyName = formatComponentName(config.name);
    return config;
};

let componentRegister = [];
module.exports = {
    register: async ({ moduleName }) => {
        const config = getComponentConfig({ moduleName });
        const registeredComponent = componentRegister.find( c => c.name === config.name);
        if (registeredComponent){
            return registeredComponent;
        }
        const { gitUsername } = component;
        const newComponent = new Component({ moduleName: config.name || moduleName, username: gitUsername });
        await newComponent.install();
        await delegate.call({ context: moduleName, name: "installed" }, {});
        componentRegister.push(newComponent);
        await logging.register({ packageJson: config });
        const results = {};
        results[formatComponentName(componentConfig.name)] = newComponent;
        return results;
    },
    on: async ({ eventName, moduleName }, callback) => {
        return await delegate.register({ context: moduleName, name: eventName, overwriteDelegate: true }, callback);
    },
    load: ({ moduleName }) => {
        const registeredComponent = componentRegister.find( c => c.name === moduleName);
        if (!registeredComponent) {
            throw new Error(`component: "${moduleName}" is not registered.`);
        }
        const required = require(registeredComponent.startPath);
        await delegate.call({ context: registeredComponent.name, name: "loaded" }, {});
        return required;
    }
};