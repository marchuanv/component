const path = require("path");
const fs = require('fs');
const utils = require('utils');
const { exec } = require("child_process");
const delegate = require("component.delegate");
const logging = require("component.logging");
const { component } = require("./package.json");
const { gitUsername } = component;

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

const installModule = ({ moduleName }) => {
    return new Promise(async (resolve, reject) => {
        let moduleToInstall = moduleName;
        if (gitUsername) {
            moduleToInstall = `${gitUsername}/${moduleName}`;
        }
        exec(`npm install ${moduleToInstall} --no-save --no-package-lock`, () => {
            const id = setInterval(() => {
                const info = resolveModule(moduleName);
                if (info) {
                    clearInterval(id);
                    resolve(info);
                }
            },100);
        });
    });
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

let loadingComponets = [];
let registeredComponets = [];
const references = {
    config: {}
};

module.exports = {
    register: async ({ moduleName }) => {
        let componentConfig = getComponentConfig({ moduleName });
        await logging.register({ packageJson: componentConfig });
        const newComponent = utils.getJSONObject(utils.getJSONString(componentConfig));
        newComponent.subscribe = async ({ name, overwriteDelegate = true }, callback) => {
            componentConfig = getComponentConfig({ moduleName });
            return await delegate.register({ context: componentConfig.name, name, overwriteDelegate }, callback);
        };
        newComponent.publish = async ( { name, wildcard }, params) => {
            componentConfig = getComponentConfig({ moduleName: componentConfig.name });
            return await delegate.call({ context: componentConfig.parentName, name, wildcard }, params);
        };
        newComponent.log = (message, data = null) => {
            componentConfig = getComponentConfig({ moduleName: componentConfig.name });
            return logging.write(componentConfig.name, message, data);
        };
        const results = {};
        results[formatComponentName(componentConfig.name)] = newComponent;
        registeredComponets.push(newComponent);
        return results;
    },
    load: ({ moduleName }) => {
        return new Promise(async (resolve) => {
            if (!moduleName){
                throw new Error("missing parameter: moduleName");
            }
            loadingComponets.push(moduleName);
            let componentConfig = getComponentConfig({ moduleName });
            if (!componentConfig.resolvedPath || !componentConfig.packagePath){
                await installModule({ moduleName });
                componentConfig = getComponentConfig({ moduleName });
            }
            references[componentConfig.friendlyName] =  require(componentConfig.resolvedPath);
            references.config[componentConfig.friendlyName] = componentConfig;
            const id = setInterval(async ()=> {
                const latestLoadingModule = loadingComponets[loadingComponets.length-1];
                if (latestLoadingModule === moduleName) {
                    clearInterval(id);
                    loadingComponets.pop();
                    await resolve(references);
                }
            },100);
        });
    }
};