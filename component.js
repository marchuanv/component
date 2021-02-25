const npm = require("npm");
const path = require("path");
const fs = require('fs');

const installModule = (moduleName) => {
    return new Promise((resolve, reject) => {
        npm.load( (err) => {
            if (err){
                return reject(err);
            }
            npm.commands.install([moduleName],(err) => {
                if (err){
                    return reject(err.stderr);
                }
                resolve();           
            });
            npm.on("log", function (message) {
                console.log(message);
            });
        });
    });
};

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
}

const knownCompponents = [];
const requiredModules = [];
const events = {};
module.exports = {
    require: (moduleName, { gitUsername }) => {
        return new Promise(async (resolve) => {
            if (requiredModules.find(modName => modName === moduleName)){
                return resolve();
            }
            let moduleToInstall =  moduleName;
            if (gitUsername){
                moduleToInstall = `git+https://github.com/${gitUsername}/${moduleName}.git`;
            }
            await installModule(moduleToInstall);
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
                const results = {};
                const { name, hostname, port } = package;
                if (moduleName.startsWith("component")){
                    results["hostname"] = hostname;
                    results["port"] = port;
                    results["name"] = name;
                    if (!hostname || !port){
                        throw new Error(`failed to register ${moduleName}, package.json requires hostname and port configuration`);
                    }
                    if (!knownCompponents.find(m => m.name === name)){
                        knownCompponents.push({ name, hostname, port })
                    }
                }
                results[formatModuleName(moduleName)] = require(moduleName);
                requiredModules.push(moduleName);
                for(const dependency of dependencies) {
                    const dependencyVal = package.dependencies[dependency];
                    module.exports.events.onRegister(dependency,(res) => {
                        results[formatModuleName(dependency)] = res;
                    });
                    module.exports.require(dependency, { gitUsername: dependencyVal.indexOf("git") > -1 });
                };
                const callback = module.exports.find({ moduleName, eventType: "register" });
                if (callback){
                    await callback(results);
                }
            } else {
                throw new Error(`failed to register ${moduleName}, could not resolve ${moduleName}, see npm logs it might not be installed.`);
            }
            resolve();
        });
    },
    events: {
        on: ({ moduleName, eventName, eventType }, callback) => {
            let event = events[moduleName];
            if (!event) {
                event = { register: {}, module: {} };
                events[moduleName] = event;
            }
            event[eventType][ eventName || moduleName ] = callback;
        },
        find: ({ moduleName, eventName, eventType }) => {
            let event = events[moduleName];
            if (event) {
                return event[eventType][eventName || moduleName];
            }
        }
    }
};