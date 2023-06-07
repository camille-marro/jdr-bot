const { useQueue } = require('discord-player');

function queue(message) {
    let serverQueue = useQueue(message.guild.id);
    if (!serverQueue.tracks.toArray().length && !serverQueue.currentTrack) {
        return message.reply("Pas de musique dans la queue !");
    }

    let titleArray = [];
    let embeds = [];
    let str = "";
    let i = 1;
    serverQueue.tracks.toArray().slice(0, serverQueue.tracks.toArray().length).forEach((track) => {
        titleArray.push(track.title);
        str += ("[" + i + "] : " + track.title + " - " + track.author + "\n");
        i++;
    });

    message.channel.send("Currently Playing : " + serverQueue.currentTrack.title + " by " + serverQueue.currentTrack.author);
    message.channel.send("Queue : \n" + str);
}

module.exports = {
    queue
}