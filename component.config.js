const path = require("path");
const loadedComponents = [];
module.exports = (() => {
    const moduleName =  path.basename(module.parent.filename).replace(".js","");
    const moduleConfig = require(module.parent.filename.replace(`${moduleName}.js`,"package.json"));
    if (!moduleConfig){
        throw new Error(`failed to load configuration for module:"${moduleName}"`);
    }
    if (!moduleConfig.hostname || !moduleConfig.port){
        throw new Error(`every component's package.json file requires a default hostname and port`);
    }
    if (process.env.PORT){
        moduleConfig.port = process.env.PORT;
    }
    const { name, hostname, port } = moduleConfig;
    loadedComponents.push({ modulename: name, hostname, port });
    return { 
        name, 
        hostname, 
        port,
        dependencies: () => {
            const matchingComponents = [];
            for(const dependency in moduleConfig.dependencies){
                const matchingComponent = loadedComponents.find(c => c.modulename === dependency);
                if (matchingComponent){
                    matchingComponents.push(matchingComponent);
                }
            };
            return matchingComponents;
        }
    };
})();