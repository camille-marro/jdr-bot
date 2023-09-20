const { useQueue } = require('discord-player');
const { EmbedBuilder } = require('discord.js');

const log = require('../../../assets/log');

function stop (message) {
    let serverQueue = useQueue(message.guild.id);

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#23bb95");
    msgEmbed.setTitle("Lecture de sons");
    msgEmbed.setDescription("Permet la lecture de son");
    msgEmbed.setFooter({text:"Pour plus d'informations utiliser la commande \"stop help\""});

    console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked for the music to stop.");
    log.print("tried to stop the music", message.author, message.content);

    let args = message.content.split(" ");
    if (args[1] === "help") {
        msgEmbed.setColor("#6e0e91");
        msgEmbed.addFields({name : "Syntaxe de la commande", value: "stop"});
        msgEmbed.addFields({name : "Description de la commande", value: "Permet d'arrêter la lecture"});
        message.channel.send({embeds: [msgEmbed]});
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for stop command.");
        log.print("asked help for stop command", message.author, message.content);
        return;
    }

    if (!message.member.voice.channel) {
        msgEmbed.addFields({ name : "Action impossible", value: "Vous devez être dans un salon vocal"});
        msgEmbed.setColor("#ff0000");
        message.channel.send({embeds: [msgEmbed]});
        console.log("|-- action is impossible : not in a voice channel.");
        log.print("action is impossible : not in a voice channel", 1);
        return;
    }

    if (message.guild.members.me.voice.channelId && (message.member.voice.channelId !== message.guild.members.me.voice.channelId)) {
        msgEmbed.addFields({ name : "Action impossible", value: "Vous devez être dans le même salon vocal que le bot"});
        msgEmbed.setColor("#ff0000");
        message.channel.send({embeds: [msgEmbed]});
        console.log("|-- action is impossible : not in same voice channel.");
        log.print("action is impossible : not in same voice channel", 1);
        return;
    }

    if (!serverQueue) {
        console.log("|-- action is impossible : queue doesn't exist.");
        msgEmbed.addFields({ name : "Action impossible", value: "Aucune musique n'est jouée"});
        msgEmbed.setColor("#ff0000");
        message.channel.send({embeds: [msgEmbed]});
        log.print("action is impossible : queue doesn't exist", 1);
        return
    }

    serverQueue.delete();
    msgEmbed.addFields({name : "Statut de la lecture", value:"Arrêtée"});
    message.channel.send({embeds: [msgEmbed]});
    console.log("|-- queue successfully deleted and bot disconnected");
    log.print("queue successfully deteled and bot disconnected", 1);
}

module.exports = {
    stop
}