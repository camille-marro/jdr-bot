const {EmbedBuilder} = require('discord.js');

let { getPlayerWithId, catchPokemon, getPlayerPokemonsWithName, addExp, healAllPokemons, updateData, drawPokemonWithName, resetExplorePlayer, resetAllPlayers, resetTrainingPlayer, resetPlayer } = require("./assets");
const { emojis } = require('./utils');

/**
 * Fonction pour choisir quelle commande administrateur est à utiliser
 * @param message
 */
function admin(message) {
    if (message.author.id.toString() !== "198381114602160128") return;
    let args = message.content.split(" ");
    if (args[2] === "give") {
        adminGivePokemonToDiscordId(args[3], args[4], message);
    } else if (args[2] === "resetAll") {
        resetAllPlayers(message);
    } else if (args[2] === "reset") {
        resetPlayer(args[3], message);
    } else if (args[2] === "resetTraining") {
        resetTrainingPlayer(args[3], message);
    } else if (args[2] === "resetExplore") {
        resetExplorePlayer(args[3], message);
    } else if (args[2] === "giveXP") {
        giveXpToPokemon(args[3], args[4], args[5], message);
    } else if (args[2] === "heal") {
        adminHeal(args[3], message);
    }
}

/**
 * Commande administrateur pour donner un pokémon a un joueur avec son ID Discord
 * @param pokemonName - Nom du pokémon à donner
 * @param playerDiscordId - ID Discord du joueur
 * @param message
 */
function adminGivePokemonToDiscordId(pokemonName, playerDiscordId, message) {
    let player = getPlayerWithId(playerDiscordId);
    if (!player) {
        message.channel.send("Aucun joueur trouvé !");
        return;
    }

    let pokemon = drawPokemonWithName(pokemonName);
    if (!pokemon) {
        message.channel.send("Aucun pokémon trouvé !");
        return;
    }

    catchPokemon(pokemon, player["discordId"]);
    message.channel.send(pokemon["name"] + " a été ajouté avec succès à l'inventaire de <@" + playerDiscordId + ">");
}

/**
 * Ajoute un montant d'expérience au pokémon d'un joueur
 * @param {Number}xpAmount - Montant d'expérience à ajouter
 * @param {String}pokemonName - Nom du pokémon à qui ajouter l'expérience
 * @param {BigInteger}playerId - ID Discord du joueur
 * @param message
 */
function giveXpToPokemon(xpAmount, pokemonName, playerId, message) {
    let player = getPlayerWithId(playerId);
    if (!player) {
        message.channel.send("Aucun joueur trouvé !");
        return;
    }

    let pokemons = getPlayerPokemonsWithName(player, pokemonName);
    selectPokemon(player, pokemons, message).then((pokemonSelected, rej) => {
        addExp(pokemonSelected, parseInt(xpAmount), message).then((res, rej) => {
            message.channel.send(xpAmount + " point d'xp ont été ajoutés au " + pokemonSelected.name + " de <@" + playerId + ">. Il a gagné " + res + " niveau(x).");
            updateData();
        });
    })

}

/**
 * Permet à l'utilsateur de choisir un pokémon parmi une liste de pokémons
 * @param {Object}player - Joueur qui doit choisir
 * @param {Object[]}pokemons - Liste des pokémons à choisir
 * @param message
 * @returns {Promise<unknown>}
 */
async function selectPokemon(player, pokemons, message) {
    return new Promise(async (resolve, reject) => {
        if (pokemons.length > 1) {
            // choisir le pokemon à ajouter
            let msgEmbed = createEmbedCreateTeam(pokemons);
            let msgSent = await message.channel.send({embeds: [msgEmbed]});

            for (let i = 0; i < pokemons.length; i++) {
                await msgSent.react(emojis[i]);
            }

            const filter = (reaction, user) => {
                return emojis.includes(reaction.emoji.name) && !user.bot;
            };

            let collector = msgSent.createReactionCollector(filter, {time: 15000});

            collector.on('collect', (reaction, user) => {
                if (user.id === message.author.id) {
                    let i = 0;
                    while (i < pokemons.length) {
                        if (reaction.emoji.name === emojis[i]) {
                            collector.stop();
                            resolve(pokemons[i]);
                            return;
                        }
                        i++;
                    }
                } else if (!user.bot) {
                    let msgEmbed = new EmbedBuilder();
                    msgEmbed.setTitle("Vous ne pouvez pas réagir aux messages des autres !");
                    msgEmbed.setDescription("<@" + user.id + "> fait plus ça c'est pas bien !");
                    msgEmbed.setColor("#ff0000");
                    msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                    message.channel.send({embeds: [msgEmbed]});
                }
            });

        } else resolve(pokemons[0]);
    });
}

/**
 * Crée un message embed pour la création d'une équipe
 * @param {Object[]}pokemons - Liste des pokémons du joueur
 * @returns {EmbedBuilder|boolean} - Renvoie faux s'il y a trop de pokémon renvoie le message sinon
 */
function createEmbedCreateTeam(pokemons) {
    if (pokemons.length > 15) return false;

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setTitle("Choisissez le pokémon à ajouter à l'équipe");
    msgEmbed.setDescription("Pour choisir le pokémon il suffit de réagir à l'émote attribuée au pokémon voulu");
    msgEmbed.setColor("#c0763b");
    msgEmbed.setFooter({text:"Pour plus d'informations utilisez la commande *pokemon help*."});
    let i = 0;
    pokemons.forEach(pokemon => {
        let pokemonName = pokemon.name;
        if (pokemon.shiny) pokemonName += ":sparkles:";
        pokemonName += "(lvl: " + pokemon.level + ")";
        msgEmbed.addFields({name: pokemonName, value: emojis[i], inline: true});
        i++;
    });

    return msgEmbed;
}

function adminHeal(playerId, message) {
    let player = getPlayerWithId(playerId);
    if (!player) {
        message.channel.send("Aucun joueur avec cet ID !");
        return;
    }
    let healTime = player["lastHeal"];
    healAllPokemons(player);
    player["lastHeal"] = healTime;
    message.channel.send("Tous les pokémons de <@" + playerId + "> ont été soignés avec succès !");
}

module.exports = {
    admin
}