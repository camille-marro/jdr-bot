let fs = require('fs');
const path = require("path");

const {EmbedBuilder} = require('discord.js');
const {v4: uuid } = require('uuid');

const log = require('../../../assets/log');
const { loadPokemonData, emojis } = require("./utils");

let pokemonData = loadPokemonData();

/**
 * Récupère l'objet joueur en fonction de son ID renvoie false s'il n'existe pas
 * @param {BigInteger}playerId - ID Discord du joueur à récupérer
 * @returns {Object|boolean} - Objet représentant le joueur
 */
function getPlayerWithId(playerId) {
    let players = pokemonData["players"];
    let i = 0
    while (i < players.length) {
        if (players[i]["discordId"] === playerId.toString()) {
            return players[i];
        }
        i++;
    }
    return false;
}

/**
 * Ajoute le pokémon à l'inventaire du joueur et renvoie un message embed du résultat
 * @param {Object}pokemon - Pokémon à ajouter
 * @param {BigInteger}playerId - ID Discord du joueur
 * @returns {EmbedBuilder} - Message embed du résultat
 */
function catchPokemon(pokemon, playerId) {
    let msgEmbed = new EmbedBuilder();

    let newPokemon = parsePokemon(pokemon);
    let player = getPlayerWithId(playerId);

    player["pokemons"].push(newPokemon);

    msgEmbed.setTitle("Vous avez attrapé un " + newPokemon.name + " !");
    if (newPokemon.sex === "F") msgEmbed.setDescription("Votre nouveau " + newPokemon.name + " est une femelle !");
    else msgEmbed.setDescription("Votre nouveau " + newPokemon.name + " est un male !");
    msgEmbed.setColor("#38a803");
    msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help"});

    updateData();

    return msgEmbed;
}

/**
 * Permet de modifier l'objet pokémon de base avant de l'ajouter à l'inventaire d'un joueur pour avoir les bons attributs
 * @param {Object}pokemon - Pokemon à parser
 * @returns {{types: *, eggGroups, level: number, sex: string, weight, description, stade: (number|string|*), evolve: (number|string|*), evolveLvl: (number|string|*), eggHatchTime: *, size, stats: *, name, id, category: *, talents: ([*|jQuery|string]|*)}}
 */
function parsePokemon(pokemon) {
    let sex;
    let randInt = Math.random() * 1000;

    if (randInt > pokemon.sex) sex = "F";
    else sex = "M";

    randInt = Math.floor(Math.random() * 50) + 1;
    randInt -= 25;
    randInt = randInt / 100;
    randInt += 1;
    let size = parseFloat((pokemon['size'] * randInt).toFixed(2));

    randInt = Math.floor(Math.random() * 50) + 1;
    randInt -= 25;
    randInt = randInt / 100;
    randInt += 1;
    let weight = parseFloat((pokemon['weight'] * randInt).toFixed(2));

    let stats = [];
    for (let i = 0; i < pokemon["stats"].length; i++) {
        if (i === 0) stats.push(Math.ceil(((pokemon["stats"][0] * 2) / 100) + 11));
        else stats.push(Math.ceil(((pokemon["stats"][0] * 2) / 100) + 5));
    }

    let ivs = [];
    for (let i = 0; i < 6; i++) {
        ivs.push(Math.floor(Math.random() * 31))
    }

    let evolveLvl = false;
    if (Array.isArray(pokemon["evolveLvl"])) {
        let i = 0;
        while (i < pokemon["evolveLvl"].length) {
            if (pokemon["evolveLvl"][i] !== -1) {
                evolveLvl = pokemon["evolveLvl"][i];
                break;
            }
            i++;
        }
        if (evolveLvl === false) {
            evolveLvl = -1;
        }
    } else {
        evolveLvl = pokemon["evolveLvl"];
    }

    let capacities = getCapacities(pokemon.name, 0);
    if (capacities.length > 4) {
        capacities = getRandomCapacities(capacities, 4);
    }

    return {
        "uuid": uuid(),
        "id": pokemon.id,
        "name" : pokemon.name,
        "types": pokemon.types,
        "level": 1,
        "xp": 0,
        "sex": sex,
        "evolveLvl": evolveLvl,
        "size": size,
        "weight": weight,
        "currentHP": stats[0],
        "shiny": pokemon.shiny,
        "stats": stats,
        "ivs": ivs,
        "capacities": capacities
    }
}

function getRandomCapacities(capacities, nb) {
    let finalCap = [];

    for (let i = 0; i < nb; i++) {
        let rand = Math.floor(Math.random() * capacities.length);
        finalCap.push(capacities[rand]);
        capacities.splice(rand, 1);
    }

    return finalCap;
}

