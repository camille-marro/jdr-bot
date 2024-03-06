const {EmbedBuilder} = require('discord.js');

let { getPlayerWithId, healAllPokemons } = require("./assets");

/**
 * Fonction pour lancer la commande heal
 * @param message
 */
function healPokemons(message) {
    let player = getPlayerWithId(message.author.id);

    if (!player) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Vous n'avez pas de compte !");
        msgEmbed.setDescription("Pour vous inscrire utilisez la commande *pokemon start* !");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

        message.channel.send({embeds: [msgEmbed]});
        return;
    }

    if (!checkTimeHeal(player)) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Vous ne pouvez soigner vos pokémons qu'une fois par heure");
        msgEmbed.setDescription("Votre prochain soin sera disponible dans : " + getHealingTime(player));
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

        message.channel.send({embeds: [msgEmbed]});
        return;
    }

    healAllPokemons(player);

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setTitle("Tous vos pokémons ont été soignés!");
    msgEmbed.setColor("#bf62c9");
    msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

    message.channel.send({embeds: [msgEmbed]});
}

/**
 * Vérifie si le dernier temps de heal est inférieur à 1 heure
 * @param {Object}player - Joueur à vérifier
 * @returns {boolean} - Renvoie true si le heal est possible sinon renvoie false
 */
function checkTimeHeal(player) {
    return ((new Date().getTime() - player["lastHeal"]) / (1000 * 60 * 60)) >= 1;
}

/**
 * Renvoie sous forme de string le temps restant avant le prochain heal
 * @param {Object}player - Joueur pour qui il faut calculer le temps
 * @returns {string} - String du temps restant
 */
function getHealingTime(player) {
    let diff = new Date().getTime() - player["lastHeal"];

    let finalDiff = 3600000 - diff //3600000 === 1 heure

    const seconds = Math.floor(finalDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    return `${hours % 24} heure(s), ${minutes % 60} minute(s) et ${seconds % 60} seconde(s)`;
}

module.exports = {
    healPokemons
}