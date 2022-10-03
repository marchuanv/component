const { readFileSync, writeFileSync, existsSync, mkdirSync } = require('fs');
const path = require('path');
const utils = require('utils');
const factoryInfoTemplate = readFileSync(path.join(__dirname, 'templates', 'factory.info.template'),'utf8');
const typeInfo = require(path.join(__dirname, 'type.info.json'));
const factoryInfoPath = path.join(__dirname, 'factory.info.json');
let factoryInfo = require(factoryInfoPath);

for(const typeName of Object.keys(typeInfo)) {

    const info = typeInfo[typeName];
    const scriptName = typeName.toLowerCase();
    const factoryGeneratedDir = path.join(__dirname, '../lib', 'factory', 'generated', scriptName);

    const factoryScriptFileName = `${scriptName}.factory.js`;
    const factoryMinScriptFileName = `${scriptName}.factory.min.js`;
    const factoryContainerJsonFileName = `${scriptName}.factory.container.json`;

    const factoryScripPath = path.join(factoryGeneratedDir, factoryScriptFileName).replace(/\\/g,'//');
    const factoryMinScriptPath = path.join(factoryGeneratedDir, factoryMinScriptFileName).replace(/\\/g,'//');
    const factoryContainerFilePath = path.join(factoryGeneratedDir, factoryContainerJsonFileName).replace(/\\/g,'//');
    
    const ctorArgumentNames =  info.children.filter(child => child.variableName !== 'factoryContainerBindingName').reduce((params, child) => {
        if (!child.prototypePath) {
            params.push(child.variableName);
        }
        return params;
    },[]);
    const ctorArgumentsWithBindingNames = utils.getJSONObject(utils.getJSONString(ctorArgumentNames));
    ctorArgumentsWithBindingNames.push('factoryContainerBindingName');

    const factoryInfoJson = factoryInfoTemplate
        .replace(/\[TypeName\]/g, typeName)
        .replace(/\[FactoryScriptPath\]/g, factoryScripPath)
        .replace(/\[MinFactoryScriptPath\]/g, factoryMinScriptPath)
        .replace(/\[FactoryContainerFilePath\]/g, factoryContainerFilePath)
        .replace(/\[CtorArgumentNames\]/g, utils.getJSONString(ctorArgumentNames))
        .replace(/\[CtorArgumentsWithBindingNames\]/g, utils.getJSONString(ctorArgumentsWithBindingNames));
    const _factoryInfo = utils.getJSONObject(factoryInfoJson);
    factoryInfo[typeName] = _factoryInfo;
};
writeFileSync(factoryInfoPath, utils.getJSONString(factoryInfo), 'utf8');