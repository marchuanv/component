const Module = require('module');
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

let lock = false;

module.exports = {
    require: function (options) {
        lock = true;
        setTimeout(() => {
            lock = false;
        },1000);
        let { moduleName, callingModule, cache } = options;
        if (!moduleName){
            moduleName = options;
            cache = true;
        }
        let required = null;
        if (cache){
            required = originalRequire.apply(this, [moduleName]);
        } else {
            const resolvedModuleName = require.resolve(moduleName);
            if (resolvedModuleName){
                delete require.cache[resolvedModuleName];
                required = require(moduleName);
            } else {
                throw new Error(`could not resolve ${moduleName}`);
            }
        }
        if (callingModule){
            let rootMod;
            let mod = module;
            while(mod){
                rootMod = mod;
                mod = mod.parent;
            };
            const foundModules = findModules(rootMod, moduleName);
            for(const mod of foundModules){
                if (!mod.parentSet){
                    mod.parent = callingModule;
                    mod.parentSet = true;
                }
            };
        }
        return required;
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
    ready: () => {
        return new Promise((resolve)=>{
            if (lock){
                setTimeout(async () => {
                    resolve(await module.exports.ready());
                }, 1000);
            } else {
                resolve();
            }
        });
    }
};
Module.prototype.require = module.exports.require;