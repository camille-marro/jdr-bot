const { useQueue } = require('discord-player');

function stop (message) {
    let serverQueue = useQueue(message.guild.id);

    if (!serverQueue) {
        message.channel.send("Rien n'est joué !");
        return
    }

    serverQueue.delete();
    message.channel.send("Queue supprimée :)");
}

module.exports = {
    stop
}