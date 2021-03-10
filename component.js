const path = require("path");
const fs = require('fs');
const { exec } = require("child_process");
const Delegate = require("component.delegate");
const { dirname } = require("path");

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

const installModule = ({ gitUsername, moduleName }) => {
    return new Promise(async (resolve, reject) => {
        let moduleToInstall = moduleName;
        if (gitUsername) {
            moduleToInstall = `${gitUsername}/${moduleName}`;
        }
        exec(`npm install ${moduleToInstall} --no-save`, () => {
            const id = setInterval(() => {
                let resolvedPath = path.join(__dirname,"node_modules", moduleName);
                if (__dirname.indexOf("node_modules") > -1){
                    resolvedPath = path.join(__dirname,"../");
                    resolvedPath = path.join(resolvedPath, moduleName);
                }
                if (fs.existsSync(resolvedPath)){
                    clearInterval(id);
                    const packagePath = path.join(resolvedPath,"package.json");
                    const package = require(packagePath);
                    resolve({
                        resolvedPath: path.join(resolvedPath,package.main),
                        packagePath
                    });
                }
            },100);
        });
    });
};

const canResolveModule = (moduleName) => {
    try {
        return require.resolve(moduleName);
    } catch(err) {
        console.log(err);
        return false;
    }
};

const getModuleInfo = ({ moduleName, gitUsername }) => {
    return new Promise(async (resolve) => {
        let resolvedPath = canResolveModule(moduleName);
        let packagePath = (resolvedPath || "" ).replace(`${moduleName}.js`,"package.json");
        if (!resolvedPath){
            ( { resolvedPath, packagePath } = await installModule({gitUsername,moduleName}));
        }
        const { name, hostname, port } = require(packagePath);
        let info = {};
        if (moduleName.startsWith("component")){
            info["hostname"]           = hostname;
            info["port"]               = port;
            info["name"]               = name;
            info["friendlyName"]       = formatModuleName(name);
            info["modulePath"]         = resolvedPath;
            if (!hostname || !port){
                throw new Error(`failed to register ${moduleName}, package.json requires hostname and port configuration`);
            }
        }
        await resolve(info);
    });
};

const delegates = [];

module.exports = {
    delegate: {
        call: async ({ name, wildcard }, params) => {
            for(const del of delegates.filter(d => d.context === parentModuleName)){
                await del.call({ name, wildcard }, params);
            };
        },
        register: async ({ name, overwriteDelegate = true }, callback) => {
            for(const del of delegates.filter(d => d.context === moduleName)){
                await del.register({ name, overwriteDelegate }, callback);
            };
        }
    },
    getInstance: ({ moduleName, gitUsername, parentModuleName }) => {
        return new Promise(async (resolve) => {
            const moduleInfo = await getModuleInfo({ moduleName, gitUsername });

            delegates.push(new Delegate({
                context: moduleName,
                callbackContext: parentModuleName || "None"
            }));

            const instance = require(moduleInfo.modulePath);
            const results = {};
            results[moduleInfo.friendlyName] = instance;
            results["config"] = moduleInfo;
            await resolve(results);
            await this.delegate.call( { name: "acquired" }, results );
            
        });
    }
};