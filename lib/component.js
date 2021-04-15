const { exec } = require("child_process");
const delegate = require("component.delegate");
const logging = require("component.logging");
const utils = require("utils");

let publishCallstack = [];
    
function Component( { username, componentConfig }) {
    this.name = componentConfig.name;
    this.username = username;
    this.installing = false;
    this.exports = {};
    this.config = componentConfig;
};

Component.prototype.receiveComponentNotifications = async function(callback) {
    for(const { moduleName } of this.config.dependencies){
        return await delegate.register({ 
            context: moduleName,
            name: this.config.channel,
            overwriteDelegate: true
        }, callback );
    };
};

Component.prototype.notifyComponentDependencies = async function(params) {
    params.callingComponent = this;
    const results = await delegate.call({ context: this.name, name: this.config.channel }, params);
    publishCallstack.push({ componentName: this.name, date: (new Date()).getTime() });
    publishCallstack = publishCallstack.sort((x, y) => y.date - x.date);
    return results;
};

Component.prototype.getCallStack = async function({ latest = true }) {
    const clonedPublishCallstack = utils.getJSONObject(utils.getJSONString(publishCallstack));
    const stack = [];
    while(clonedPublishCallstack.length > 0) {
        if (latest) {
            const comp = clonedPublishCallstack.shift();
            if (comp.componentName === this.name) {
                break;
            }
            stack.unshift(comp);
        } else {
            const comp = clonedPublishCallstack.pop();
            if (comp.componentName === this.name) {
                stack = clonedPublishCallstack;
                break;
            }
        }
    };
    return stack;
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