/**
 * Récupère sous forme de tableau les compétences d'un pokémons pour un niveau donné
 * @param {String}pokemonName - Nom du pokémon
 * @param {Number}pokemonLvl - Niveau du pokémon
 * @returns {[]}
 */
function getCapacities(pokemonName, pokemonLvl) {
    return (drawPokemonWithName(pokemonName)["capacites"][pokemonLvl]);
}

/**
 * Renvoie un pokemon en fonction de son nom
 * @param {String}pokemonName - nom du pokémon à récupérer
 * @returns {Object|Boolean} - Pokémon associé au nom indiqué renvoie false s'il n'existe pas
 */
function drawPokemonWithName(pokemonName) {
    let i = 0;
    while (i < pokemonData["pokemons"].length) {
        if (pokemonData["pokemons"][i]["name"] === pokemonName) {
            let pokemon = JSON.parse(JSON.stringify(pokemonData["pokemons"][i]));
            pokemon["shiny"] = Math.floor(Math.random() * 127) === 1; // si on a 1 pokemon["shiny"] = true sinon = false
            return pokemon;
        }
        i++;
    }
    return false;
}

/**
 * Renvoie un pokémon aléatoire parmi la liste de pokémon du fichier JSON.
 * Le pokémon renvoyé peut être shiny avec une chance sur 128.
 * L'objet renvoyé est une copie non liée de l'objet de base.
 * @returns {Object} - Pokémon choisit aléatoirement
 */
function drawPokemon() {
    let pokemon = JSON.parse(JSON.stringify(pokemonData["pokemons"][Math.floor(Math.random() * pokemonData["pokemons"].length)]));
    pokemon["shiny"] = Math.floor(Math.random() * 127) === 1; // si on a 1 pokemon["shiny"] = true sinon = false
    return pokemon;
}

/**
 * Renvoie un pokemon en fonction de son ID
 * @param {Number}pokemonId - ID du pokémon à récupérer
 * @returns {Object|Boolean} - Pokémon associé à l'ID indiqué renvoie false s'il n'existe pas
 */
function drawPokemonWithId(pokemonId) {
    let pokemon = JSON.parse(JSON.stringify(pokemonData["pokemons"][pokemonId-1]));
    pokemon["shiny"] = Math.floor(Math.random() * 127) === 1; // si on a 1 pokemon["shiny"] = true sinon = false
    if (!pokemon) return false
    else return pokemon
}

/**
 * Fonction pour actualiser le fichier json qui sert de stockage de donnée
 */
function updateData() {
    fs.writeFileSync(path.resolve(__dirname, "../../../json_files/pokemon.json"), JSON.stringify(pokemonData));
    console.log("|-- data successfully updated");
    log.print("pokemonData has been successfully updated", 1);
}

async function addExp(pokemon, xp, message) {
    return new Promise (async (resolve, reject) => {
        pokemon["xp"] += xp;
        let pokemonCopy = drawPokemonWithId(pokemon["id"])

        let xpSeuil = Math.pow(pokemon['level'], 2);
        let lvlUp = 0;

        while (pokemon["xp"] >= xpSeuil) {
            pokemon["xp"] -= xpSeuil;
            pokemon['level']++
            lvlUp++;
            xpSeuil = Math.pow(pokemon['level'], 2);

            let hpBeforeLvlUp = pokemon["stats"][0];

            pokemon["stats"][0] = Math.ceil(((((pokemonCopy["stats"][0] * 2) + pokemon["ivs"][0]) * pokemon["level"]) / 100) + 10 + pokemon["level"]);
            for (let i = 0; i < pokemon["stats"].length - 1; i++) {
                pokemon["stats"][i + 1] = Math.ceil(((((pokemonCopy["stats"][i + 1] * 2) + pokemon["ivs"][i + 1]) * pokemon["level"]) / 100) + 5);
            }

            let hpAfterLvlUp = pokemon["stats"][0];
            let diffHp = hpAfterLvlUp - hpBeforeLvlUp;
            pokemon["currentHP"] += diffHp;

            // demander à remplacer ou juste ignorer
            // message avec 5 emotes 1 pour chaque compétence à modifier et 1 pour ignorer
            await checkLearning(pokemon, message).then((res, rej) => {
            });
        }

        resolve(lvlUp);
    });
}

