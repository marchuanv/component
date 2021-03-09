const delegate = require("component.delegate");
const path = require("path");
const fs = require('fs');
const { exec } = require("child_process");

const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
}

const formatModuleName = (moduleName) => {
    let name = moduleName.split(".");
    if (Array.isArray(name) && name.length > 0) {
        name = name[0] + capitalize(name[1]);
    }
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

module.exports = {
    require: ( moduleName, { gitUsername } ) => {
        return new Promise(async (resolve) => {
            
            let moduleToInstall =  moduleName;
            
            const installedNodeModules = []; 
            fs.readdirSync(path.join(__dirname, "../")).forEach(dirName => {
                installedNodeModules.push(dirName);
            });

            if (!installedNodeModules.find(modName => modName === moduleName)){
                if (gitUsername) {
                    moduleToInstall = `${gitUsername}/${moduleName}`;
                }
                await installModule(moduleToInstall);
            }
            const resolvedPath = require.resolve(moduleName);
            if (resolvedPath){
                let package = {};
                let _path = resolvedPath.replace(`${moduleName}.js`,"package.json");
                while(!fs.existsSync(_path)){
                    const dirPath = path.dirname(_path);
                    const dirName = path.basename(dirPath);
                    const indexPos = dirPath.lastIndexOf(dirName);
                    _path = path.join(dirPath.substring(0, indexPos-1),"package.json");
                };
                package = require(_path);
                
                let dependencies = [];
                if (package.dependencies){
                    dependencies = dependencies.concat(Object.getOwnPropertyNames(package.dependencies));
                }
                const moduleResults = {};
                const { name, hostname, port } = package;
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
                resolve(moduleResults);
                await delegate.call( { context: "module", name: "register" }, moduleResults );
            } else {
                reject(new Error(`failed to register ${moduleName}, could not resolve ${moduleName}, see npm logs it might not be installed.`));
            }
        });
    }
};