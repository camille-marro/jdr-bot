const { EmbedBuilder } = require('discord.js');
let log = require('../../assets/log');

function ping (message) {

    let args = message.content.split(" ");

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#b4aa0f");
    msgEmbed.setTitle("Ping");
    msgEmbed.setDescription("Tester si le bot répond");

    if (args[1] === "help") {
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for pong command");
        log.print("asked help for ping command", message.author, message.content);
        msgEmbed.setColor("#6e0e91");
        msgEmbed.addFields({name: "Syntaxe de la commande", value: "ping"});
        msgEmbed.addFields({name: "Exemple de commande", value: "ping"});
    } else {
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") pinged");
        log.print("pinged", message.author, message.content);
        msgEmbed.addFields({name : "Pong", value: " "});
    }

    message.channel.send({embeds: [msgEmbed]});
}

module.exports = {
    ping
}