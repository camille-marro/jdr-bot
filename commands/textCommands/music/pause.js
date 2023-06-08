const { useQueue } = require('discord-player');
const { EmbedBuilder } = require('discord.js');

function pause(message) {
    console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked for the music to be paused.");

    let serverQueue = useQueue(message.guild.id);

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#23bb95");
    msgEmbed.setTitle("Lecture de sons");
    msgEmbed.setDescription("Permet la lecture de son");

    if (!serverQueue) {
        console.log("|-- action is impossible : queue doesn't exist.")
        msgEmbed.addFields({ name : "Action impossible", value: "Aucune musique n'est jouée"});
        msgEmbed.setColor("#ff0000");
        message.channel.send({embeds: [msgEmbed]});
        return;
    }

    if (serverQueue.node.isPaused()) {
        msgEmbed.addFields({ name : "Action impossible", value: "La lecture est déjà en pause"});
        msgEmbed.setColor("#ff0000");
        message.channel.send({embeds: [msgEmbed]});
        console.log("|-- action is impossible : nothing is playing.");
        return
    }

    serverQueue.node.pause();
    msgEmbed.addFields({name : "Statut de la lecture", value:"En pause"});
    message.channel.send({embeds: [msgEmbed]});
    console.log("|-- music successfully paused.");
}

module.exports = {
    pause
}