const { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } = require('fs');
const path = require('path');
const utils = require('utils');
const libDir = path.join(__dirname, '../lib');
const specsFactoryDir = path.join(__dirname, '../spec', 'factory');
const rootScripts = readdirSync(libDir, { withFileTypes: true }).filter(dirent => dirent.isFile() && dirent.name.indexOf('.factory.js') === -1).map(file => path.join(libDir, file.name));
const httpScripts = readdirSync(path.join(libDir, 'http'), { withFileTypes: true }).filter(dirent => dirent.isFile() && dirent.name.indexOf('.factory.js') === -1).map(file => path.join(libDir, 'http', file.name));
const websocketScripts = readdirSync(path.join(libDir, 'websocket'), { withFileTypes: true }).filter(dirent => dirent.isFile() && dirent.name.indexOf('.factory.js') === -1).map(file => path.join(libDir, 'websocket', file.name));
const scripts = rootScripts.concat(httpScripts.concat(websocketScripts));
const factoryTemplate = readFileSync(path.join(__dirname,'factory.template'),'utf8');
const factorySpecTemplate = readFileSync(path.join(__dirname,'factory.spec.template'),'utf8');

if (!existsSync(specsFactoryDir)){
    mkdirSync(specsFactoryDir);
}

const typeInfo = [];
const walkState = []
function walkDependencies({ callback, reset, info, index }) {
    let ws = walkState.find(ws => ws.Id === (info && info.Id));
    if (!ws) {
        if (!info) {
            info = typeInfo.find(inf => walkState.find(ws => ws.Id === inf.Id) === undefined);
        }
        ws = { Id: info.Id };
        walkState.push(ws);
        callback({ info });
    }
    let whitespace = '';
    for(let i = 0; i < index; i++) {
        whitespace = whitespace + ' ';
    }
    console.log(`${whitespace}TypeInfo: `, info.typeName);
    if (info.dependencies.length === 0) {
        walkDependencies({ callback, reset, index: 0 });
    } else {
        for(const dep of info.dependencies) {
            walkDependencies({ callback, reset, info: dep, index: index + 1 });
        }
    }
}

for(const script of scripts) {
    const scriptName = path.basename(script).replace(path.extname(script),'');
    const scriptDir = script.replace(`\\${scriptName}.js`,'');
    const factoryScriptName = `${scriptName}.factory.js`;
    const specScriptName = `${scriptName}.factory.spec.js`;
    const factoryScriptPath = path.join(scriptDir, factoryScriptName);
    const specScriptPath = path.join(specsFactoryDir, specScriptName);
    const sc = require(script);
    const keys = Object.keys(sc);
    for(const key of keys){
        const type = sc[key];
        const allParams = utils.getFunctionParams(type);
        const Id = utils.generateGUID();
        typeInfo.push({ Id, typeName: type.name, script, factoryScriptPath, specScriptPath, params: allParams });
    }
}

for(const info of typeInfo) {
    info.dependencies = [];
    for(const param of info.params) {
        const refTypeInfo = typeInfo.find(inf => inf.typeName.toLowerCase() === param.name.toLowerCase());
        if (refTypeInfo) {
            param.reference = true;
            param.typeName = refTypeInfo.typeName;
            info.dependencies.push(refTypeInfo);
            param.factoryScript = refTypeInfo.factoryScriptPath.replace(/\\/g,'\\\\');
        } else {
            param.reference = false;
            param.typeName = 'variable';
        }
    }
}

for(const info of typeInfo) {
    const factory = factoryTemplate
        .replace(/\[args\]/g, `{ ${info.params.map( x=>x.name )} }` )
        .replace(/\[scriptpath\]/g, info.script.replace(/\\/g,'\\\\'))
        .replace(/\[typename\]/g, info.typeName);
    writeFileSync(info.factoryScriptPath, factory, 'utf8');
    const spec = factorySpecTemplate
        .replace(/\[scriptpath\]/g, info.factoryScriptPath.replace(/\\/g,'\\\\'))
        .replace(/\[typename\]/g, info.typeName)
        .replace(/\[args\]/g, `{ ${info.params.map( x => x.name )} }` );
    writeFileSync(info.specScriptPath, spec, 'utf8');
}

walkDependencies({ callback: ({ info }) => {
  
}});


// for(const info of typeInfo) {
//     const requireScripts = info.params.filter(p => p.reference).map(p => `const { ${p.typeName}Factory } = require('${p.factoryScript}');`).join('\r\n');
//     const nonRefArgsVariableNames = info.params.filter(p => !p.reference).map(p => `const ${p.name} = null;`).join('\r\n');
//     const refArgsVariableNames = info.params.filter(p => p.reference).map(p => `const ${p.name} = ${p.name}Factory.create([nonRefArgsVariableNames]);`).join('\r\n');
//     const factoryVariableNames = info.params.filter(p => p.reference).map(p => `const ${p.name}Factory = new ${p.typeName}Factory([refArgsVariableNames]);`).join('\r\n');
//     const spec = readFileSync(info.specScriptPath,'utf8')
//         .replace(/\[requireScripts\]/g, `[factoryVariableNames]\r\n${requireScripts}`)
//         .replace(/\[nonRefArgsVariableNames\]/g, nonRefArgsVariableNames)
//         .replace(/\[refArgsVariableNames\]/g, refArgsVariableNames)
//         .replace(/\[factoryVariableNames\]/g, `[factoryVariableNames]\r\n${factoryVariableNames}`)
//     writeFileSync(info.specScriptPath, spec, 'utf8');
// }




// for(const i of info) {



//     console.log(`dependencies for type ${i.type.name} are: `, i.typeDepArray);
// }