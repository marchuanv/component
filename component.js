const { component } = require("./package.json");
const logging = require("component.logging");
const { Component } = require("./componentType.js");
const { ComponentConfig } = require("./componentConfigType.js");

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
        const componentConfig = new ComponentConfig(componentModule);
        componentConfig.load();
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
    }
};