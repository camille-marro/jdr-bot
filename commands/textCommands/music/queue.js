const { useQueue } = require('discord-player');
const { EmbedBuilder } = require('discord.js');

let log = require('../../../assets/log');

function queue(message) {
    let serverQueue = useQueue(message.guild.id);
    console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked for the music's queue.");
    log.print("asked for the music's queue", message.author, message.content);

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#23bb95");
    msgEmbed.setTitle("Lecture de sons");
    msgEmbed.setDescription("Permet la lecture de son");
    msgEmbed.setFooter({text:"Pour plus d'informations utiliser la commande \"queue help\""});

    let args = message.content.split(" ");
    if (args[1] === "help") {
        msgEmbed.setColor("#6e0e91");
        msgEmbed.addFields({name : "Syntaxe de la commande", value: "queue"});
        msgEmbed.addFields({name : "Description de la commande", value: "Permet de voir le contenu de la queue"});
        message.channel.send({embeds: [msgEmbed]});
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for queue command.");
        log.print("asked help for queue command", message.author, message.content);
        return;
    }

    if(!serverQueue) {
        msgEmbed.addFields({ name : "Action impossible", value: "La queue n'existe pas"});
        msgEmbed.setColor("#ff0000");
        message.channel.send({embeds: [msgEmbed]});
        console.log("|-- action is impossible : queue doesn't exist.");
        log.print("action is impossible : queue doesn't exist", 1);
        return;
    }

    if (serverQueue.tracks.toArray().length === 0 || !serverQueue.currentTrack) {
        console.log("|-- action is impossible : queue is empty.");
        log.print("action is impossible : queue is empty", 1);
        msgEmbed.addFields({ name : "Action impossible", value: "La queue est vide"});
        msgEmbed.setColor("#ff0000");
        message.channel.send({embeds: [msgEmbed]});
        return;
    }

    let str = "";
    let i = 1;

    console.log("|-- queue found : ");
    log.print("queue found", 1);

    msgEmbed.addFields({name : "Statut de la queue", value:" "});
    serverQueue.tracks.toArray().slice(0, serverQueue.tracks.toArray().length).forEach((track) => {
        str += ("[" + i + "] : " + track.title + " - " + track.author + "\n");
        // embeds don't support more than 25 fields
        if (i < 24) {
            msgEmbed.addFields({name : `[${i}] : ${track.title}`, value:track.author});
        } else if (i === 24) {
            msgEmbed.addFields({name: `Il y a ${serverQueue.tracks.toArray().length} dans la queue`, value: "Pour voir les autres utilisez la commande skip"})
        }
        console.log("|-- [" + i + "] : " + track.title + " - " + track.author)
        i++;
    });

    message.channel.send({embeds: [msgEmbed]});
}

module.exports = {
    queue
}