function checkLearning(pokemon, message) {
    return new Promise(async (resolve, reject) => {
        let pokemonData = drawPokemonWithId(pokemon.id);
        if (pokemonData["capacites"][pokemon["level"]].length >= 1) {
            let capacitiesToLearn = pokemonData["capacites"][pokemon["level"]];

            if ((pokemon["capacities"].length + capacitiesToLearn.length) <= 4) {
                let capacitiesLearnedStr = "";
                capacitiesToLearn.forEach(capacite => {
                    pokemon["capacities"].push(capacite);
                    capacitiesLearnedStr += capacite.name + ", ";
                })

                if (!message) {
                    resolve(false);
                    return;
                }

                capacitiesLearnedStr.slice(0, capacitiesLearnedStr.length-3);
                let msgEmbed = new EmbedBuilder();
                msgEmbed.setTitle("Votre " + pokemon["name"] + " vient d'apprendre " + capacitiesToLearn.length + " nouvelle(s) capacité(s) !");
                msgEmbed.setDescription(pokemon["name"] + " a appris : " + capacitiesLearnedStr);
                msgEmbed.setColor("#e0d850");
                msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});

                message.channel.send({embeds: [msgEmbed]});
                resolve(true);
                return;
            }

            for (let capaciteToLearn of capacitiesToLearn) {
                await chooseNewCapacite(pokemon, capaciteToLearn, message).then((res, rej) => {

                });
            }
            resolve(true);
        } else {
            resolve(false);
        }
    });
}

function chooseNewCapacite(pokemon, capacite, message) {
    return new Promise(async (resolve, reject) => {
        if (!message) {
            let rand = Math.floor(Math.random * 4);
            pokemon["capacities"][rand] = capacite;
            resolve(true);
            return;
        }

        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Oh votre " + pokemon["name"] + " peut apprendre une nouvelle compétence !");
        msgEmbed.setColor("#e0d850");
        msgEmbed.setDescription("Sélectionner la compétence à remplacer par " + capacite.name + "!");
        msgEmbed.addFields({name: capacite.name + " (" + capacite.type + ")", value: "Attaque " + capacite.category + ", avec une puissance de " + capacite.puissance + " et une précision de " + capacite.precision + " %"});
        msgEmbed.addFields({name: "Capacité à oublier :", value: " "});
        for (let i = 0; i < pokemon["capacities"].length; i++) {
            msgEmbed.addFields({name: pokemon["capacities"][i].name + " (" + pokemon["capacities"][i].type + ")  " + emojis[i], value: "Attaque " + pokemon["capacities"][i].category + ", avec une puissance de " + pokemon["capacities"][i].puissance + " et une précision de " + pokemon["capacities"][i].precision + " %", inline: true});
            if (i % 2 === 1) msgEmbed.addFields({name: " ", value: " "});
        }
        msgEmbed.addFields({name: "Ne pas apprendre cette capacité : ❌", value: " "});

        let msgSent = await message.channel.send({embeds: [msgEmbed]});
        for (let i = 0; i < pokemon["capacities"].length; i++) {
            await msgSent.react(emojis[i]);
        }
        await msgSent.react('❌');

        const filter = (reaction, user) => {
            return emojis.includes(reaction.emoji.name) && !user.bot;
        };

        let collector = msgSent.createReactionCollector(filter, {time: 15000});

        collector.on('collect', (reaction, user) => {
            if (user.id === message.author.id) {
                if (reaction.emoji.name === '❌') {
                    let msgEmbed = new EmbedBuilder();
                    msgEmbed.setTitle("Très bien, la capacité " + capacite.name + " sera oubliée pour toujours !");
                    msgEmbed.setColor("#ffffff");
                    msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                    message.channel.send({embeds: [msgEmbed]});
                    resolve(false);
                } else {
                    for (let i = 0; i < pokemon["capacities"].length; i++) {
                        if (reaction.emoji.name === emojis[i]) {
                            let msgEmbed = new EmbedBuilder();
                            msgEmbed.setTitle("La capacité " + pokemon["capacities"][i]["name"] + " sera oublié pour toujours !");
                            msgEmbed.setDescription(pokemon.name + " vient d'apprendre " + capacite.name + " !");
                            msgEmbed.setColor("#29a827");
                            msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                            message.channel.send({embeds: [msgEmbed]});

                            pokemon["capacities"][i] = capacite;
                            resolve(true);
                            return;
                        }
                    }

                    let msgEmbed = new EmbedBuilder();
                    msgEmbed.setTitle("Une erreur est survenue ! Contactez Camille le boss :)");
                    msgEmbed.setColor("#ff0000");
                    msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                    message.channel.send({embeds: [msgEmbed]});
                    resolve(false);
                }
            } else if (!user.bot) {
                let msgEmbed = new EmbedBuilder();
                msgEmbed.setTitle("Vous ne pouvez pas réagir aux messages des autres !");
                msgEmbed.setDescription("<@" + user.id + "> fait plus ça c'est pas bien !");
                msgEmbed.setColor("#ff0000");
                msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                message.channel.send({embeds: [msgEmbed]});
                resolve(false);
            }
        });
    });
}

/**
 * Récupère la liste de pokémon correspondants au nom fournit chez un joueur
 * @param {Object}player - Joueur chez qui récupérer le ou les pokémons
 * @param {String}pokemonName - Nom du pokémon à récupérer
 * @returns {*|boolean|*[]} - Renvoie false si rien n'est trouvé sinon renvoie une liste des pokémons trouvés
 */
