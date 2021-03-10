let com  = require("./component.js");
(async() => {
    let { component } = await com.require("component", {gitUsername: "marchuanv"});
    await component.require("component.delegate", {gitUsername: "marchuanv"});
    await component.register();
})().catch((err)=>{
    console.error(err);
});