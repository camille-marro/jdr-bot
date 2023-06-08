const { useQueue } = require('discord-player');
const { EmbedBuilder } = require('discord.js');

function loop(message) {
    let serverQueue = useQueue(message.guild.id);

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#23bb95");
    msgEmbed.setTitle("Lecture de sons");
    msgEmbed.setDescription("Permet la lecture de son");

    console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") try to loop or stop the loop on the queue.");

    if (!serverQueue) {
        msgEmbed.addFields({ name : "Action impossible", value: "La queue est vide"});
        msgEmbed.setColor("#ff0000");
        message.channel.send({embeds: [msgEmbed]});
        console.log("|-- action is impossible : queue is empty.");
        return
    }

    if (serverQueue.repeatMode === 0) {
        serverQueue.setRepeatMode(2);
        msgEmbed.addFields({name : "Statut de la lecture en boucle", value:"Active"});
        console.log("|-- loop started.");
    } else {
        serverQueue.setRepeatMode(0);
        msgEmbed.addFields({name : "Statut de la lecture en boucle", value:"Arrêtée"});
        console.log("|-- loop stoped.");
    }

    message.channel.send({embeds: [msgEmbed]});
}

module.exports = {
    loop
}