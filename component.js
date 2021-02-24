const cache = [];
module.exports = {
    require: (moduleName, cache = true) => {
        if (cache){
            return require(moduleName);
        } else {
            delete require.cache[require.resolve(moduleName)];
            return require(moduleName);
        }
    },
    cache: {
        add: (name, value) => {
            cache.push({ name,value });
        },
        find: (name) => {
            return cache.find( x => x.name === name );
        }
    }
};