function getPlayerPokemonsWithName(player, pokemonName) {
    let pokemons = [];
    player["pokemons"].forEach(pokemon => {
        if (pokemon.name.toLowerCase() === pokemonName.toLowerCase()) {
            pokemons.push(pokemon);
        }
    });

    if (pokemons.length >= 1) {
        return pokemons;
    } else return false;
}

/**
 * Compare les UUID de deux pokémons
 * @param {Object}pokemon1
 * @param {Object}pokemon2
 * @returns {boolean}
 */
function comparePokemonUUID(pokemon1, pokemon2) {
    return pokemon1["uuid"] === pokemon2["uuid"];
}

/**
 * Compare deux pokémons
 * @param {Object}pokemon1
 * @param {Object}pokemon2
 * @returns {boolean} - Renvoie vrai si les pokémons sont les mêmes, renvoie faux sinon
 */
function comparePokemon(pokemon1, pokemon2) {
    const str1 = JSON.stringify(pokemon1);
    const str2 = JSON.stringify(pokemon2);

    return str1 === str2;
}

/**
 * Créé un nouvel objet user dans le tableau des players
 * @param {Object}author - Objet utilsateur correspondant à l'utilisateur à créer
 * @returns {{pokemons: *[], discordId: string, money: number, id, lastExplore: number, discordName}} - Renvoie un objet correspondant au nouveau joueur
 */
function createPlayer(author) {
    let playerObj = {
        "id": pokemonData["players"].length,
        "discordId": author.id.toString(),
        "discordName": author.username,
        "money": 0,
        "pokemons": [],
        "lastExplore": 0,
        "trainingLeft": 5,
        "lastTraining": 0,
        "lastHeal": 0
    }

    pokemonData["players"].push(playerObj);
    updateData();

    return playerObj;
}

/**
 * Réinitialise toutes les données de tous les joueurs
 * @param message
 */
function resetAllPlayers(message) {
    pokemonData["players"] = [];
    message.channel.send("Toutes les données des joueurs ont été supprimées avec succès !");
    updateData();
}

/**
 * Réinitialise les données d'un joueur en fonction de son ID Discord
 * @param discordId - ID Discord du joueur
 * @param message
 */
function resetPlayer(discordId, message) {
    let i = 0;
    while (i < pokemonData["players"].length) {
        if (pokemonData["players"][i]["discordId"] === discordId) {
            pokemonData["players"].splice(i, 1);
            updateData();
            message.channel.send("Données du joueur supprimées avec succès !");
            return;
        }
        i++;
    }
    message.channel.send("Aucun joueur avec cet ID trouvé !");
}

/**
 * Réinitialise les entrainements d'un joueur avec son ID Discord
 * @param playerDiscordId - ID Discord du joueur
 * @param message
 */
function resetTrainingPlayer(playerDiscordId, message) {
    let player = getPlayerWithId(playerDiscordId);
    if (!player) {
        message.channel.send("Aucun joueur trouvé !");
        return;
    }

    player["trainingLeft"] = 5;
    player["lastTraining"] = 0;
    message.channel.send("Les entraînements de <@" + playerDiscordId + "> ont été reset avec succès !");
    updateData();
}

/**
 * Réinitialise le temps d'exploration d'un joueur avec son ID Discord
 * @param playerDiscordId - ID Discord du joueur
 * @param message
 */
function resetExplorePlayer(playerDiscordId, message) {
    let player = getPlayerWithId(playerDiscordId);
    if (!player) {
        message.channel.send("Aucun joueur trouvé !");
        return;
    }

    player["lastExplore"] = 0;
    message.channel.send("Le temps d'exploration de <@" + playerDiscordId + "> a été reset avec succès !");
    updateData();
}

/**
 * Soigne tous les pokémons d'un joueur
 * @param {Object}player - Joueur dont il faut soigner les pokémons
 */
function healAllPokemons(player) {
    player["pokemons"].forEach(pokemon => {
        if (pokemon.hasOwnProperty("currentHP")) {
            pokemon["currentHP"] = pokemon["stats"][0];
        }
    });

    player["lastHeal"] = new Date().getTime();
    updateData();
}

module.exports = {
    getPlayerWithId,
    catchPokemon,
    drawPokemon,
    drawPokemonWithId,
    drawPokemonWithName,
    parsePokemon,
    addExp,
    getPlayerPokemonsWithName,
    updateData,
    comparePokemonUUID,
    comparePokemon,
    createPlayer,
    healAllPokemons,
    resetAllPlayers,
    resetExplorePlayer,
    resetPlayer,
    resetTrainingPlayer
}