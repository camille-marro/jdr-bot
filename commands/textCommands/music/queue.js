const { useQueue } = require('discord-player');

function queue(message) {
    let serverQueue = useQueue(message.guild.id);
    console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked for the music's queue.");

    if (!serverQueue.tracks.toArray().length && !serverQueue.currentTrack) {
        console.log("|-- queue is empty.");
        return message.reply("Pas de musique dans la queue !");
    }

    let str = "";
    let i = 1;

    console.log("|-- queue found : ");

    serverQueue.tracks.toArray().slice(0, serverQueue.tracks.toArray().length).forEach((track) => {
        str += ("[" + i + "] : " + track.title + " - " + track.author + "\n");
        console.log("|-- [" + i + "] : " + track.title + " - " + track.author)
        i++;
    });

    message.channel.send("Currently Playing : " + serverQueue.currentTrack.title + " by " + serverQueue.currentTrack.author);
    message.channel.send("Queue : \n" + str);
}

module.exports = {
    queue
}