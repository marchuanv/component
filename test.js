const comonentConfig = require("./component.config.js");
(async() => { 
    if (!comonentConfig.host){
        throw "Test Failed";
    }
    process.exit();
})().catch((err)=>{
    console.error(err);
});