const { useQueue } = require('discord-player');

function loop(message) {
    let serverQueue = useQueue(message.guild.id);
    console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") try to loop or stop the loop on the queue.");

    if (!serverQueue) {
        message.channel.send("La queue est vide :(");
        console.log("|-- queue is empty.");
        return
    }

    if (serverQueue.repeatMode === 0) {
        serverQueue.setRepeatMode(2);
        message.channel.send("Loop sur la queue enregistré.");
        console.log("|-- loop started.");
    } else {
        serverQueue.setRepeatMode(0);
        message.channel.send("Loop arrêté.");
        console.log("|-- loop stoped.");

    }
}

module.exports = {
    loop
}