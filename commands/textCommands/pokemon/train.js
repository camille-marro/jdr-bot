const LootTable = require("loot-table");

const {EmbedBuilder} = require('discord.js');

let { addExp, getPlayerWithId, getPlayerPokemonsWithName, updateData, drawPokemonWithId, checkLearning} = require("./assets");
const { emojis } = require("./utils");

/**
 * Fonction qui permet de lancer la commande train
 * @param message
 * @returns {Promise<void>}
 */
async function train(message) {
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
        msgEmbed.setDescription("La commande s'utilise comme ceci : pokemon train nom_du_pokemon.");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande *pokemon help*."});

        message.channel.send({embeds: [msgEmbed]});
        return;
    }

    let training = checkTraining(player);
    if (training === true) {
        player["trainingLeft"]--;
        player["lastTraining"] = new Date().getTime();
    } else {
        message.channel.send({embeds: [training]});
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
        choosePokemonTraining(pokemons, message).then(pokemon => {
            trainPokemon(pokemon, message).then(async res => {
                await resultTraining(message, pokemon, res);
            })
        });
    } else {
        trainPokemon(pokemons[0], message).then(async res => {
            await resultTraining(message, pokemons[0], res);
        })
    }
}

/**
 * Permet d'attendre le choix d'un pokémon et de filtrer les résultats de l'entrainement
 * @param message
 * @param pokemon
 * @param res
 * @returns {Promise<void>}
 */
async function resultTraining(message, pokemon, res) {
    let msgEmbed = new EmbedBuilder();
    msgEmbed.setTitle("Résultat de votre " + res["training"]);
    msgEmbed.setDescription("Votre " + pokemon["name"] + " à gagné " + res["xpWin"] + " points d'xp et est monté de " + res["lvlUp"] + " niveau(x) !");
    msgEmbed.setColor("#0293af");
    msgEmbed.setFooter({text:"Pour plus d'informations utiliez la commande *pokemon help*."});
    message.channel.send({embeds: [msgEmbed]});

    if ((pokemon['evolveLvl'] !== -1) && (pokemon['level'] >= pokemon['evolveLvl'])) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Oh ! Votre pokémon évolue !");
        msgEmbed.setDescription("Choisissez si vous souhaitez faire évoluer ou non votre pokémon !");
        msgEmbed.setColor("#fff300");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande *pokemon help*."});

        let msgSent = await message.channel.send({embeds: [msgEmbed]});

        await msgSent.react('👍');
        await msgSent.react('👎');

        const filter = (reaction, user) => {
            return emojis.includes(reaction.emoji.name) && !user.bot;
        };

        let collector = msgSent.createReactionCollector(filter, {time:5000});
        collector.on('collect', (reaction, user) => {
            if (user.id === message.author.id) {
                if (reaction.emoji.name === '👎') {
                    let msgEmbed = new EmbedBuilder();
                    msgEmbed.setTitle("Vous avez décidé d'annuler l'évolution !");
                    msgEmbed.setDescription("Votre pokémon ne pourra plus évoluer désormais.");
                    msgEmbed.setColor("#942cad");
                    msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                    message.channel.send({embeds: [msgEmbed]});
                    cancelEvolve(pokemon);
                    collector.stop();
                } else if (reaction.emoji.name === '👍') {
                    console.log(pokemon);
                    let evolveMsg = evolvePokemon(pokemon, message);
                    evolvePokemon(pokemon, message).then(res => {
                        message.channel.send({embeds: [res]});
                        collector.stop();
                    });
                    console.log(pokemon);
                }
            } else if (!user.bot) {
                let msgEmbed = new EmbedBuilder();
                msgEmbed.setTitle("Vous ne pouvez pas réagir aux messages des autres !");
                msgEmbed.setDescription("<@" + user.id + "> fait plus ça c'est pas bien !");
                msgEmbed.setColor("#ff0000");
                msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                message.channel.send({embeds: [msgEmbed]});
                collector.stop();
            }
        });
    }

    updateData();
}

/**
 * Permet de choisir un pokémon quand il y en a plusieurs du même nom dans l'équipe du joueur pour la commande "train"
 * @param pokemons
 * @param message
 * @returns {Promise<Object>}
 */
