const {EmbedBuilder} = require('discord.js');

let { getPlayerWithId, getPlayerPokemonsWithName, updateData, comparePokemon } = require("./assets");
const { emojis } = require("./utils");

/**
 * Permet de relâcher un pokémon
 * @param message
 */
function releasePokemonMain(message) {
    let player = getPlayerWithId(message.author.id);
    let args = message.content.split(" ");

    if (!player) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Vous n'avez pas de compte !");
        msgEmbed.setDescription("Pour vous inscrire utilisez la commande *pokemon start* !");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

        message.channel.send({embeds: [msgEmbed]});
        return;
    }

    if (!args[2]) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Vous devez préciser le nom du pokémon à relâcher !");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

        message.channel.send({embeds: [msgEmbed]});
        return;
    }

    selectPokemonToRelease(player, args[2], message).then((pokemonSelected, rej) => {
        if (!pokemonSelected) {
            let msgEmbed = new EmbedBuilder();
            msgEmbed.setTitle("Vous n'avez aucun pokémon de ce nom !");
            msgEmbed.setDescription("Vérifier l'orthographe du nom ou votre liste de pokémon avec la commande *pokemon list* !");
            msgEmbed.setColor("#ff0000");
            msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

            message.channel.send({embeds: [msgEmbed]});
            return;
        }
        let isReleased = releasePokemon(player, pokemonSelected);
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});
        if (isReleased) {
            msgEmbed.setTitle("Votre " + pokemonSelected.name + " a été relaché !");
            msgEmbed.setDescription("Adieu " + pokemonSelected.name + " !");
            msgEmbed.setColor("#309393");
        } else {
            msgEmbed.setTitle("Une erreur est survenue ! ");
            msgEmbed.setColor("#ff0000");
        }
        message.channel.send({embeds: [msgEmbed]});
        updateData();
    });
}

/**
 * Permet de faire choisir au joueur le pokémon à relâcher
 * @param {Object}player - Joueur qui doit choisir
 * @param {String}pokemonName - Nom du pokémon à relâcher
 * @param message
 * @returns {Promise<unknown>}
 */
async function selectPokemonToRelease(player, pokemonName, message) {
    return new Promise(async (resolve, reject) => {
        let pokemons = getPlayerPokemonsWithName(player, pokemonName);
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
 * Supprime un pokémon de la liste de pokémon d'un joueur
 * @param {Object}player - Joueur à qui supprimer un pokémon
 * @param {Object}pokemon - Pokémon à supprimer
 * @returns {boolean} - Renvoie vrai si le pokémon est supprimé renvoie faux sinon
 */
function releasePokemon(player, pokemon) {
    let i = 0;
    while (i < player["pokemons"].length) {
        if (comparePokemon(player["pokemons"][i], pokemon)) {
            player["pokemons"].splice(i, 1);
            return true;
        }
        i++;
    }
    return false;
}

/**
 * Crée un message embed pour la création d'une équipe
 * @param {Object[]}pokemons - Liste des pokémons du joueur
 * @returns {EmbedBuilder|boolean} - Renvoie faux s'il y a trop de pokémon renvoie le message sinon
 */
function createEmbedCreateTeam(pokemons) {
    if (pokemons.length > 15) return false;

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setTitle("Choisissez le pokémon à relâcher");
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

module.exports = {
    releasePokemonMain
}
