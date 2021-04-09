
const fs = require('fs');
const path = require("path");

const resolvePackage = ({ mainFilePath }) => {
    const mainFileName = path.basename(mainFilePath);
    let packagePath = mainFilePath.replace(mainFileName,"package.json");
    if (!fs.existsSync(packagePath)){
        return undefined;
    }
    return require(packagePath);
};

const resolveModule = (componentModule) => {
    const moduleName = typeof componentModule === "string" ? componentModule: path.basename(componentModule.path);
    let { resolvedPath, packagePath } = {};
    try {
        resolvedPath = require.resolve(moduleName);
        const fileName = path.basename(resolvedPath);
        packagePath = resolvedPath.replace(fileName, "package.json");
        return { resolvedPath, packagePath };
    } catch(err) {

        let resolvedDir = path.join(__dirname,"../../");
        packagePath = path.join(resolvedDir, "package.json");
        let package = resolvePackage({ mainFilePath: packagePath });
        resolvedPath = package? path.join(resolvedDir, package.main) : null;
        packagePath = package? packagePath : null;
        if (package.name !== moduleName){
            resolvedPath = null;
            packagePath = null;
        }

        if (!resolvedPath && !packagePath){
            resolvedDir = path.join(__dirname,"node_modules", moduleName);
            if (__dirname.indexOf("node_modules") > -1){
                resolvedDir = path.join(__dirname,"../");
                resolvedDir = path.join(resolvedDir, moduleName);
            }
            packagePath = path.join(resolvedDir, "package.json");
            let package = resolvePackage({ mainFilePath: packagePath });
            resolvedPath = package? path.join(resolvedDir, package.main) : null;
            packagePath = package? packagePath : null;    
        }

        return { resolvedPath, packagePath, name: moduleName };
    }
};

const getPackage = ({ dirPath, packagePath }) => {
    if (!packagePath && dirPath){
        packagePath = path.join(dirPath, "package.json");
    }
    return resolvePackage({ mainFilePath: packagePath });
};

const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
};

const formatComponentName = (name) => {
    let parts = name.split(".");
    const componentIndex = parts.findIndex(x => x.toLowerCase() === "component");
    parts.splice(componentIndex,1);
    name = parts[0];
    delete parts[0];
    for(const part of parts){
        name = name + capitalize(part);
    };
    return name.replace("component","");
};


function ComponentConfig({ componentModule }) {
    this.componentModule = componentModule;
    this.packagePath = null;
    this.resolvedPath = null;
    this.name = null;
    this.friendlyName = null;
};

ComponentConfig.prototype.load = async function({ channel }, callback) {
    ({ packagePath: this.packagePath, resolvedPath: this.resolvedPath , name: this.name } = resolveModule(this.componentModule));
    if (!this.packagePath || !this.resolvedPath){
        return;
    }
    let { name, component } = getPackage(config);
    component.name = name;
    Object.assign(this, component);
    this.friendlyName = formatComponentName(config.name);
    return config;
};

module.exports = { ComponentConfig };