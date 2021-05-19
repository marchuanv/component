const { exec } = require("child_process");
const { MessageBusMessage, MessageBusMessageStatus, MessageBusSubscription, MessageBus } = require("component.messagebus");
const messagebus = new MessageBus();
const logging = require("component.logging");

function Component( { username, componentConfig }) {
    this.name = componentConfig.name;
    this.username = username;
    this.installing = false;
    this.exports = {};
    this.config = componentConfig;
};

Component.prototype.subscribe = async function(subscription) {
    if (subscription instanceof MessageBusSubscription) {
        subscription.channels.push(this.name);
        subscription.validate();
        await messagebus.subscribe(subscription);
    } else {
        throw new Error("subscription is not of type: MessageBusSubscription");
    }
};

Component.prototype.publish = async function(message) {
    if (message instanceof MessageBusMessage) {
        for(const { moduleName } of this.config.dependencies){
            message.extend({ propertyName: "channel", propertyValue: moduleName });
            message.validate();
            await messagebus.publish(message);
        };
    } else {
        throw new Error("message is not of type: MessageBusMessage");
    }
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

module.exports = { Component, MessageBusMessage, MessageBusMessageStatus, MessageBusSubscription };