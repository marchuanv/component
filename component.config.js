const path = require("path");
module.exports = (() => {
    const moduleName =  path.basename(module.parent.filename).replace(".js","");
    let moduleConfig = require(module.parent.filename.replace(`${moduleName}.js`,"package.json"));
    if (!moduleConfig){
        moduleConfig = require("./package.json");
    }
    if (process.env.PORT){
        moduleConfig.host.port = process.env.PORT;
    }
    if (!moduleConfig.component) {
        throw new Error(`every component must have a component configuration section.`);
    }
    if (!moduleConfig.component.host) {
        throw new Error(`every component must have a component.host configuration section.`);
    }
    return moduleConfig;
})();