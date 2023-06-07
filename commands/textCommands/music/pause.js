const { useQueue } = require('discord-player');

function pause(message) {
    console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked for the music to be paused.");

    let serverQueue = useQueue(message.guild.id);
    let voiceChannel = message.member.voice.channel;

    if (serverQueue.node.isPaused()) {
        message.channel.send("Le bot ne joue déjà plus de musique !");
        console.log("|-- nothing was played.");
        return
    }

    serverQueue.node.pause();
    message.channel.send("Lecture de la musique mise en pause.");
    console.log("|-- music successfully paused.");
}

module.exports = {
    pause
}