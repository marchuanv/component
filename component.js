const _cache = [];
module.exports = {
    require: (moduleName, callingModuleName, cache = true) => {
        let required = null;
        if (cache){
            required = require(moduleName);
        } else {
            const resolvedModuleName = require.resolve(moduleName);
            if (resolvedModuleName){
                delete require.cache[resolvedModuleName];
                required = require(moduleName);
            } else {
                throw new Error(`could not resolve ${moduleName}`);
            }
        }
        if (required){
            let parent = module.parent;
            while(parent.filename.indexOf(callingModuleName) === -1){
                parent = parent.parent;
            }
            module.exports.cache.add( moduleName, { callingModuleName, callingModuleFileName: parent.filename });
            return required;
        }
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
    }
};
module.require = module.exports.require;