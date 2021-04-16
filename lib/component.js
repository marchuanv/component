const { exec } = require("child_process");
const delegate = require("component.delegate");
const logging = require("component.logging");
const { stat } = require("fs");

function Component( { username, componentConfig }) {
    this.name = componentConfig.name;
    this.username = username;
    this.installing = false;
    this.exports = {};
    this.config = componentConfig;
};

Component.prototype.subscribe = async function(validateCallback, callback) {
    for(const { moduleName } of this.config.dependencies){
        return await delegate.subscribe({ channel: moduleName, callback, validateCallback });
    };
};

Component.prototype.publish = async function(data) {
    const subscribers = await delegate.publish({ channel: this.name, message: data });
    const succesfulSubscriber = subscribers.find(s => s.success) || {}; //First Successful Subscriber
    if (succesfulSubscriber) {
        return succesfulSubscriber;
    } else { //No Successful Subscribers
        const unsuccesfulSubscriber = subscribers.find(s => !s.success) || {}; //First Unsuccessful Subscriber
        if (unsuccesfulSubscriber) {
            return unsuccesfulSubscriber;
        }
    }
};

Component.prototype.inCallstack = async function({ success = true }) {
    return await delegate.inCallstack({ context: this.name, success });
};

Component.prototype.getCallstack = async function({ latest = true }) {
    return await delegate.getCallstack({ context: this.name, latest });
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