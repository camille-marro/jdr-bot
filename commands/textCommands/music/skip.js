const { useQueue } = require('discord-player');

function skip(message) {
    let args = message.content.split(" ");

    let serverQueue = useQueue(message.guild.id);

    if (!serverQueue) {
        message.channel.send("Aucune musique à passer !");
        return
    }

    if (serverQueue.tracks.data.length === 0) {
        message.channel.send("Aucune musique à passer, arrêt de la musique.");
        serverQueue.delete();
        return
    }

    let indiceSkip = args[1];
    if (indiceSkip > serverQueue.length) {
        message.channel.send("Indice trop grand !");
        return;
    }

    if (indiceSkip) {
        serverQueue.node.skipTo(indiceSkip-1);
        message.channel.send("Musique passée vers " + serverQueue.tracks.at(0).title + " - " + serverQueue.tracks.at(0).author);
    } else {
        serverQueue.node.skip();
        message.channel.send("Musique passée !\nMusique jouée : " + serverQueue.tracks.at(0).title + " - " + serverQueue.tracks.at(0).author);
    }
}

module.exports = {
    skip
}