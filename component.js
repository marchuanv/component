const path = require("path");
const Module = require('module');
const cacheRequire = Module.prototype.require;
Module.prototype.require = (module, cache = true) => {
    if (cache){
        return cacheRequire(module);
    } else {
        delete require.cache[require.resolve(module)];
        return require(module);
    }
}
module.exports = {};