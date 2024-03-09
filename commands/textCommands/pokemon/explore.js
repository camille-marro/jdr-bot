const {EmbedBuilder} = require('discord.js');

let assets = require("./assets");
const { emojis } = require("./utils");
const {getPlayerPokemonsWithName} = require("./assets");


/**
 * Envoie un message embed avec 3 à 5 pokémons aléatoires attrapables et permet via une réaction d'en attraper un
 * @param {Object}message
 * @returns {Promise<void>}
 */
async function exploreGrass(message) {
    let msgEmbed = new EmbedBuilder();
    let player = assets.getPlayerWithId(message.author.id);
    if (!player) {
        msgEmbed.setTitle("Vous n'avez pas de compte !");
        msgEmbed.setDescription("Pour vous inscrire utilisez la commande *pokemon start* !");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

        message.channel.send({embeds: [msgEmbed]});
        return;
    }
    if (!checkTimeExplore(player)) {
        msgEmbed.setTitle("Vous ne pouvez explorer les hautes herbes qu'une fois par heure");
        msgEmbed.setDescription("Votre prochaine exploration sera disponible dans : " + getWaitingTime(player));
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

        message.channel.send({embeds: [msgEmbed]});
        return;
    } else {
        setExploreTime(player);
    }

    let nbRencontres = Math.floor(Math.random() * (5 - 3) + 3);
    let pokemonsFound = getPokemons(nbRencontres);

    msgEmbed.setTitle("Vous avez rencontré " + nbRencontres + " pokémons dans les hautes herbes !");
    msgEmbed.setDescription("Si vous souhaitez attraper un des ces pokémons réagissez avec l'émoji correspondant");
    msgEmbed.setColor("#f8f055");
    for (let i = 0; i < nbRencontres; i++) {
        let checkPokemon = getPlayerPokemonsWithName(player, pokemonsFound[i].name);
        let newStr = "";
        if (!checkPokemon) newStr = " *(new)*"
        if (pokemonsFound[i]["shiny"]) {
            msgEmbed.addFields({name: pokemonsFound[i].name + " :sparkles:" + newStr, value: emojis[i], inline: true});
        } else {
            msgEmbed.addFields({name: pokemonsFound[i].name + newStr, value: emojis[i], inline: true});
        }

    }
    msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help"});

    let msgSent = await message.channel.send({embeds: [msgEmbed]});

    for (let i = 0; i< nbRencontres; i++) {
        await msgSent.react(emojis[i]);
    }

    const filter = (reaction, user) => {
        return emojis.includes(reaction.emoji.name) && !user.bot;
    };

    const collector = msgSent.createReactionCollector(filter, {time: 15000});

    let msgEmbedCatch;
    collector.on('collect', (reaction, user) => {
        if (user.id === message.author.id) {
            let i = 0;
            while(i < nbRencontres) {
                if (reaction.emoji.name === emojis[i]) {
                    msgEmbedCatch = assets.catchPokemon(pokemonsFound[i], message.author.id)
                }
                i++;
            }

            collector.stop();
            message.channel.send({embeds: [msgEmbedCatch]});
        } else if (!user.bot) {
            let msgEmbed = new EmbedBuilder();
            msgEmbed.setTitle("Vous ne pouvez pas attraper les pokémons des autres !");
            msgEmbed.setDescription("<@" + user.id + "> vient d'essayer de voler un pokémon ! Pour attraper un pokémon faites la commande *pokemon explore*.");
            msgEmbed.setColor("#ff0000");
            msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

            message.channel.send({embeds: [msgEmbed]});
        }
    });
}

/**
 * Renvoie sous forme de string le temps restant avant la prochaine exploration
 * @param {Object}player - Joueur pour qui il faut calculer le temps
 * @returns {string} - String du temps restant
 */
function getWaitingTime(player) {
    let diff = new Date().getTime() - player["lastExplore"];

    let finalDiff = 3600000 - diff //3600000 === 1 heure

    const seconds = Math.floor(finalDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    return `${hours % 24} heure(s), ${minutes % 60} minute(s) et ${seconds % 60} seconde(s)`;
}

/**
 * Vérifie si le dernier temps d'exploration est inférieur à 1 heure
 * @param {Object}player - Joueur à vérifier
 * @returns {boolean} - Renvoie true si l'exploration est possible sinon renvoie false
 */
function checkTimeExplore(player) {
    return ((new Date().getTime() - player["lastExplore"]) / (1000 * 60 * 60)) >= 1;
}

/**
 * Définit l'attribut lastExplore d'un joueur à la date actuelle
 * @param {Object}player - Joueur à qui mettre à jour la dernière exploration
 */
function setExploreTime(player) {
    player["lastExplore"] = new Date().getTime();
}

/**
 * Récupérer des pokémons aléatoirement parmi la liste de tous les pokémons
 * @param {Number}nbRencontres - Nombre de pokémons à récupérer
 * @returns {Object[]} - Liste des pokémons récupérés
 */
function getPokemons(nbRencontres) {
    let pokemonFounds = [];
    for (let i = 0; i < nbRencontres; i++) {
        pokemonFounds.push(assets.drawPokemon());
    }

    return pokemonFounds;
}

module.exports = {
    exploreGrass
}