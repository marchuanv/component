const Module = require('module');
const npm = require("npm");
const path = require("path");
const fs = require('fs');
const originalRequire = Module.prototype.require;
const _cache = [];

const findModules = (parent, module, checkedModules) => {
    let foundModules = [];
    if (!checkedModules){
        checkedModules = [];
    }
    if (parent.filename.indexOf(module) > -1) {
        foundModules.push(parent);
        return foundModules;
    }
    if (checkedModules.find(m => m.filename === parent.filename)){
        return foundModules;
    }
    checkedModules.push(parent);
    for(const child of parent.children) {
        foundModules = foundModules.concat(findModules(child, module, checkedModules));
    };
    return foundModules;
}


// const findPackages = (checkedPages) => {
//     let foundPackages = [];
//     if (!checkedPages){
//         checkedPages = [];
//     }

//     if (parent.filename.indexOf(module) > -1) {
//         foundModules.push(parent);
//         return foundModules;
//     }
//     if (checkedModules.find(m => m.filename === parent.filename)){
//         return foundModules;
//     }
//     checkedModules.push(parent);
//     for(const child of parent.children) {
//         foundModules = foundModules.concat(findModules(child, module, checkedModules));
//     };
//     return foundModules;
// }

// require: function (options) {
//     lock = true;
//     setTimeout(() => {
//         lock = false;
//     },1000);
//     let { moduleName, callingModule, cache } = options;
//     if (!moduleName){
//         moduleName = options;
//         cache = true;
//     }
//     let required = null;
//     if (cache){
//         required = originalRequire.apply(this, [moduleName]);
//     } else {
//         const resolvedModuleName = require.resolve(moduleName);
//         if (resolvedModuleName){
//             delete require.cache[resolvedModuleName];
//             required = require(moduleName);
//         } else {
//             throw new Error(`could not resolve ${moduleName}`);
//         }
//     }
//     if (callingModule){
//         let rootMod;
//         let mod = module;
//         while(mod){
//             rootMod = mod;
//             mod = mod.parent;
//         };
//         const foundModules = findModules(rootMod, moduleName);
//         for(const mod of foundModules){
//             if (!mod.parentSet){
//                 mod.parent = callingModule;
//                 mod.parentSet = true;
//             }
//         };
//     }
//     return required;
// },

const installModule = (moduleName) => {
    return new Promise((resolve) => {
        npm.load( () => npm.commands.install([moduleName],() => {
            resolve();           
        }));
    });
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
const eventRegister = [];
module.exports = {
    require: (moduleName, { gitUsername }) => {
        return new Promise(async (resolve) => {
            let moduleToInstall =  moduleName;
            if (gitUsername){
                moduleToInstall = `git+https://github.com/${gitUsername}/${moduleName}.git`;
            }
            await installModule(moduleToInstall);
            const resolvedPath = require.resolve(moduleName);
            if (resolvedPath){
                const package = require(`${resolvedPath.replace(`${moduleName}.js`,"package.json")}`);
                let dependencies = [];
                if (package.dependencies){
                    dependencies = dependencies.concat(Object.getOwnPropertyNames(package.dependencies));
                }
                const results = {};
                const { name, hostname, port } = package;
                if (moduleName.startsWith("component")){
                    results["hostname"] = hostname;
                    results["port"] = port;
                    results["name"] = name;
                    if (!hostname || !port){
                        throw new Error(`failed to register ${moduleName}, package.json requires hostname and port configuration`);
                    }
                    if (!knownCompponents.find(m => m.name === name)){
                        knownCompponents.push({ name, hostname, port })
                    }
                }
                results[formatModuleName(moduleName)] = require(moduleName);
                for(const dependency of dependencies) {
                    const dependencyVal = package.dependencies[dependency];
                    module.events.onRegister(dependency,(res) => {
                        results[formatModuleName(dependency)] = res;
                    });
                    module.exports.require(dependency, { gitUsername: dependencyVal.indexOf("git") > -1 });
                };
                const event = eventRegister.find(e => e.moduleName === moduleName);
                if (event){
                    await event.callback(results);
                }
            } else {
                throw new Error(`failed to register ${moduleName}, could not resolve ${moduleName}, see npm logs it might not be installed.`);
            }
            resolve();
        });
    },
    cache: {
        add: ( name, value) => {
            const existingItem = module.exports.cache.find(name);
            if (existingItem){
                existingItem.value = value;
            } else {
                _cache.push({ name, value });
            }
        },
        find: (name) => {
            return _cache.find( i => i.name === name);
        }
    },
    events: {
        onRegister: (moduleName, callback) => {
            eventRegister.push({ moduleName, callback });
        }
    }
};
Module.prototype.require = module.exports.require;