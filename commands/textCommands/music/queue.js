const { useQueue } = require('discord-player');
const { EmbedBuilder } = require('discord.js');

function queue(message) {
    let serverQueue = useQueue(message.guild.id);
    console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked for the music's queue.");

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#23bb95");
    msgEmbed.setTitle("Lecture de sons");
    msgEmbed.setDescription("Permet la lecture de son");

    if(!serverQueue) {
        msgEmbed.addFields({ name : "Action impossible", value: "La queue n'existe pas"});
        msgEmbed.setColor("#ff0000");
        message.channel.send({embeds: [msgEmbed]});
        console.log("|-- action is impossible : queue doesn't exist.");
        return;
    }

    if (!serverQueue.tracks.toArray().length && !serverQueue.currentTrack) {
        console.log("|-- queue is empty.");
        msgEmbed.addFields({ name : "Action impossible", value: "La queue est vide"});
        msgEmbed.setColor("#ff0000");
        message.channel.send({embeds: [msgEmbed]});
        return;
    }

    let str = "";
    let i = 1;

    console.log("|-- queue found : ");

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