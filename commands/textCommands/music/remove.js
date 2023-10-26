const { useQueue } = require('discord-player');
const { EmbedBuilder } = require('discord.js');

let log = require('../../../assets/log');

function remove(message) {
    log.print("Tried to remove a track from the queue", message.author, message.content);
    let serverQueue = useQueue(message.guild.id);
    let args = message.content.split(" ");

    let msgEmbed = new EmbedBuilder();

    if (args[1] === "help") {
        msgEmbed.setColor("#6e0e91");
        msgEmbed.setTitle("Remove - Help");
        msgEmbed.setDescription("Permet de supprimer une musique de la queue");
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"remove help\""});

        msgEmbed.addFields({name: "Syntaxe de la commande", value: "remove [indice]"});
        msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
        msgEmbed.addFields({name: "indice", value: "indice de la musique à retirer de la queue, pour l'avoir utiliser la commande queue", inline: true});
        msgEmbed.addFields({name: "Exemple de commande", value: "remove 2"});

        log.print("help message successfully sent", 1);
        message.channel.send({embeds: [msgEmbed]});
        return;
    }

    if (!serverQueue) {
        msgEmbed.setColor("#ff0000");
        msgEmbed.setTitle("Queue inexistante !");
        msgEmbed.setDescription("La queue n'existe pas, impossible de supprimer une musique");
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"remove help\""});

        log.print("action is impossible : queue doesn't exist", 1);
        message.channel.send({embeds: [msgEmbed]});
        return;
    }

    if (serverQueue.tracks.toArray().length === 0 || !serverQueue.currentTrack) {
        msgEmbed.setColor("#ff0000");
        msgEmbed.setTitle("Queue vide !");
        msgEmbed.setDescription("La queue est vide, impossible de supprimer une musique");
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"remove help\""});

        log.print("action is impossible : queue is empty", 1);
        message.channel.send({embeds: [msgEmbed]});
        return;
    }

    // check que c'est bien un nombre
    const regex = /[^0-9]+/;
    if (regex.test(args[1])) {
        console.log("pas un nombre");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setTitle("Action impossible");
        msgEmbed.setDescription("L'indice utilisé n'est pas un nombre");
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"remove help\""});

        log.print("action is impossible : argument is not a number", 1, message.content);
        message.channel.send({embeds: [msgEmbed]});
        return;
    }

    let i = parseInt(args[1]) - 1;
    if(i < serverQueue.size && i >= 0) {
        let track = serverQueue.tracks.toArray()[i];
        serverQueue.removeTrack(track);

        console.log(track);

        msgEmbed.setColor("#08ff00");
        msgEmbed.setTitle("Suppression réussie avec succès !");
        msgEmbed.setDescription("Musique supprimée : [" + (i+1) + "] : " + track.title + " - " + track.author);
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"remove help\""});
        message.channel.send({embeds: [msgEmbed]});
    } else {
        console.log((i+1) + "trop grand !  : " + serverQueue.size);
        msgEmbed.setColor("#ff0000");
        msgEmbed.setTitle("Action impossible !");
        msgEmbed.setDescription("L'indice fournit est trop grand, taille de la queue :" + serverQueue.size.toString());
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"remove help\""});

        log.print("action is impossible : queue doesn't exist", 1);
        message.channel.send({embeds: [msgEmbed]});
    }
}

module.exports = {
    remove
}