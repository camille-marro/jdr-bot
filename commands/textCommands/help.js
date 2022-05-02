let fs = require('fs');
let config = require('../../assets/config.js');
const createEmbed = require('../../assets/createEmbed.js');

function help (message) {
    let rawJSONEmbed = fs.readFileSync('C:/Users/Asus PC/Documents/bot discord/json_files/embed_msg/' + config['config']['lang'] + ".json");
    let JSONEmbed = JSON.parse(rawJSONEmbed);

    let msgHelpEmbed = createEmbed(JSONEmbed['msgHelpEmbed']['color'], JSONEmbed['msgHelpEmbed']['title'], JSONEmbed['msgHelpEmbed']['description'], JSONEmbed['msgHelpEmbed']['field'], [])
    message.channel.send({embeds: [msgHelpEmbed]});
    console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked for help");
}

module.exports = {
    help
}