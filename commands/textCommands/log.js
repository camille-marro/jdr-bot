let fs = require('fs');
const path = require("path");

let log = require('../../assets/log');
const {EmbedBuilder} = require("discord.js");

function printLog(length, message) {
    if (length === undefined) length = 20;
    const logsRaw = fs.readFileSync(path.resolve(__dirname, "../../logs.txt")).toString();
    const lines = logsRaw.split("\n");
    const reversedLines = lines.reverse();
    const logs = reversedLines.join('\n');

    let msgToSend = "", i = 0;
    logs.split(/\r?\n/).forEach(line => {
        if (i < length) {
            msgToSend += line + "\n";
        }
        i++;
    });
    message.channel.send(msgToSend);
}

function clearLog(message) {
    fs.writeFileSync(path.resolve(__dirname, "../../logs.txt"), "");
    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#0cb200");
    msgEmbed.setTitle("Logs supprimées avec succès");
    message.channel.send({embeds: [msgEmbed]});
    log.print("resetting logs", message.author);
}

function execute(message) {
    let args = message.content.split(" ");

    if (args[1] === "print") {
        printLog(args[2], message);
    } else if (args[1] === "clear") {
        clearLog(message);
    }
}

module.exports = {
    execute
}