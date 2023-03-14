let config = require('../../assets/config.js');
const createEmbed = require('../../assets/createEmbed.js');
const fs = require("fs");
const path = require("path");

function printQueue(message, queueInfos) {
    let rawJSONEmbed = fs.readFileSync(path.resolve(__dirname, '../../json_files/embed_msg/' + config['config']['lang'] + '.json'));
    let JSONEmbed = JSON.parse(rawJSONEmbed);

    let msg = message.content;
    let options = msg.split(" ");

    if (options[1] === "help") {
        let msgQueueHelpEmbed = createEmbed(JSONEmbed['msgQueueHelpEmbed']['color'], JSONEmbed['msgQueueHelpEmbed']['title'], JSONEmbed['msgQueueHelpEmbed']['thumbnail'], JSONEmbed['msgQueueHelpEmbed']['description'], JSONEmbed['msgQueueHelpEmbed']['field'], []);
        message.channel.send({embeds: [msgQueueHelpEmbed]});
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for queue command.");
    } else if (options [1] === "clear") {
        queueInfos = [];
        queueInfos.length = 0;
        printQueueLocal(message, queueInfos);
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") cleared the queue.");
    } else {
        printQueueLocal(message, queueInfos);
    }

    return queueInfos;
}

function printQueueLocal (message, queueInfos) {
    let rawJSONEmbed = fs.readFileSync(path.resolve(__dirname, '../../json_files/embed_msg/' + config['config']['lang'] + '.json'));
    let JSONEmbed = JSON.parse(rawJSONEmbed);

    let embedFields = [];

    if (queueInfos.length === 0) {
        embedFields.push({"name": "Musique dans la queue :", "value": "La queue est vide :)"})
    } else {
        for (let i = 0; i < queueInfos.length; i++) {
            let str = "Musique " + (i+1);
            embedFields.push({"name" : str, "value": queueInfos[i].toString()});
        }
    }

    let msgQueueEmbed = createEmbed(JSONEmbed['msgQueueEmbed']['color'], JSONEmbed['msgQueueEmbed']['title'], JSONEmbed['msgQueueEmbed']['thumbnail'], JSONEmbed['msgQueueEmbed']['description'], embedFields, [])
    message.channel.send({embeds: [msgQueueEmbed]});
    console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") print the queue.");
}

module.exports = {
    printQueue
}

/*
* @TODO :
*   queue remove
* */