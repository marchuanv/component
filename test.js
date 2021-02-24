const comonentConfig = require("./component.config.js");
(async() => { 
    if (!comonentConfig){
        throw "Test Failed";
    }
    process.exit();
})().catch((err)=>{
    console.error(err);
});