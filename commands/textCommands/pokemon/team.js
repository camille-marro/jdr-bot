const {EmbedBuilder} = require('discord.js');

let { getPlayerWithId, comparePokemonUUID, updateData, comparePokemon, getPlayerPokemonsWithName, refreshTeam } = require("./assets");
const { emojis } = require("./utils");

/**
 * Fonction pour gérer les commandes "team"
 * @param message
 */
function teamManager(message) {
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

    if (!player.hasOwnProperty("team")) {
        createTeamMessage(message);
        player["team"] = [];
        return;
    }

    refreshTeam(player);

    if (args[2] === "create") {
        createTeam(player, message).then(r => {});
    } else if (args[2] === "print") {
        printTeam(player, message);
    } else if (args[2] === "add") {
        addToTeam(player, args[3], message);
    } else if (args[2] === "remove") {
        removeFromTeam(player, args[3], message);
    } else {
        printTeam(player, message);
    }
}

/**
 * Crée un message embed pour la création d'équipe quand aucune équipe éxiste
 * @param message
 */
function createTeamMessage(message) {
    let msgEmbed = new EmbedBuilder();
    msgEmbed.setTitle("Pour créer une équipe sélectionnez entre 1 et 6 de vos pokémons");
    msgEmbed.setDescription("Utilisez la commande *pokemon team create [pokemon_name_1] [pokemon_name_2] ...*");
    msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});
    msgEmbed.setColor("#00ce5e");

    message.channel.send({embeds: [msgEmbed]});
}

/**
 * Permet de créer une team pour un joueur
 * @param {Object}player - Joueur dont la team doit être créée
 * @param message
 * @returns {Promise<void>}
 */
async function createTeam(player, message) {
    let args = message.content.split(" ");
    let pokemonsToSelect = args.slice(3);
    player["team"] = [];
    for (const pokemonName of pokemonsToSelect) {

        selectPokemonToAdd(player, pokemonName, message).then((pokemonSelected, rej) => {
            if (!pokemonSelected) {
                let msgEmbed = new EmbedBuilder();
                msgEmbed.setTitle("Vous n'avez aucun pokémon de ce nom !");
                msgEmbed.setDescription("Vérifier l'orthographe du nom ou votre liste de pokémon avec la commande *pokemon list* !");
                msgEmbed.setColor("#ff0000");
                msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                message.channel.send({embeds: [msgEmbed]});
            } else {
                let msgEmbed = addPokemonToPlayerTeam(player, pokemonSelected);
                message.channel.send({embeds: [msgEmbed]});
                updateData();
            }
        });
    }
}

/**
 * Permet à l'utilsateur de choisir le pokémon à ajouter
 * @param {Object}player - Joueur qui doit choisir
 * @param {String}pokemonName - Nom du pokémon à ajouter
 * @param message
 * @returns {Promise<unknown>}
 */
async function selectPokemonToAdd(player, pokemonName, message) {
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

/**
 * Ajoute un pokémon à la team d'un joueur
 * @param {Object}player - Joueur à qui ajouter un pokémon
 * @param {Object}pokemon - Pokémon à ajouter
 * @returns {EmbedBuilder}
 */
function addPokemonToPlayerTeam(player, pokemon) {
    let team = player["team"];

    if (team.length > 6) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Votré équipe est pleine !");
        msgEmbed.setDescription("Pour retirer des pokémons de votre équipe utilisez la commande *pokemon team remove* !");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

        return msgEmbed;
    }

    let i = 0;
    while (i < team.length) {
        if (comparePokemon(team[i], pokemon)) {
            let msgEmbed = new EmbedBuilder();
            msgEmbed.setTitle(pokemon.name + " appartient déjà à votre équipe !");
            msgEmbed.setDescription("Pour modifier votre équipe utilisez la commande *pokemon team add/remove* !");
            msgEmbed.setColor("#ff0000");
            msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

            return msgEmbed;
        }
        i++;
    }

    team.push(pokemon);

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setTitle(pokemon.name + " a été ajouté à votre équipé avec succès !");
    msgEmbed.setColor("#08ff00");
    msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

    return msgEmbed;
}

/**
 * Affiche l'équipe d'un joueur
 * @param {Object}player - Joueur dont la team doit être affichée
 * @param message
 */
