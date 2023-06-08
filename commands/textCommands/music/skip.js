const { useQueue } = require('discord-player');
const { EmbedBuilder } = require('discord.js');

function skip(message) {
    console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to skip.");

    let args = message.content.split(" ");

    let serverQueue = useQueue(message.guild.id);

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#23bb95");
    msgEmbed.setTitle("Lecture de sons");
    msgEmbed.setDescription("Permet la lecture de son");

    if (!serverQueue) {
        console.log("|-- action is impossible : nothing to skip.");
        msgEmbed.addFields({ name : "Action impossible", value: "Aucune musique n'est jouée"});
        msgEmbed.setColor("#ff0000");
        message.channel.send({embeds: [msgEmbed]});
        return
    }

    if (serverQueue.tracks.data.length === 0) {
        serverQueue.delete();
        msgEmbed.addFields({name : "Aucune musique à passer", value:"Arrêt de la musique"});
        message.channel.send({embeds: [msgEmbed]});
        console.log("|-- nothing to skip, bot disconnected.");
        return
    }

    let indiceSkip = args[1];
    if (indiceSkip > serverQueue.length) {
        msgEmbed.addFields({ name : "Action impossible", value: "Indice de la musique trop grand"});
        msgEmbed.setColor("#ff0000");
        message.channel.send({embeds: [msgEmbed]});
        console.log("|-- action is impossible : index's too big, can't skip to music (#" + indiceSkip + ").");
        return;
    }

    if (indiceSkip) {
        serverQueue.node.skipTo(indiceSkip-1);
        msgEmbed.addFields({name : "Musique passée", value:`${serverQueue.tracks.at(0).title} - ${serverQueue.tracks.at(0).author}`});
        console.log("|-- successfully skipped to music (#" + indiceSkip + ") " + serverQueue.tracks.at(0).title + " - " + serverQueue.tracks.at(0).author + "." );
    } else {
        serverQueue.node.skip();
        msgEmbed.addFields({name : "Musique passée", value:`${serverQueue.tracks.at(0).title} - ${serverQueue.tracks.at(0).author}`});
        console.log("|-- successfully skipped to next music : " + serverQueue.tracks.at(0).title + " - " + serverQueue.tracks.at(0).author + ".");
    }

    message.channel.send({embeds: [msgEmbed]});
}

module.exports = {
    skip
}