function choosePokemonTraining(pokemons, message) {
    return new Promise(async (resolve, reject) => {
        let msgEmbed = createEmbedTrainPokemons(pokemons);
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

function evolvePokemon(pokemon, message) {
    return new Promise(async (resolve, reject) => {
        console.log("evolvePokemon");
        let basePokemon = drawPokemonWithId(pokemon["id"]);
        let evolutionPokemon;

        if (Array.isArray(basePokemon["evolve"])) {
            if (Array.isArray(basePokemon["evolveLvl"])) {
                let i = 0, evolveFound = false;
                while (i < basePokemon["evolveLvl"].length) {
                    if (basePokemon["evolveLvl"] !== -1) {
                        evolutionPokemon = drawPokemonWithId(basePokemon["evolve"][i]);
                        evolveFound = true;
                        break;
                    }
                    i++;
                }
                if (!evolveFound) {
                    let msgEmbed = new EmbedBuilder();
                    msgEmbed.setTitle("Votre " + pokemon["name"] + " ne peut pas évoluer !");
                    msgEmbed.setColor("#ff0000");
                    msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande *pokemon help*."});

                    return msgEmbed;
                }
            } else {
                if (basePokemon["evolveLvl"] === -1) {
                    let msgEmbed = new EmbedBuilder();
                    msgEmbed.setTitle("Votre " + pokemon["name"] + " ne peut pas évoluer !");
                    msgEmbed.setColor("#ff0000");
                    msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande *pokemon help*."});

                    return msgEmbed;
                }
            }
        } else evolutionPokemon = drawPokemonWithId(basePokemon["evolve"]);

        let diffSize = parseFloat(Math.abs(basePokemon["size"] - evolutionPokemon["size"]).toFixed(2));
        let diffWeight = parseFloat(Math.abs(basePokemon["weight"] - evolutionPokemon["weight"]).toFixed(2));

        pokemon['size'] += diffSize;
        pokemon['weight'] += diffWeight;
        pokemon['name'] = evolutionPokemon['name'];
        pokemon['types'] = evolutionPokemon['types'];
        pokemon['id'] = evolutionPokemon['id'];
        pokemon['evolveLvl'] = evolutionPokemon['evolveLvl'];

        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Félicitations votre " + basePokemon["name"] + " a évolué en " + pokemon["name"] + " !");
        msgEmbed.setDescription("Grâce à sa nouvelle évolution votre pokémon a gagné en poids et en taille et a peut être des nouveaux types !");
        msgEmbed.setColor("#08ff00");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande *pokemon help*."});
    });
}

/**
 * Annule l'évolution d'un pokémon
 * @param pokemon - Pokémon à qui annuler l'évolution
 */
function cancelEvolve(pokemon) {
    pokemon["evolveLvl"] = -1;
}

/**
 * Vérifie si le joueur peut utiliser la commande "train"
 * @param player - Joueur à vérifier
 * @returns {EmbedBuilder|boolean} - Renvoie vrai si le joueur peut utiliser la commande sinon renvoie un message embed du message d'erreur
 */
function checkTraining(player) {
    if (player["trainingLeft"] <= 0) {
        if ((new Date().getTime() - player["lastTraining"]) / (1000 * 60 * 60) >=1 ) {
            player["trainingLeft"] = 5;
            return true;
        } else {
            let msgEmbed = new EmbedBuilder();

            msgEmbed.setTitle("Vous n'avez plus d'entrainements restants !");
            msgEmbed.setDescription("Vos entrainements se réinitialisent toutes les heures ! Votre prochain entrainement est dans : " + getTrainingTime(player));
            msgEmbed.setColor("#ff0000");
            msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

            return msgEmbed;
        }
    } else {
        if ((new Date().getTime() - player["lastTraining"]) / (1000 * 60 * 60) >=1 ) {
            player["trainingLeft"] = 5;
            return true;
        } else return true;
    }
}

/**
 * Renvoie sous forme de string le temps restant avant les prochains entrainements
 * @param {Object}player - Joueur pour qui il faut calculer le temps
 * @returns {string} - String du temps restant
 */
function getTrainingTime(player) {
    let diff = new Date().getTime() - player["lastTraining"];

    let finalDiff = 3600000 - diff //3600000 === 1 heure

    const seconds = Math.floor(finalDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    return `${hours % 24} heure(s), ${minutes % 60} minute(s) et ${seconds % 60} seconde(s)`;
}

/**
 * Créé un message embed pour l'entrainement des pokémons
 * @param {Object[]}pokemons -
 * @returns {EmbedBuilder|boolean} - Renvoie faux s'il y a trop de pokémons
 */
function createEmbedTrainPokemons(pokemons) {
    if (pokemons.length > 15) return false;

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setTitle("Choisissez le pokémon à entrainer");
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

function trainPokemon(pokemon, message) {
    return new Promise (async (resolve, reject) => {
        let randInt = Math.floor(Math.random() * 9) + 1;
        randInt -= 5;

        let enemyPokemonLvl = pokemon['level'] + randInt;
        if (enemyPokemonLvl <= 0) enemyPokemonLvl = 1;

        let trainingLootTable = new LootTable();
        trainingLootTable.add(1, 4);
        trainingLootTable.add(2, 3);
        trainingLootTable.add(3, 2);
        trainingLootTable.add(4, 1);

        let training = trainingLootTable.choose();
        let xpWin = enemyPokemonLvl * training * 2;
        let lvlUp;

        await addExp(pokemon, xpWin, message).then((res, rej) => {
            lvlUp = res;
        });

        let trainingStr = "";
        if (training === 1) trainingStr = "entraînement faible";
        else if (training === 2) trainingStr = "entraînement normal";
        else if (training === 3) trainingStr = "entraînement fort";
        else if (training === 4) trainingStr = "entraînement intensif";

        resolve({"xpWin": xpWin, "lvlUp": lvlUp, "training": trainingStr});
    });
}

module.exports = {
    train
}