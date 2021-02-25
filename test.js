const comonent = require("./component.js");
comonent.require("component.delegate", { gitUsername: "marchuanv" });
(async() => {
    
    comonent.events.on( { moduleName: "component.delegate", eventType: "register" }, ({ componentDelegate }) => {
        console.log(componentDelegate);
    });

    comonent.events.on( { eventType: "register" }, ({ module }) => {
        console.log(componentDelegate);
    });
    // const crypto = comonent.require("crypto", "Test");

    // const test = comonent.getDependency("crypto")

    // require("./package.json",false);
    // process.exit();
})().catch((err)=>{
    console.error(err);
});