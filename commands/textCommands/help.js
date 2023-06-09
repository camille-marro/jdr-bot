const { EmbedBuilder } = require('discord.js');

function help (message) {

    let args = message.content.split(" ");

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#6e0e91");

    if (args[1] === "roll") {
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for roll command");

        msgEmbed.setTitle("Help - roll");
        msgEmbed.setDescription("Lancer des dés de plusieurs faces");
        msgEmbed.addFields({name: "Syntaxe de la commande", value: "roll [nb_lancers]d[nb_faces]"});
        msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
        msgEmbed.addFields({name: "nb_lancers", value: "Nombre de lancé à faire", inline: true});
        msgEmbed.addFields({name: "nb_faces", value: "Nombre de faces du dé", inline: true});
        msgEmbed.addFields({name: "Exemple de commande", value: "roll 3d6"});
        msgEmbed.setFooter({text : "Pour plus d'informations utiliser la commande \"roll help\""});
    } else if (args[1] === "config") {
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for config command");

        msgEmbed.setTitle("Help - config");
        msgEmbed.setDescription("Mettre à jouer la configuration du bot");
        msgEmbed.addFields({name: "Syntaxe de la commande", value: "config [param] [valeur]"});
        msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
        msgEmbed.addFields({name: "param", value: "Paramètre à configurer", inline: true});
        msgEmbed.addFields({name: "valeur", value: "Valeur de la configuration", inline: true});
        msgEmbed.addFields({name: "Exemple de commande", value: "config prefix *"});
        msgEmbed.setFooter({text : "Pour plus d'informations utiliser la commande \"config help\""});
    } else if (args[1] === "ub") {
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for ub command");

        msgEmbed.setTitle("Help - ub");
        msgEmbed.setDescription("Lancer une partie d'Ultimate Bravery");
        msgEmbed.addFields({name: "Syntaxe de la commande", value: "ub [options:optionnel]"});
        msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
        msgEmbed.addFields({name: "options", value: "rôle à jouer ou champion à jouer, si rien n'est fournit lance sur un champion aléatoire", inline: true});
        msgEmbed.addFields({name: "Exemple de commande", value: "ub top"});
        msgEmbed.setFooter({text : "Pour plus d'informations utiliser la commande \"ub help\""});
    } else if (args[1] === "play") {
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for play command");

        msgEmbed.setTitle("Help - play");
        msgEmbed.setDescription("Lire un son à partir d'un lien ou d'une recherche sur Youtube");
        msgEmbed.addFields({name: "Syntaxe de la commande", value: "play [lien/mots clés"});
        msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
        msgEmbed.addFields({name: "lien / clés", value: "Lien ou mots clés pour faire une recherche du son sur Youtube"});
        msgEmbed.addFields({name: "Exemple de commande", value: "play kekra bloc de glace"});
        msgEmbed.setFooter({text : "Pour plus d'informations utiliser la commande \"play help\""});
    } else if (args[1] === "pause") {
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked pause for skip command");

        msgEmbed.setTitle("Help - pause");
        msgEmbed.setDescription("Mettre en pause la lecture");
        msgEmbed.addFields({name: "Syntaxe de la commande", value: "pause"});
        msgEmbed.addFields({name: "Exemple de commande", value: "pause"});
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"pause help\""});
    } else if (args[1] === "resume") {
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked resume for skip command");

        msgEmbed.setTitle("Help - resume");
        msgEmbed.setDescription("Reprendre la lecture");
        msgEmbed.addFields({name: "Syntaxe de la commande", value: "resume"});
        msgEmbed.addFields({name: "Exemple de commande", value: "resume"});
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"resume help\""});
    } else if (args[1] === "stop") {
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for stop command");

        msgEmbed.setTitle("Help - stop");
        msgEmbed.setDescription("Arrêter la lecture");
        msgEmbed.addFields({name: "Syntaxe de la commande", value: "stop"});
        msgEmbed.addFields({name: "Exemple de commande", value: "stop"});
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"stop help\""});
    } else if (args[1] === "skip") {
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for skip command");

        msgEmbed.setTitle("Help - skip");
        msgEmbed.setDescription("Passer la lecture d'un son ou passer à un son spécifique dans la queue");
        msgEmbed.addFields({name: "Syntaxe de la commande", value: "skip [indice:optionnel]"});
        msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
        msgEmbed.addFields({name: "indice:optionnel", value: "Indice dans la queue de la musique à jouer"});
        msgEmbed.addFields({name: "Exemple de commande", value: "skip 3"});
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"skip help\""});
    } else if (args[1] === "loop") {
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for loop command");

        msgEmbed.setTitle("Help - loop");
        msgEmbed.setDescription("Activer ou désactiver la lecture en boucle de la queue");
        msgEmbed.addFields({name: "Syntaxe de la commande", value: "loop"});
        msgEmbed.addFields({name: "Exemple de commande", value: "loop"});
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"loop help\""});
    } else if (args[1] === "queue") {
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for queue command");

        msgEmbed.setTitle("Help - queue");
        msgEmbed.setDescription("Afficher la queue");
        msgEmbed.addFields({name: "Syntaxe de la commande", value: "queue"});
        msgEmbed.addFields({name: "Exemple de commande", value: "queue"});
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"queue help\""});
    } else if (args[1] === "ping") {
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for ping command");

        msgEmbed.setTitle("Help - ping");
        msgEmbed.setDescription("Tester si le bot répond");
        msgEmbed.addFields({name: "Syntaxe de la commande", value: "ping"});
        msgEmbed.addFields({name: "Exemple de commande", value: "ping"});
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"ping help\""});
    } else if (args[1] === "film") {
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for film command");

        msgEmbed.setTitle("Help - film");
        msgEmbed.setDescription("Propose un film aléatoire parmis le TOP 3 de chaque utilisateurs");
        msgEmbed.addFields({name: "Syntaxe de la commande", value: "film [commande:optionnel] [options:optionnel]"});
        msgEmbed.addFields({name: "Exemple de commande", value: "film"});
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"film help\""});
    } else if (args[1] === "meme") {
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for meme command");

        msgEmbed.setTitle("Help - film");
        msgEmbed.setDescription("Montre un meme stocké par les utilisateurs");
        msgEmbed.addFields({name: "Syntaxe de la commande", value: "meme [add:optionnel] [lien:optionnel]"});
        msgEmbed.addFields({name: "Exemple de commande", value: "meme"});
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"meme help\""});
    } else {
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked for help");

        msgEmbed.addFields({name: "roll [nb_lancers]d[nb_faces]", value: "Lancer des dés de plusieurs faces"});
        msgEmbed.addFields({name: "config [param] [valeur]", value: "Mettre à jour la configuration du bot"});
        msgEmbed.addFields({name: "ub [options:optionnel]", value: "Lancer une partie d'Ultimate Bravery"});
        msgEmbed.addFields({name: "play [lien/mots clés]", value: "Lire un son à partir d'un lien ou d'une recherche sur Youtube"});
        msgEmbed.addFields({name: "pause", value: "Mettre en pause la lecture"});
        msgEmbed.addFields({name: "resume", value: "Reprendre la lecture"});
        msgEmbed.addFields({name: "stop", value: "Arrêter la lecture"});
        msgEmbed.addFields({name: "skip [indice:optionnel]", value: "Passer la lecture d'un son ou passer à un son spécifique de la queue"});
        msgEmbed.addFields({name: "loop", value: "Activer ou désactiver la lecture en boucle de la queue"});
        msgEmbed.addFields({name: "queue", value: "Afficher la queue"});
        msgEmbed.addFields({name: "ping", value: "pong"});
        msgEmbed.addFields({name: "film", value: "Propose un film aléatoire parmis le TOP 3 de chaque utilisateurs"});
        msgEmbed.addFields({name: "meme", value: "Montre un meme stocké par les utilisateurs"});
        msgEmbed.addFields({name: "help [commande:optionnel]", value: "Afficher ce texte"});
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"help [commande]\""});
    }

    message.channel.send({embeds: [msgEmbed]});
}

module.exports = {
    help
}