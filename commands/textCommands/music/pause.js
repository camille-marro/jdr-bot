const { useQueue } = require('discord-player');

function pause(message) {
    let serverQueue = useQueue(message.guild.id);
    let voiceChannel = message.member.voice.channel;

    if (serverQueue.node.isPaused()) {
        message.channel.send("Le bot ne joue déjà plus de musique !");
        return
    }

    serverQueue.node.pause();
    message.channel.send("Lecture de la musique mise en pause.");
}

module.exports = {
    pause
}