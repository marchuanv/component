const path = require("path");
const fs = require('fs');
const delegate = require("component.delegate");
const { component } = require("./package.json");
const logging = require("component.logging");
const Component = require("./component.js");

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

const ensureInstalledComponent = async (moduleName) => {
    const { gitUsername } = component;
    const com = new Component({ moduleName, username: gitUsername });
    if (!(await com.isInstalled())) {
        await com.install();
        await delegate.call({ context: "global", name: "moduleinstalled" }, {});
    }
    await com.reload();
    await logging.register({ moduleName });
    return com;
};

module.exports = {
    registry: [],
    load: async (componentModule = "") => {
        if (!componentModule){
            throw new Error("invalid parameter: componentModule");
        }
        const config = await getComponentConfig(componentModule);
        let registeredComponent = module.exports.registry.find(com => com.name === config.name);
        if (!registeredComponent) {
            registeredComponent = await ensureInstalledComponent(config.name);
            module.exports.registry.push(registeredComponent);
        }
        for(const { moduleName } of registeredComponent.publishers) {
            await module.exports.register(moduleName);
        };
        registeredComponent.exports = require(registeredComponent.resolvedPath);
        const results = {};
        results[formatComponentName(registeredComponent.name)] = registeredComponent;
        return results;
    },
    on: async ({ eventName }, callback) => {
        return await delegate.register({ context: "global", name: eventName, overwriteDelegate: true }, callback);
    }
};