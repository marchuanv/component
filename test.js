let Component = require("./component.js");
(async() => {
    const component = new Component({ moduleName: "component.test", gitUsername: "marchuanv" });
    await component.ready();

    console.log(component);

})().catch((err)=>{
    console.error(err);
});