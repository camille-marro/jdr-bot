const { useQueue } = require('discord-player');
const { EmbedBuilder } = require('discord.js');

function stop (message) {
    let serverQueue = useQueue(message.guild.id);

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#23bb95");
    msgEmbed.setTitle("Lecture de sons");
    msgEmbed.setDescription("Permet la lecture de son");

    console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked for the music to stop.");

    if (!serverQueue) {
        console.log("|-- action is impossible : queue doesn't exist.");
        msgEmbed.addFields({ name : "Action impossible", value: "Aucune musique n'est jouée"});
        msgEmbed.setColor("#ff0000");
        message.channel.send({embeds: [msgEmbed]});
        return
    }

    serverQueue.delete();
    msgEmbed.addFields({name : "Statut de la lecture", value:"Arrêtée"});
    message.channel.send({embeds: [msgEmbed]});
    console.log("|-- queue successfully deleted and bot disconnected");
}

module.exports = {
    stop
}