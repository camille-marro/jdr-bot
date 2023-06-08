const { useQueue } = require('discord-player');
const { EmbedBuilder } = require('discord.js');

function resume(message) {
    console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked for the music to be resumed.");

    let serverQueue = useQueue(message.guild.id);
    let voiceChannel = message.member.voice.channel;

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#23bb95");
    msgEmbed.setTitle("Lecture de sons");
    msgEmbed.setDescription("Permet la lecture de son");

    let args = message.content.split(" ");
    if (args[1] === "help") {
        msgEmbed.setColor("#6e0e91");
        msgEmbed.addFields({name : "Syntaxe de la commande", value: "resume"});
        msgEmbed.addFields({name : "Description de la commande", value: "Permet de relancer la lecture"});
        message.channel.send({embeds: [msgEmbed]});
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for resume command.");
        return;
    }

    if (!message.member.voice.channel) {
        msgEmbed.addFields({ name : "Action impossible", value: "Vous devez être dans un salon vocal"});
        msgEmbed.setColor("#ff0000");
        message.channel.send({embeds: [msgEmbed]});
        console.log("|-- action is impossible : not in a voice channel.");
        return;
    }

    if (message.guild.members.me.voice.channelId && (message.member.voice.channelId !== message.guild.members.me.voice.channelId)) {
        msgEmbed.addFields({ name : "Action impossible", value: "Vous devez être dans le même salon vocal que le bot"});
        msgEmbed.setColor("#ff0000");
        message.channel.send({embeds: [msgEmbed]});
        console.log("|-- action is impossible : not in same voice channel.");
        return;
    }

    if (!serverQueue) {
        console.log("|-- action is impossible : queue doesn't exist.")
        msgEmbed.addFields({ name : "Action impossible", value: "Aucune musique n'est jouée"});
        msgEmbed.setColor("#ff0000");
        message.channel.send({embeds: [msgEmbed]});
        return;
    }

    if (serverQueue.node.isPlaying()) {
        msgEmbed.addFields({ name : "Action impossible", value: "La lecture est déjà en cours"});
        msgEmbed.setColor("#ff0000");
        message.channel.send({embeds: [msgEmbed]});
        console.log("|-- action is impossible : music already playing.");
        return
    }

    serverQueue.node.resume();
    msgEmbed.addFields({name : "Statut de la lecture", value:"En cours"});
    message.channel.send({embeds: [msgEmbed]});
    console.log("|-- music successfully resumed.");
}

module.exports = {
    resume
}