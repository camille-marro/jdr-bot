let config = require('../../assets/config.js');
const createEmbed = require('../../assets/createEmbed.js');
const fs = require("fs");
const path = require("path");

function queue (message, queue) {
        let msg = message.content;
        let options = msg.split(" ");

        if (options[1] === "remove") {
            queue = queueRemove(message, queue);
        } else {
            queue = printQueue(message, queue);
        }
        return queue;
}

function printQueue(message, queue) {
    let rawJSONEmbed = fs.readFileSync(path.resolve(__dirname, '../../json_files/embed_msg/' + config['config']['lang'] + '.json'));
    let JSONEmbed = JSON.parse(rawJSONEmbed);

    let msg = message.content;
    let options = msg.split(" ");

    if (options[1] === "help") {
        let msgQueueHelpEmbed = createEmbed(JSONEmbed['msgQueueHelpEmbed']['color'], JSONEmbed['msgQueueHelpEmbed']['title'], JSONEmbed['msgQueueHelpEmbed']['thumbnail'], JSONEmbed['msgQueueHelpEmbed']['description'], JSONEmbed['msgQueueHelpEmbed']['field'], []);
        message.channel.send({embeds: [msgQueueHelpEmbed]});
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for queue command.");
    } else if (options [1] === "clear") {
        queue = [];
        printQueueLocal(message, queue);
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") cleared the queue.");
    } else if (options [1] === "remove") {
        queue = queueRemove(message, queue);
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") removed a song from the queue.");
    }
    else {
        printQueueLocal(message, queue);
    }

    return queue;
}

function printQueueLocal (message, queue) {
    let rawJSONEmbed = fs.readFileSync(path.resolve(__dirname, '../../json_files/embed_msg/' + config['config']['lang'] + '.json'));
    let JSONEmbed = JSON.parse(rawJSONEmbed);

    let embedFields = [];

    if (queue.length === 0) {
        embedFields.push({"name": "Musique dans la queue :", "value": "La queue est vide :)"})
    } else {
        for (let i = 0; i < queue.length; i++) {
            let str = "Musique " + (i+1);
            embedFields.push({"name" : str, "value": queue[i]["infos"].toString()});
        }
    }

    let msgQueueEmbed = createEmbed(JSONEmbed['msgQueueEmbed']['color'], JSONEmbed['msgQueueEmbed']['title'], JSONEmbed['msgQueueEmbed']['thumbnail'], JSONEmbed['msgQueueEmbed']['description'], embedFields, [])
    message.channel.send({embeds: [msgQueueEmbed]});
    console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") print the queue.");
}

function queueRemove (message, queue) {
    let msg = message.content;
    let options = msg.split(" ");

    if (options[2] === "help") {

    } else {
        //verif si c'est un nombre
        if (!Number.isInteger(options[2])) {
            // ce n'est pas un entier
        } else if (options[2] < 1 || options[2] > queue.length) {
            // nombre invalide
        } else {
            queue.splice(options[2] - 1,1);
            console.log("|- music n°" + options[2] + " removed from queue");
        }
    }

    return queue;
}

module.exports = {
    queue
}

/*
* @TODO :
*   queue remove
* */