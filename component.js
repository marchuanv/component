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

const installModule = ({ gitUsername, requiredModuleName }) => {
    return new Promise(async (resolve, reject) => {
        let moduleToInstall = requiredModuleName;
        if (gitUsername) {
            moduleToInstall = `${gitUsername}/${requiredModuleName}`;
        }
        exec(`npm install ${moduleToInstall} --no-save`, () => {
            const id = setInterval(() => {
                const resolvedPath = path.join(__dirname,"node_modules", requiredModuleName);
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

const delegates = [];

module.exports = function({ moduleName, gitUsername, parentModuleName }) {
    
    let isReady = false;
    this.name = moduleName;
    this.delegate = {
        call: ({ name, wildcard }, params) => {
            for(const del of delegates.filter(d => d.context === parentModuleName)){
                del.call({ name, wildcard }, params);
            };
        },
        register: ({ name, overwriteDelegate = true }, params) => {
            for(const del of delegates.filter(d => d.context === moduleName)){
                del.register({ name, overwriteDelegate }, params);
            };
        }
    };

    delegates.push(new Delegate({
        context: moduleName,
        callbackContext: parentModuleName
    }));

    const requireExt = (requiredModuleName) => {
        return new Promise(async (resolve, reject) => {
            let resolvedPath = canResolveModule(requiredModuleName);
            let packagePath = (resolvedPath || "" ).replace(`${moduleName}.js`,"package.json");
            if (!resolvedPath){
               ( { resolvedPath, packagePath } = await installModule({gitUsername,requiredModuleName}));
            }
            const requiredModule = require(resolvedPath);
            const { name, hostname, port } = require(packagePath);
            let moduleResults = {};
            if (requiredModuleName.startsWith("component")){
                moduleResults["hostname"]           = hostname;
                moduleResults["port"]               = port;
                moduleResults["name"]               = name;
                if (!hostname || !port){
                    throw new Error(`failed to register ${requiredModuleName}, package.json requires hostname and port configuration`);
                }
            }
            moduleResults[formatModuleName(requiredModuleName)] = requiredModule;
            await resolve(moduleResults);
            await this.delegate.call( { name: "acquired" }, moduleResults );
        });
    };
    requireExt(moduleName).then(() => {
        isReady = true;
    });

    this.ready = () => {
        return new Promise(async (resolve) => {
            setTimeout( async () => {
                if (isReady){
                    resolve(isReady);
                } else {
                    resolve(this.ready());
                }
            },100)
        });
    };

};