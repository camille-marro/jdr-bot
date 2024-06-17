const {EmbedBuilder} = require('discord.js');

function help(message) {
    let args = message.content.split(' ');

    let msgEmbed;
    if (args[2] === "start") {
        msgEmbed = helpStart();
    } else if (args[2] === "continue") {
        msgEmbed = helpContinue();
    } else if (args[2] === "reset") {
        msgEmbed = helpReset();
    } else {
        msgEmbed = helpGlobal();
    }

    message.channel.send({embeds: [msgEmbed]});
}

/**
 * Message d'aide pour la commande start
 * @returns {EmbedBuilder}
 */
function helpStart() {
    let msgEmbed = new EmbedBuilder();

    msgEmbed.setTitle("Aventure - Start");
    msgEmbed.setDescription("Permet de commencer son aventure !");
    msgEmbed.setFooter({text: "pour plus d'informations utilisez la commande \"av help\"."});
    msgEmbed.setColor("#6e0e91");
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "av start [nom] [mode_selection]"});
    msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
    msgEmbed.addFields({name: "nom", value: "Nom de votre personnage", inline: true});
    msgEmbed.addFields({name: "mode_selection", value: "Mode de sélection des compétences : select, random", inline: true});
    msgEmbed.addFields({name: "Exemple de commande", value: "av start Poulpos select"});

    return msgEmbed;
}

/**
 * Message d'aide pour la commande continue
 * @returns {EmbedBuilder}
 */
function helpContinue() {
    let msgEmbed = new EmbedBuilder();

    msgEmbed.setTitle("Aventure - Continue");
    msgEmbed.setDescription("Permet de reprendre ou commencer son aventure.");
    msgEmbed.setFooter({text: "pour plus d'informations utilisez la commande \"av help\"."});
    msgEmbed.setColor("#6e0e91");
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "av continue"});
    msgEmbed.addFields({name: "Exemple de commande", value: "av continue"});

    return msgEmbed;
}

/**
 * Message d'aide pour la commande reset
 * @returns {EmbedBuilder}
 */
function helpReset() {
    let msgEmbed = new EmbedBuilder();

    msgEmbed.setTitle("Aventure - Reset");
    msgEmbed.setDescription("Permet de réinitialiser certaines choses");
    msgEmbed.setFooter({text: "pour plus d'informations utilisez la commande \"av help\"."});
    msgEmbed.setColor("#6e0e91");
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "av reset [data]"});
    msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
    msgEmbed.addFields({name: "data", value: "Ce que vous voulez réinitialiser : story, perso/personnage", inline: true});
    msgEmbed.addFields({name: "Exemple de commande", value: "av reset personnage"});

    return msgEmbed;
}

/**
 * Message d'aide global
 * @returns {EmbedBuilder}
 */
function helpGlobal() {
    let msgEmbed = new EmbedBuilder();

    msgEmbed.setTitle("Help - Aventure");
    msgEmbed.setDescription("Permet de joueur une aventure dont vous êtes le héros ! Pour chaque commande il y existe un menu help pour l'afficher utiliser la commande **av help [commande]**.");
    msgEmbed.setFooter({text: "pour plus d'informations utilisez la commande \"av help\"."});
    msgEmbed.setColor("#6e0e91");
    msgEmbed.addFields({name: "start", value: "Permet de commencer votre aventure"});
    msgEmbed.addFields({name: "continue", value: "Permet de reprendre votre aventure"});
    msgEmbed.addFields({name: "reset", value: "Permet de réinitialiser des choses de votre aventure"});

    return msgEmbed;
}

module.exports = {
    help
}