const path = require("path");
const Module = require('module');
const cacheRequire = Module.prototype.require;
Module.prototype.require = (module, cache) => {
    if (cache === undefined || cache === null || cache === true){
        return cacheRequire(module);
    } else {
        delete require.cache[require.resolve(module)];
        return require(module);
    }
}
module.exports = {};