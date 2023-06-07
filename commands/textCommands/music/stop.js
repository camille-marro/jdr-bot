const { useQueue } = require('discord-player');

function stop (message) {
    let serverQueue = useQueue(message.guild.id);
    console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked for the music to stop.");

    if (!serverQueue) {
        message.channel.send("Rien n'est joué !");
        console.log("|-- nothing is played.");
        return
    }

    serverQueue.delete();
    message.channel.send("Queue supprimée :)");
    console.log("|-- queue successfully deleted and bot disconnected");
}

module.exports = {
    stop
}