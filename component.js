const path = require("path");
const fs = require('fs');
const { exec } = require("child_process");
const Delegate = require("component.delegate");

const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
}

const formatModuleName = (moduleName) => {
    let parts = moduleName.split(".");
    let name = parts[0];
    delete parts[0];
    for(const part of parts){
        name = name + capitalize(part);
    };
    return name;
};

const installModule = (moduleToInstall) => {
    return new Promise(async (resolve, reject) => {
        exec(`npm install ${moduleToInstall}`, (error, stdout, stderr) => {
            if (error) {
                return reject(error.message);
            }
            if (stderr) {
                if (stderr.indexOf("WARN") > -1){
                    return resolve();
                }
                return reject(stderr);
            }
            resolve();
        });
    });
};

const getPackage = (moduleName, packageDir) => {
    let _path = packageDir.replace(`${moduleName}.js`,"package.json");
    while(!fs.existsSync(_path)){
        const dirPath = path.dirname(_path);
        const dirName = path.basename(dirPath);
        const indexPos = dirPath.lastIndexOf(dirName);
        _path = path.join(dirPath.substring(0, indexPos-1),"package.json");
    };
    return require(_path);
};

const knownComponents = [];

module.exports = function(moduleName) {

    this.name = moduleName;

    const lastAddedKnownComponent = knownComponents[knownComponents.length-1];
    if (lastAddedKnownComponent){
        lastAddedKnownComponent.delegate = new Delegate( { 
            context: lastAddedKnownComponent.name,
            callbackContext: this.name
        });
    
    }
    
    this.delegate = null;
    
    this.require = ( moduleName, { gitUsername } ) => {
        return new Promise(async (resolve) => {
            
            let moduleToInstall =  moduleName;
            
            const installedNodeModules = []; 
            let modulesDir = path.join(__dirname, "../");

            if (modulesDir.indexOf("node_modules") === -1){
                modulesDir = path.join(__dirname, "node_modules");
            }
           
            fs.readdirSync(modulesDir).forEach(dirName => {
                installedNodeModules.push(dirName);
            });
            
            const canInstallModule = !installedNodeModules.find(modName => modName === moduleName);
            if (canInstallModule){
                if (gitUsername) {
                    moduleToInstall = `${gitUsername}/${moduleName}`;
                }
                await installModule(moduleToInstall);
            }

            const resolvedPath = require.resolve(moduleName);
            if (resolvedPath){
                const { name, hostname, port } = getPackage(moduleName, resolvedPath);
                if (moduleName.startsWith("component")){
                    moduleResults["hostname"] = hostname;
                    moduleResults["port"] = port;
                    moduleResults["name"] = name;
                    if (!hostname || !port){
                        throw new Error(`failed to register ${moduleName}, package.json requires hostname and port configuration`);
                    }
                }
                const requiredModule = require(moduleName);
                moduleResults[formatModuleName(moduleName)] = requiredModule;
                await resolve(moduleResults);
                await this.delegate.call( { name: "acquired" }, moduleResults );
            } else {
                reject(new Error(`failed to register ${moduleName}, could not resolve ${moduleName}, see npm logs it might not be installed.`));
            }
        });
    };

    knownComponents.push(this);

};