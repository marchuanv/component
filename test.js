const comonent = require("./component.js");
(async() => {

    const crypto = comonent.require("crypto", "Test");

    const test = comonent.getDependency("crypto")

    require("./package.json",false);
    process.exit();
})().catch((err)=>{
    console.error(err);
});