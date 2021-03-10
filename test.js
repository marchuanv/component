let Component = require("./component.js");
(async() => {
    
    const component1 = new Component({ moduleName: "Bob" });
    const component2 = new Component({ moduleName: "Susan" });


    


})().catch((err)=>{
    console.error(err);
});