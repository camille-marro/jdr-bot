const { useQueue } = require('discord-player');

function resume(message) {
    console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked for the music to be resumed.");
    let serverQueue = useQueue(message.guild.id);
    let voiceChannel = message.member.voice.channel;

    if (serverQueue.node.isPlaying()) {
        message.channel.send("Le bot joue déjà de la musique !");
        console.log("|-- music already playing.");
        return
    }

    serverQueue.node.resume();
    message.channel.send("Lecture de la musique remise en route.");
    console.log("|-- music successfully resumed.");
}

module.exports = {
    resume
}