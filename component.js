const path = require("path");
const fs = require('fs');
const { exec } = require("child_process");
const delegate = require("component.delegate");

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
    try {
        let resolvedPath = require.resolve(moduleName);
        const fileName = path.basename(resolvedPath);
        let packagePath = resolvedPath.replace(fileName, "package.json");
        return { resolvedPath, packagePath };
    } catch(err) {
        let resolvedDir = path.join(__dirname,"node_modules", moduleName);
        if (__dirname.indexOf("node_modules") > -1){
            resolvedDir = path.join(__dirname,"../");
            resolvedDir = path.join(resolvedDir, moduleName);
        }
        let packagePath = path.join(resolvedDir,"package.json");
        const package = resolvePackage({ mainFilePath: packagePath });
        let resolvedPath = package? path.join(resolvedDir, package.main) : null;
        packagePath = package? packagePath : null;
        return { resolvedPath, packagePath };
    }
};

const installModule = ({ gitUsername, moduleName }) => {
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

const getPackageInfo = ({ dirPath, packagePath }) => {
    const info = {
        hostname: null,
        port: null,
        name: null,
        friendlyName: null
    };
    if (!packagePath && dirPath){
        packagePath = path.join(dirPath,"package.json");
    }
    ({ 
        hostname: info.hostname, 
        port: info.port,
        name: info.name
    } = resolvePackage( { mainFilePath: packagePath }));
    info.friendlyName = formatComponentName(info.name);
    return info;
};

const getModuleInfo = ({ moduleName }) => {
    let info = { 
        packagePath: null, 
        resolvedPath: null,
        hostname: null,
        port: null,
        name: null,
        friendlyName: null
    };
    ({ packagePath: info.packagePath, resolvedPath: info.resolvedPath } = resolveModule(moduleName));
    if (!info.packagePath || !info.resolvedPath){
        return info;
    }
    ({ 
        name: info.name, 
        hostname: info.hostname, 
        port: info.port, 
        friendlyName: info.friendlyName
    } = getPackageInfo({ packagePath: info.packagePath }));
    return info;
};

module.exports = {
    events: {
        register: async ({ componentModule, componentParentModuleName }) => {
            if (!componentModule){
                throw new Error("missing parameter: componentModule");
            }
            if (!componentParentModuleName){
                throw new Error("missing parameter: componentParentModuleName");
            }
            if (!componentModule.filename){
                throw new Error("parameter: componentModule is not of type module");
            }
            let componentModulePackage = getPackageInfo({ packagePath: componentModule.filename });
            const events = module.exports.events;
            events[formatComponentName(componentModulePackage.name)] = {
                subscribe: async ({ name, overwriteDelegate = true }, callback) => {
                    await delegate.register({ context: componentModulePackage.name, name, overwriteDelegate }, callback);
                },
                publish: async ( { name, wildcard }, params) => {
                    await delegate.call({ context: componentParentModuleName, name, wildcard }, params);
                }
            };
        },
        loaded: async (callback) => {
            await delegate.register({ context: "global", name: "loaded", overwriteDelegate: true }, callback);
        },
        broadcast: async ({ name }, params) => {
            await delegate.call({ context: "global", name, wildcard: null }, params);
        }
    },
    load: async ({ moduleName, gitUsername }) => {
        if (!gitUsername){
            throw new Error("missing parameter: gitUsername");
        }
        if (!moduleName){
            throw new Error("missing parameter: moduleName");
        }
        let moduleInfo = getModuleInfo({ moduleName });
        if (!moduleInfo.resolvedPath || !moduleInfo.packagePath){
           await installModule({ gitUsername, moduleName });
           moduleInfo = getModuleInfo({ moduleName });
        }
        const loadedModule = require(moduleInfo.resolvedPath);
        module.exports[moduleInfo.friendlyName] = loadedModule;
        await module.exports.events.broadcast({ name: "loaded" }, {
            module: loadedModule,
            config: moduleInfo
        });
    }
};