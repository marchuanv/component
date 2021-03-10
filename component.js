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

module.exports = function({ moduleName, parentModuleName }) {

    this.name = moduleName;
    knownComponents.push(this);
    
    this.delegate = new Delegate( { 
        context: moduleName,
        callbackContext: parentModuleName || "N/A"
    });
    
    this.require = ( moduleName, { gitUsername } ) => {
        return new Promise(async (resolve) => {
            let resolvedPath = require.resolve(moduleName);
            if (!resolvedPath){
                let moduleToInstall;
                if (gitUsername) {
                    moduleToInstall = `${gitUsername}/${moduleName}`;
                }
                await installModule(moduleToInstall);
                resolvedPath = require.resolve(moduleName);
            }
            let moduleResults = {};
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
            for(const knownComponent of knownComponents){
                await knownComponent.delegate.call( { name: "acquired" }, moduleResults );
            };
        });
    };
};