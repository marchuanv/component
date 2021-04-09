const { exec } = require("child_process");

function Component( { username, componentConfig, logging }){
    this.name = componentConfig.name;
    this.username = username;
    this.installing = false;
    this.exports = {};
    this.config = componentConfig;
    this.logging = logging;
};

Component.prototype.subscribe = async function({ channel }, callback) {
    for(const { moduleName } of this.publishers){
        await delegate.register({ context: moduleName, name: channel, overwriteDelegate: true }, callback);
    };
};

Component.prototype.publish =  async function({ channel }, params) {
    return await delegate.call({ context: this.name, name: channel }, params);
};

Component.prototype.log = async function(message, data = null) {
    return this.logging.write(this.name, message, data);
};

Component.prototype.isInstalled = async function() {
    if (this.config.resolvedPath && this.config.packagePath) {
        this.installing = false;
        return true;
    }
    return false;
};

Component.prototype.reload = async function() {
    Object.assign(this, this.config);
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

module.exports = {
    Component
};