function printTeam(player, message) {
    let msgEmbed = new EmbedBuilder();
    msgEmbed.setTitle("Votre équipe est composée de : ");
    msgEmbed.setColor("#285eb2");
    msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});
    player["team"].forEach(pokemon => {
        let name;
        let value;
        if (pokemon["shiny"]) name = pokemon.name + ":sparkles: (lvl:" + pokemon.level+ ")";
        else name = pokemon.name + " (lvl:" + pokemon.level + ")";
        if (pokemon["currentHP"] > 0) value = pokemon["currentHP"] + "/" + pokemon["stats"][0] + " HP";
        else value = "K.O.";

        msgEmbed.addFields({name: name, value: value, inline: true});
    });

    message.channel.send({embeds: [msgEmbed]});
}

/**
 * Permet d'ajouter un pokémon à la team d'un joueur
 * @param {Object}player - Joueur chez qui ajouter un pokémon
 * @param {String}pokemonName - Nom du pokémon à ajouter
 * @param message
 */
function addToTeam(player, pokemonName, message) {
    selectPokemonToAdd(player, pokemonName, message).then((pokemonSelected, rej) => {
        if (!pokemonSelected) {
            let msgEmbed = new EmbedBuilder();
            msgEmbed.setTitle("Vous n'avez aucun pokémon de ce nom !");
            msgEmbed.setDescription("Vérifier l'orthographe du nom ou votre liste de pokémon avec la commande *pokemon list* !");
            msgEmbed.setColor("#ff0000");
            msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

            message.channel.send({embeds: [msgEmbed]});
            return;
        }
        let msgEmbed = addPokemonToPlayerTeam(player, pokemonSelected);
        message.channel.send({embeds: [msgEmbed]});
        updateData();
    });
}

/**
 * Supprime un pokémon de la team d'un joueur
 * @param {Object}player - Joueur à qui supprimer le pokémon
 * @param {String}pokemonName - Nom du pokémon à supprimer
 * @param message
 */
function removeFromTeam(player, pokemonName, message) {
    selectPokemonToRemove(player, pokemonName, message).then((pokemonSelected, rej) => {
        let msgEmbed = removePokemonFromPlayerTeam(player, pokemonSelected);
        message.channel.send({embeds: [msgEmbed]});
        updateData();
    });
}

/**
 * Permet au joueur de sélectionner le pokémon à supprimer si plusieurs sont trouvés
 * @param {Object}player - Joueur qui doit choisir
 * @param {String}pokemonName - Nom du pokémon
 * @param message
 * @returns {Promise<unknown>}
 */
async function selectPokemonToRemove(player, pokemonName, message) {
    return new Promise(async (resolve, reject) => {
        let pokemons = getPlayerTeamsPokemonsWithName(player, pokemonName);
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
 * Supprime un pokémon de la team d'un joueur
 * @param {Object}player - Joueur à qui supprimer le pokémon
 * @param {Object}pokemon - Pokémon à supprimer
 * @returns {EmbedBuilder} - Renvoie le message attribué à l'action faite
 */
function removePokemonFromPlayerTeam(player, pokemon) {
    let team = player["team"];

    if (team.length <= 0) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Votré équipe est déjà vide !");
        msgEmbed.setDescription("Pour ajouter des pokémons de votre équipe utilisez la commande *pokemon team add* !");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

        return msgEmbed;
    }

    let i = 0;
    while (i < team.length) {
        if (comparePokemon(team[i], pokemon)) {
            team.splice(i, 1);
            let msgEmbed = new EmbedBuilder();
            msgEmbed.setTitle(pokemon.name + " a été retiré de votre équipé avec succès !");
            msgEmbed.setColor("#08ff00");
            msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

            return msgEmbed;
        }
        i++;
    }

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setTitle(pokemon.name + "n'appartient pas à votre équipe !");
    msgEmbed.setDescription("Pour modifier votre équipe utilisez la commande *pokemon team add/remove* !");
    msgEmbed.setColor("#ff0000");
    msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

    return msgEmbed;
}

/**
 * Récupère le ou les pokémons d'une team d'un joueur en fonction de leurs noms
 * @param {Object}player - Joueur chez qui chercher le pokémon
 * @param {String}pokemonName - Nom du pokémon à chercher
 * @returns {boolean|*[]} - Renvoie faux si aucun pokémon n'est trouvé sinon renvoie une liste des pokémons trouvés
 */
function getPlayerTeamsPokemonsWithName(player, pokemonName) {
    let pokemons = [];
    player["team"].forEach(pokemon => {
        if (pokemon.name.toLowerCase() === pokemonName.toLowerCase()) {
            pokemons.push(pokemon);
        }
    });

    if (pokemons.length >= 1) {
        return pokemons;
    } else return false;
}

module.exports = {
    teamManager
}