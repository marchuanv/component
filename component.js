const {PluginManager} = require("live-plugin-manager");
const path = require("path");
const fs = require('fs');
const utils = require("utils");

const manager = new PluginManager({pluginsPath: path.join(__dirname,"node_modules")});
const installModule = async (moduleName) => {
    await manager.installFromGithub(moduleName);
};

const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
}

const formatModuleName = (moduleName) => {
    let name = moduleName.split(".");
    if (Array.isArray(name) && name.length > 0) {
        name = name[0] + capitalize(name[1]);
    }
    return name;
}

const knownCompponents = [];
const requiredModules = [];
const _events = { };
module.exports = {
    require: (moduleName, { gitUsername }) => {
        return new Promise(async (resolve) => {
            if (requiredModules.find(modName => modName === moduleName)){
                return resolve();
            }
            let moduleToInstall =  moduleName;
            if (gitUsername) {
                moduleToInstall = `${gitUsername}/${moduleName}`;
            }
            await installModule(moduleToInstall);
            const resolvedPath = require.resolve(moduleName);
            if (resolvedPath){
                let package = {};
                let _path = resolvedPath.replace(`${moduleName}.js`,"package.json");
                while(!fs.existsSync(_path)){
                    const dirPath = path.dirname(_path);
                    const dirName = path.basename(dirPath);
                    const indexPos = dirPath.lastIndexOf(dirName);
                    _path = path.join(dirPath.substring(0, indexPos-1),"package.json");
                };
                package = require(_path);
                
                let dependencies = [];
                if (package.dependencies){
                    dependencies = dependencies.concat(Object.getOwnPropertyNames(package.dependencies));
                }
                const moduleResults = {};
                const globalResults = {};
                const { name, hostname, port } = package;
                if (moduleName.startsWith("component")){
                    moduleResults["hostname"] = hostname;
                    moduleResults["port"] = port;
                    moduleResults["name"] = name;
                    if (!hostname || !port){
                        throw new Error(`failed to register ${moduleName}, package.json requires hostname and port configuration`);
                    }
                    if (!knownCompponents.find(m => m.name === name)){
                        knownCompponents.push({ name, hostname, port })
                    }
                }
                moduleResults[formatModuleName(moduleName)] = require(moduleName);
                globalResults["module"] = moduleResults;
                requiredModules.push(moduleName);
                const callbacks = module.exports.events.find({ moduleName, eventType: "register" });
                for(const callback of callbacks){
                    await callback(moduleResults);
                }
                const globalCallbacks = module.exports.events.find({ moduleName: "global", eventType: "register" });
                for(const callback of globalCallbacks){
                    await callback(globalResults);
                }
            } else {
                throw new Error(`failed to register ${moduleName}, could not resolve ${moduleName}, see npm logs it might not be installed.`);
            }
            resolve();
        });
    },
    events: {
        on: ({ moduleName, eventName, eventType }, callback) => {
            let name = [ eventName || moduleName || "global" ];
            if (!_events[name]) {
                _events[name] = [];
            }
            if (!_events[name][eventType]) {
                _events[name][eventType] = [];
            }
            _events[name][eventType].push(callback);;
        },
        find: ({ moduleName, eventName, eventType }) => {
            let name = [ eventName || moduleName || "global" ];
            return _events[name][eventType];
        }
    }
};