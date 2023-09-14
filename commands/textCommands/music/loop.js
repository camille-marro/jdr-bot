const { useQueue } = require('discord-player');
const { EmbedBuilder } = require('discord.js');

let log = require('../../../assets/log');

function loop(message) {
    let serverQueue = useQueue(message.guild.id);

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#23bb95");
    msgEmbed.setTitle("Lecture de sons");
    msgEmbed.setDescription("Permet la lecture de son");
    msgEmbed.setFooter({text:"Pour plus d'informations utiliser la commande \"loop help\""});

    let args = message.content.split(" ");
    if (args[1] === "help") {
        msgEmbed.setColor("#6e0e91");
        msgEmbed.addFields({name : "Syntaxe de la commande", value: "loop"});
        msgEmbed.addFields({name : "Description de la commande", value: "Permet d'activer ou désactiver la lecture en boucle de la queue"});
        message.channel.send({embeds: [msgEmbed]});
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for loop command.");
        log.print("asked help for loop command", message.author, message.content);
        return;
    }

    console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") try to loop or stop the loop on the queue.");
    log.print("try to loop or stop the loop on the queue", message.author, message.content);

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
        msgEmbed.addFields({ name : "Action impossible", value: "La queue est vide"});
        msgEmbed.setColor("#ff0000");
        message.channel.send({embeds: [msgEmbed]});
        console.log("|-- action is impossible : queue is empty.");
        log.print("action is impossible : queue is empty", 1);
        return;
    }

    if (serverQueue.repeatMode === 0) {
        serverQueue.setRepeatMode(2);
        msgEmbed.addFields({name : "Statut de la lecture en boucle", value:"Active"});
        console.log("|-- loop started.");
        log.print("loop started", 1);
    } else {
        serverQueue.setRepeatMode(0);
        msgEmbed.addFields({name : "Statut de la lecture en boucle", value:"Arrêtée"});
        console.log("|-- loop stopped.");
        log.print("loop stopped", 1);
    }

    message.channel.send({embeds: [msgEmbed]});
}

module.exports = {
    loop
}