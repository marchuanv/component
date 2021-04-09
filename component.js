const { component } = require("./package.json");
const { Component } = require("./lib/component.js");
const { ComponentConfig } = require("./lib/config.js");

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
            const { gitUsername } = component;
            registeredComponent = new Component({ username: gitUsername, componentConfig });
            if (!(await registeredComponent.isInstalled())) {
                await registeredComponent.install();
            }
            module.exports.registry.push(registeredComponent);
        }
        for(const { moduleName } of registeredComponent.config.dependencies) {
            await module.exports.load(moduleName);
        };
        registeredComponent.exports = require(registeredComponent.config.resolvedPath);
        const results = {
            name: registeredComponent.config.friendlyName
        };
        results[registeredComponent.config.friendlyName] = registeredComponent;
        return results;
    }
};