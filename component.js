const delegate = require("component.delegate");
const { component } = require("./package.json");
const logging = require("component.logging");
const { Component } = require("./prototypes.js");
const config = require("./config.js");

const ensureInstalledComponent = async (componentConfig) => {
    const { gitUsername } = component;
    const com = new Component({ username: gitUsername, componentConfig, logging });
    if (!(await com.isInstalled())) {
        await com.install();
    }
    await com.reload();
    await logging.register({ moduleName: componentConfig.name });
    return com;
};

module.exports = {
    registry: [],
    load: async (componentModule = "") => {
        if (!componentModule){
            throw new Error("invalid parameter: componentModule");
        }
        const componentConfig = await getComponentConfig(componentModule);
        let registeredComponent = module.exports.registry.find(com => com.name === componentConfig.name);
        if (!registeredComponent) {
            registeredComponent = await ensureInstalledComponent(componentConfig);
            module.exports.registry.push(registeredComponent);
        }
        for(const { moduleName } of registeredComponent.publishers) {
            await module.exports.register(moduleName);
        };
        registeredComponent.exports = require(registeredComponent.resolvedPath);
        const results = {};
        results[formatComponentName(registeredComponent.name)] = registeredComponent;
        return results;
    },
    on: async ({ eventName }, callback) => {
        return await delegate.register({ context: "global", name: eventName, overwriteDelegate: true }, callback);
    }
};