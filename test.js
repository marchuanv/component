const comonent = require("./component.js");
(async() => { 
    require("./package.json",false);
    process.exit();
})().catch((err)=>{
    console.error(err);
});