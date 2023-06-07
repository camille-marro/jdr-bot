const { useQueue } = require('discord-player');

function loop(message) {
    let serverQueue = useQueue(message.guild.id);

    if (!serverQueue) {
        message.channel.send("La queue est vide :(");
        return
    }

    if (serverQueue.repeatMode === 0) {
        serverQueue.setRepeatMode(2);
        message.channel.send("Loop sur la queue enregistré.");
    } else {
        serverQueue.setRepeatMode(0);
        message.channel.send("Loop arrêté.");
    }
}

module.exports = {
    loop
}