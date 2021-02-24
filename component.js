const dependencies = [];
module.exports = {
    require: (moduleName, cache = true) => {
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
           // dependencies.push({ name: moduleName, dependency: dependantModuleName });
            return required;
        }
    },
    getDependency: (moduleName) => {
        return dependencies.find(d => d.name === moduleName).dependency;
    }
};