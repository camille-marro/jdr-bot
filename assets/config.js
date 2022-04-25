let fs = require('fs');
let createEmbed = require('../assets/createEmbed.js');

let rawConfig = fs.readFileSync("json_files/config.json");
const config = JSON.parse(rawConfig);

function printConfig () {
    console.log("----------------");
    console.log("Configuration : ")
    console.log("- prefix : " + config['prefix']);
    console.log("- language : " + config['lang']);
    console.log("- voice channels :");
    console.log("-- secret tunnel E : " + config['voice channels']['secret tunnel']['E']['name']);
    console.log("-- secret tunnel S : " + config['voice channels']['secret tunnel']['S']['name']);
    console.log("-- kick channel : " + config['voice channels']['kick channel']['name']);
    console.log("-- safety net : " + config['voice channels']['safety net']['name']);
    console.log("-- mystery machine : " + config['voice channels']['mystery machine']['name']);
    console.log("-- bong channel: " + config['voice channels']['bong']['name']);
    console.log("----------------");
}

function printConfigEmbed (channel) {
    let rawJSONEmbed = fs.readFileSync("json_files/embed_msg/" + config['lang'] + ".json");
    let JSONEmbed = JSON.parse(rawJSONEmbed);

    let embedOptions = [];
    embedOptions['!prefix'] = config['prefix'];
    embedOptions['!lang'] = config['lang'];
    embedOptions['!secret_tunnel_E'] = config['voice channels']['secret tunnel']['E']['name'];
    embedOptions['!secret_tunnel_S'] = config['voice channels']['secret tunnel']['S']['name'];
    embedOptions['!kick_channel'] = config['voice channels']['kick channel']['name'];
    embedOptions['!safety_net_channel'] = config['voice channels']['safety net']['name'];
    embedOptions['!mystery_machine'] = config['voice channels']['mystery machine']['name'];
    embedOptions['!bong_channel'] = config['voice channels']['bong']['name'];


    let msgPrintConfigEmbed = createEmbed(JSONEmbed['msgPrintConfigEmbed']['color'], JSONEmbed['msgPrintConfigEmbed']['title'], JSONEmbed['msgPrintConfigEmbed']['description'], JSONEmbed['msgPrintConfigEmbed']['field'], embedOptions);
    channel.send({embeds: [msgPrintConfigEmbed]});
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
    printConfigEmbed,
    changeConfig
};