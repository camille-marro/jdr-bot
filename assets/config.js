let fs = require('fs');

let rawConfig = fs.readFileSync("json_files/config.json");
const config = JSON.parse(rawConfig);

function printConfig () {
    console.log("Configuration : ")
    console.log("- prefix : " + config['prefix']);
    console.log("- language : " + config['lang']);
    console.log("----------------");
}

function changeConfig(newConfig) {
    let JSONConfig = JSON.stringify(newConfig);
    fs.writeFileSync("json_files/config.json", JSONConfig);

    console.log("|- changing configuration for : ");
    printConfig();
}

module.exports = {
    config,
    printConfig,
    changeConfig
};