const { useQueue } = require('discord-player');
const { EmbedBuilder } = require('discord.js');

let log = require('../../../assets/log');

function skip(message) {
    console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to skip.");
    log.print("tried to skip", message.author, message.content);

    let args = message.content.split(" ");

    let serverQueue = useQueue(message.guild.id);

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#23bb95");
    msgEmbed.setTitle("Lecture de sons");
    msgEmbed.setDescription("Permet la lecture de son");
    msgEmbed.setFooter({text:"Pour plus d'informations utiliser la commande \"skip help\""});

    if (args[1] === "help") {
        msgEmbed.setColor("#6e0e91");
        msgEmbed.addFields({name : "Syntaxe de la commande", value: "skip [indice:optionnel]"});
        msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
        msgEmbed.addFields({name: "indice:optionnel", value: "Indice de la musique à jouer", inline: true});
        msgEmbed.addFields({name : "Description de la commande", value: "Permet de passer la musique ou de passer à une musique spécifique"});
        message.channel.send({embeds: [msgEmbed]});
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for skip command.");
        log.print("asked help for skip command", message.author, message.content);
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
        console.log("|-- action is impossible : nothing to skip.");
        log.print("action in impossible : nothing to skip", 1);
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
        log.print("nothing to skip, bot disconnected", 1);
        return
    }

    let indiceSkip = args[1];
    if (indiceSkip > serverQueue.length) {
        msgEmbed.addFields({ name : "Action impossible", value: "Indice de la musique trop grand"});
        msgEmbed.setColor("#ff0000");
        message.channel.send({embeds: [msgEmbed]});
        console.log("|-- action is impossible : index's too big, can't skip to music (#" + indiceSkip + ").");
        log.print("action is impossible : index's too big, can't skip to music " + indiceSkip, 1);
        return;
    }

    if (indiceSkip) {
        serverQueue.node.skipTo(indiceSkip-1);
        msgEmbed.addFields({name : "Musique passée", value:`${serverQueue.tracks.at(0).title} - ${serverQueue.tracks.at(0).author}`});
        console.log("|-- successfully skipped to music (#" + indiceSkip + ") " + serverQueue.tracks.at(0).title + " - " + serverQueue.tracks.at(0).author + "." );
        /* @TODO */
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