const { exec } = require("child_process");
const delegate = require("component.delegate");
const logging = require("component.logging");
const utils = require("utils");

let componentCallstack = [];
let currentControlId;
    
function Component( { username, componentConfig }) {
    this.name = componentConfig.name;
    this.username = username;
    this.installing = false;
    this.exports = {};
    this.config = componentConfig;
};

Component.prototype.receiveDependantComponentNotifications = async function(callback) {
    for(const { moduleName } of this.config.dependencies){
        return await delegate.register({ 
            context: moduleName,
            name: this.config.channel,
            overwriteDelegate: true
        }, callback );
    };
};

Component.prototype.notifyDependantComponents = async function(params) {
    if (currentControlId) {
        componentCallstack.unshift({ Id: currentControlId, componentName: this.name });
    }
    const { controlId, results } = await delegate.call({ context: this.name, name: this.config.channel }, params);
    if (currentControlId !== controlId) {
        currentControlId = controlId;
    }
    return results;
};

Component.prototype.inCallstack = async function() {
    return componentCallstack.find(cc => cc.componentName === this.name) !== undefined;
};

Component.prototype.getCallstack = async function() {
    let clonedComponentCallstack = utils.getJSONObject(utils.getJSONString(componentCallstack));
    return clonedComponentCallstack.filter(cc => cc.Id === currentControlId);
};

Component.prototype.log = async function(message, data = null) {
    return logging.write(this.name, message, data);
};

Component.prototype.isInstalled = async function() {
    this.config.load();
    if (this.config.resolvedPath && this.config.packagePath) {
        this.installing = false;
        return true;
    }
    return false;
};

Component.prototype.install = function() {
    return new Promise(async(resolve) => {
        let moduleToInstall = `${this.username}/${this.name}`;
        if (await this.isInstalled()){
            await this.log(`${moduleToInstall} installed.`);
            return await resolve();
        } else if (!this.installing) {
            await this.log(`installing ${moduleToInstall}`);
            exec(`npm install ${moduleToInstall} --no-save --no-package-lock`, () => {});
            this.installing = true;
        }
        setTimeout( async () => {
            resolve(await this.install());
        }, 1000);
    });
};

module.exports = { Component };