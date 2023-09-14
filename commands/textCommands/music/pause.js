const { useQueue } = require('discord-player');
const { EmbedBuilder } = require('discord.js');

let log = require('../../../assets/log');

function pause(message) {
    console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked for the music to be paused.");
    log.print("asked for the music to be paused", message.author, message.content);

    let serverQueue = useQueue(message.guild.id);

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#23bb95");
    msgEmbed.setTitle("Lecture de sons");
    msgEmbed.setDescription("Permet la lecture de son");
    msgEmbed.setFooter({text:"Pour plus d'informations utiliser la commande \"pause help\""});

    let args = message.content.split(" ");
    if (args[1] === "help") {
        msgEmbed.setColor("#6e0e91");
        msgEmbed.addFields({name : "Syntaxe de la commande", value: "pause"});
        msgEmbed.addFields({name : "Description de la commande", value: "Permet de mettre en pause la lecture"});
        message.channel.send({embeds: [msgEmbed]});
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for pause command.");
        log.print("asked help for pause command", message.author, message.content);
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
        log.print("action is impossible : not in same voice channel", message.author, message.content);
        return;
    }

    if (!serverQueue) {
        console.log("|-- action is impossible : queue doesn't exist.");
        log.print("action is impossible : queue doesn't exist", 1);
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
        log.print("action is impossible : nothing is playing", 1);
        return
    }

    serverQueue.node.pause();
    msgEmbed.addFields({name : "Statut de la lecture", value:"En pause"});
    message.channel.send({embeds: [msgEmbed]});
    console.log("|-- music successfully paused.");
    log.print("music successfully paused", 1);
}

module.exports = {
    pause
}