const {EmbedBuilder} = require('discord.js');

let { getPlayerWithId, getPlayerPokemonsWithName, drawPokemonWithId } = require("./assets");
const { emojis } = require("./utils");

/**
 * Fonction qui permet de lancer la commande info
 * @param message
 * @returns {Promise<void>}
 */
async function infosPokemon(message) {
    let args = message.content.split(" ");
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

    if (!args[2]) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Veuillez saisir un nom de pokémon à entrainer !");
        msgEmbed.setDescription("La commande s'utilise comme ceci : pokemon info nom_du_pokemon.");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande *pokemon help*."});

        message.channel.send({embeds: [msgEmbed]});
        return;
    }

    let pokemons = getPlayerPokemonsWithName(player, args[2]);
    if (!pokemons) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Vous n'avez aucun pokémon de ce nom !");
        msgEmbed.setDescription("Vérifier qu'il n'y aucune faute de syntaxe ou que vous possédez bien ce pokémon.");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande *pokemon help*."});

        message.channel.send({embeds: [msgEmbed]});
    } else if (pokemons.length > 1) {
        choosePokemonInfo(pokemons, message).then(pokemon => {
            resultInfos(message, pokemon);
        });
    } else {
        await resultInfos(message, pokemons[0]);
    }
}

/**
 * Permet de choisir un pokémon quand il y en a plusieurs du même nom dans l'équipe du joueur pour la commande "info"
 * @param pokemons
 * @param message
 * @returns {Promise<unknown>}
 */
function choosePokemonInfo(pokemons, message) {
    return new Promise(async (resolve, reject) => {
        let msgEmbed = createEmbedInfoPokemons(pokemons);
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
    })
}

/**
 * Permet d'attendre le choix d'un pokémon et de filtrer les résultats de l'entrainement
 * @param message
 * @param pokemon
 */
function resultInfos(message, pokemon) {
    let msgEmbed = new EmbedBuilder();
    let pokemonInfos = drawPokemonWithId(pokemon["id"]);

    let title = '';

    if (pokemon["shiny"]) title = pokemon["name"] + ":sparkles: (lvl: " + pokemon["level"] + ")";
    else title = pokemon["name"] + " (lvl: " + pokemon["level"] + ")";

    if (pokemon["currentHP"] === 0) title += " - K.O.";
    msgEmbed.setTitle(title);
    msgEmbed.setColor("#ffffff");
    msgEmbed.setDescription(pokemonInfos["description"]);
    msgEmbed.addFields({name:"Sexe", value:pokemon['sex'], inline: true});
    msgEmbed.addFields({name:"XP", value:(pokemon["xp"] + "/" + Math.pow(pokemon["level"], 2)), inline: true});
    msgEmbed.addFields({name:" ", value:" "});
    msgEmbed.addFields({name:"Taille", value:pokemon["size"] + " m", inline: true});
    msgEmbed.addFields({name:"Poids", value:pokemon["weight"] + " kg", inline: true});
    msgEmbed.addFields({name:"Stats", value:" "});
    msgEmbed.addFields({name:"PV", value:pokemon["currentHP"] + "/" + pokemon["stats"][0].toString(), inline: true});
    msgEmbed.addFields({name:"ATT", value:pokemon["stats"][1].toString(), inline: true});
    msgEmbed.addFields({name:"DEF", value:pokemon["stats"][2].toString(), inline: true});
    msgEmbed.addFields({name:"ATT SPE", value:pokemon["stats"][3].toString(), inline: true});
    msgEmbed.addFields({name:"DEF SPE", value:pokemon["stats"][4].toString(), inline: true});
    msgEmbed.addFields({name:"VIT", value:pokemon["stats"][5].toString(), inline: true});
    msgEmbed.addFields({name:"\nCompétences", value:" "});

    let i = 1;
    pokemon["capacities"].forEach(capacity => {
        msgEmbed.addFields({name:capacity.name, value:"Attaque " + capacity.category + "\nPuissance : " + capacity.puissance + "\nPrecision : " + capacity.precision + " %", inline:true});
        if ((i % 2) === 0) msgEmbed.addFields({name:" ", value:" "});
        i++;
    })

    if (pokemon["evolveLvl"] >= 1) msgEmbed.addFields({name:"Prochaine évolution", value: "niveau " + pokemon["evolveLvl"].toString()});

    message.channel.send({embeds: [msgEmbed]});
}

/**
 * Créé un message embed pour afficher les informations des pokémons
 * @param {Object[]}pokemons -
 * @returns {EmbedBuilder|boolean} - Renvoie faux s'il y a trop de pokémons
 */
function createEmbedInfoPokemons(pokemons) {
    if (pokemons.length > 15) return false;

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setTitle("Choisissez le pokémon dont il faut afficher les informations");
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
    infosPokemon
}