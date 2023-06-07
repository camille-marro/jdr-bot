const { useQueue } = require('discord-player');

function resume(message) {
    let serverQueue = useQueue(message.guild.id);
    let voiceChannel = message.member.voice.channel;

    if (serverQueue.node.isPlaying()) {
        message.channel.send("Le bot joue déjà de la musique !");
        return
    }

    serverQueue.node.resume();
    message.channel.send("Lecture de la musique remise en route.");
}

module.exports = {
    resume
}