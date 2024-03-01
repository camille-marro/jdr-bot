let fs = require('fs');
const path = require("path");
const readline = require('readline');
let LootTable = require("loot-table");

const {EmbedBuilder} = require('discord.js');

const log = require('../../assets/log');

let pokemonData;

try {
    console.log("|-- Loading pokemon data from" + path.resolve(__dirname, "../../json_files/pokemon.json"));
    const rawData = fs.readFileSync(path.resolve(__dirname, "../../json_files/pokemon.json"));
    pokemonData = JSON.parse(rawData);
}
catch (err) {
    console.log("|-- no file named pokemon.json found");
    pokemonData = false;
}

/**
 * Tableau d'émojis trié par ordre pour réagir aux messages
 * @type {string[]}
 */
const emojis = [
    "1️⃣",
    "2️⃣",
    "3️⃣",
    "4️⃣",
    "5️⃣"
]

/**
 * Fonction pour actualiser le fichier json qui sert de stockage de donnée
 */
function updateData() {
    fs.writeFileSync(path.resolve(__dirname, "../../json_files/pokemon.json"), JSON.stringify(pokemonData));
    console.log("|-- data successfully updated");
    log.print("pokemonData has been successfully updated", 1);
}

/**
 * Envoie un message embed avec 3 à 5 pokémons aléatoires attrapables et permet via une réaction d'en attraper un
 * @param {Object}message
 * @returns {Promise<void>}
 */
async function exploreGrass(message) {
    let msgEmbed = new EmbedBuilder();
    let player = getPlayerWithId(message.author.id);
    if (!player) {
        msgEmbed.setTitle("Vous n'avez pas de compte !");
        msgEmbed.setDescription("Pour vous inscrire utilisez la commande *pokemon start* !");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

        message.channel.send({embeds: [msgEmbed]});
        return;
    }
    if (!checkTimeExplore(player)) {
        console.log("trop tot !");
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
        if (pokemonsFound[i]["shiny"]) {
            msgEmbed.addFields({name: pokemonsFound[i].name + " :sparkles:", value: emojis[i], inline: true});
        } else {
            msgEmbed.addFields({name: pokemonsFound[i].name, value: emojis[i], inline: true});
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
            if (reaction.emoji.name === '1️⃣') {
                console.log(user.username + " a réagi avec 1️⃣");
                msgEmbedCatch = catchPokemon(pokemonsFound[0], message.author.id);
            } else if (reaction.emoji.name === '2️⃣') {
                console.log(user.username + " a réagi avec 2️⃣");
                msgEmbedCatch = catchPokemon(pokemonsFound[1], message.author.id);
            } else if (reaction.emoji.name === '3️⃣') {
                console.log(user.username + " a réagi avec 3️⃣");
                msgEmbedCatch = catchPokemon(pokemonsFound[2], message.author.id);
            } else if (reaction.emoji.name === '4️⃣') {
                console.log(user.username + " a réagi avec 4️⃣");
                msgEmbedCatch = catchPokemon(pokemonsFound[3], message.author.id);
            } else if (reaction.emoji.name === '5️⃣') {
                console.log(user.username + " a réagi avec 5️⃣");
                msgEmbedCatch = catchPokemon(pokemonsFound[4], message.author.id);
            } else {
                console.log(user);
                console.log(reaction);
                console.log(reaction.emoji);
            }

            collector.stop("Une personne a réagit !");
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

    collector.on("end", collected => {
        console.log(`Fin de la collecte : ${collected.size} réactions collectées.`);
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
    //updateData();
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
    let size = pokemon['size'] * randInt;

    randInt = Math.floor(Math.random() * 50) + 1;
    randInt -= 25;
    randInt = randInt / 100;
    randInt += 1;
    let weight = pokemon['weight'] * randInt;

    return {
        "id": pokemon.id,
        "name" : pokemon.name,
        "types": pokemon.types,
        "level": 1,
        "xp": 1,
        "sex": sex,
        "evolveLvl": pokemon.evolveLvl,
        "size": size,
        "weight": weight,
        "stats": pokemon.stats,
        "shiny": pokemon.shiny
    }
}

/**
 * Récupérer des pokémons aléatoirement parmi la liste de tous les pokémons
 * @param {Number}nbRencontres - Nombre de pokémons à récupérer
 * @returns {Object[]} - Liste des pokémons récupérés
 */
function getPokemons(nbRencontres) {
    let pokemonFounds = [];
    for (let i = 0; i < nbRencontres; i++) {
        pokemonFounds.push(drawPokemon());
    }

    let names = getPokemonsNames(pokemonFounds);

    console.log(names);

    return pokemonFounds;
}

/**
 * Récupère le nom de tous les pokémons
 * @param {*[Object]}pokemons - Liste des pokémons dont il faut récupérer le nom
 * @returns {*[]} - Liste des noms des pokémons uniquement
 */
function getPokemonsNames(pokemons) {
    let names = [];
    for(let i = 0; i < pokemons.length; i++) {
        names.push(pokemons[i].name);
    }

    return names;
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
 * Affiche la liste des pokémons possédés par le joueur
 * @param {Object}message
 */
function printPokemons(message) {
    let player = getPlayerWithId(message.author.id);
    if (!player) {
        message.channel.send("Vous n'êtes pas inscrit dans le jeu !");
        return;
    }

    let pokemonsCounted = countPokemons(player["pokemons"], true);
    let msgPokemon = "Voici la liste de vos pokémons :\n";

    let pokemonsSortedName = Object.keys(pokemonsCounted);
    pokemonsSortedName.forEach(pokemonName => {
        if (pokemonName.endsWith("_S")) {
            pokemonName = pokemonName.slice(0, pokemonName.length-2);
            msgPokemon += pokemonName + ":sparkles: (x" + pokemonsCounted[pokemonName + "_S"] + ")\n";
        } else {
            msgPokemon += pokemonName + " (x" + pokemonsCounted[pokemonName] + ")\n";
        }
    });

    message.channel.send(msgPokemon);
}

/**
 * Renvoie une liste du nombre d'occurrences de chaque pokémon
 * @param {Object[]}pokemons - Liste des pokémons à compter
 * @param {Boolean}[sort=false] - Effectue un tri par ordre alphabétique des clés
 * @returns {[{String:Number}]} - Liste du nombre d'occurrences sous la forme : {"nom_pokemon" : nb_occurrences}
 */
function countPokemons(pokemons, sort = false) {
    let pokemonsCount = {};
    pokemons.forEach(pokemon => {
        if (pokemonsCount.hasOwnProperty(pokemon.name)) {
            if (pokemon["shiny"]) {
                if (pokemonsCount.hasOwnProperty(pokemon.name + "_S")) pokemonsCount[pokemon.name + "_S"]++;
                else pokemonsCount[pokemon.name + "_S"] = 1;
            } else pokemonsCount[pokemon.name]++;
        } else {
            if (pokemon["shiny"]) pokemonsCount[pokemon.name + "_S"] = 1
            else pokemonsCount[pokemon.name] = 1;
        }
    });

    if (sort) pokemonsCount = sortPokemonsCount(pokemonsCount);

    return pokemonsCount;
}

/**
 * Trie une liste utilisée par pokemonCount() par ordre alphabétique des clés
 * @param {[{String:Number}]}pokemonsCount - Tableau du nombre d'occurrences de chaque pokémon
 * @returns {[{String:Number}]} - Renvoie une liste ordonnée par ordre alphabétique des clés
 */
function sortPokemonsCount(pokemonsCount) {
    let keys = Object.keys(pokemonsCount);
    keys.sort((a, b) => a.localeCompare(b, 'fr', {ignorePunctuation: true}));

    let pokemonsCountSort = {};
    keys.forEach(key => {
        pokemonsCountSort[key] = pokemonsCount[key];
    });

    return pokemonsCountSort;
}

/**
 * Créer un objet player pour un nouveau joueur et permet de sélectionner son premier pokémon
 * @param {Object}message
 * @returns {Promise<void>}
 */
async function playerStart(message) {
    let msgEmbed = new EmbedBuilder();
    let player = getPlayerWithId(message.author.id);
    if (player) {
        msgEmbed.setTitle("Erreur : vous avez déjà un compte créé !");
        msgEmbed.setDescription("Pour jouer utilisez la commande *pokemon explore*");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

        message.channel.send({embeds: [msgEmbed]});
        return;
    }

    player = createPlayer(message.author);

    msgEmbed.setTitle("Bienvenue dans le monde merveilleux de Pokémon !");
    msgEmbed.setDescription("Pour commencer à jouer vous devez choisir votre starter, pour cela vous avez le choix entre un starter aléatoire parmi tous les pokémons ou alors le choix d'un starter normal.");
    msgEmbed.addFields({name: "Choisir son starter", value: ":one:", inline: true});
    msgEmbed.addFields({name: "Avoir un pokémon aléatoire", value: ":two:", inline: true});
    msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

    let msgSent = await message.channel.send({embeds: [msgEmbed]});

    await msgSent.react(emojis[0]);
    await msgSent.react(emojis[1]);

    const filter = (reaction, user) => {
        return emojis.includes(reaction.emoji.name) && !user.bot;
    };

    let collector = msgSent.createReactionCollector(filter, {time: 15000});

    collector.on('collect', async (reaction, user) => {
        if (user.id === message.author.id) {
            if (reaction.emoji.name === '1️⃣') {

                let msgChooseStarter = new EmbedBuilder();
                msgChooseStarter.setColor("#0293af");
                msgChooseStarter.setTitle("Veuillez choisir votre starter dans la liste ci-dessous :");
                msgChooseStarter.addFields({name: "Bulbizarre", value: ":one:", inline: true});
                msgChooseStarter.addFields({name: "Salamèche", value: ":two:", inline: true});
                msgChooseStarter.addFields({name: "Carapuce", value: ":three:", inline: true});
                msgChooseStarter.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                let msgSent1 = await message.channel.send({embeds: [msgChooseStarter]});

                await msgSent1.react('1️⃣');
                await msgSent1.react('2️⃣');
                await msgSent1.react('3️⃣');

                let collector1 = msgSent1.createReactionCollector(filter, {time: 15000});
                collector1.on('collect', (reaction, user) => {
                    if (user.id === message.author.id) {
                        let starter;
                        if (reaction.emoji.name === '1️⃣') {
                            // bulbizarre
                            starter = drawPokemonWithId(1);
                            catchPokemon(starter, player["discordId"]);
                            collector1.stop();
                        } else if (reaction.emoji.name === '2️⃣') {
                            // salamèche
                            starter = drawPokemonWithId(4);
                            catchPokemon(starter, player["discordId"]);
                            collector1.stop();
                        } else if (reaction.emoji.name === '3️⃣') {
                            // carapuce
                            starter = drawPokemonWithId(7);
                            catchPokemon(starter, player["discordId"]);
                            collector1.stop();
                        }
                        let msgEmbed = new EmbedBuilder();
                        msgEmbed.setTitle("Bravo vous venez d'avoir votre premier pokémon : " + starter["name"] + " !");
                        msgEmbed.setDescription("Pour commencer à jouer utilisez la commande *pokemon explore*.");
                        msgEmbed.setColor("#fff300");
                        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                        message.channel.send({embeds: [msgEmbed]});
                        collector1.stop();
                    } else if (!user.bot) {
                        let msgEmbed = new EmbedBuilder();
                        msgEmbed.setTitle("Vous ne pouvez pas réagir aux messages des autres !");
                        msgEmbed.setDescription("<@" + user.id + "> fait plus ça c'est pas bien !");
                        msgEmbed.setColor("#ff0000");
                        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                        message.channel.send({embeds: [msgEmbed]});
                        collector1.stop();
                    }
                });


                collector.stop();
            } else if (reaction.emoji.name === '2️⃣') {
                let pokemon = drawPokemon();
                catchPokemon(pokemon, player["discordId"]);

                let msgEmbed = new EmbedBuilder();
                msgEmbed.setTitle("Bravo vous venez d'avoir votre premier pokémon : " + pokemon["name"] + " !");
                msgEmbed.setDescription("Pour commencer à jouer utilisez la commande *pokemon explore*.");
                msgEmbed.setColor("#fff300");
                msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                message.channel.send({embeds: [msgEmbed]});
                collector.stop();
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
        "lastExplore": 0
    }

    pokemonData["players"].push(playerObj);
    updateData();

    return playerObj;
}

/**
 * Renvoie un pokemon en fonction de son ID
 * @param {Number}pokemonId - ID du pokémon à récupérer
 * @returns {Object|Boolean} - Pokémon associé à l'ID indiqué renvoie false s'il n'existe pas
 */
function drawPokemonWithId(pokemonId) {
    let pokemon = pokemonData["pokemons"][pokemonId-1];
    if (!pokemon) return false
    else return pokemon
}
function trainPokemon(pokemon) {
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

    let xpWin = enemyPokemonLvl * training;
    let lvlUp = addExp(pokemon, xpWin);

    updateData();

    let trainingStr = "";
    if (training === 1) trainingStr = "entraînement faible";
    else if (training === 2) trainingStr = "entraînement normal";
    else if (training === 3) trainingStr = "entraînement fort";
    else if (training === 4) trainingStr = "entraînement intensif";

    return {"xpWin" : xpWin, "lvlUp": lvlUp, "training" : trainingStr}
}

function train(message) {
    // quand on train on met le nom du pokémon a train
    // faire un message qui demande à l'utilisateur quel pokemon il veut choisir s'il en a plusieurs
    // ensuite on utilise la fonction trainPokemon()
    // ensuite on fait un nouveau message avec les résultats de trainPokemon()
}

function addExp(pokemon, xp) {
    pokemon["xp"] += xp;

    let xpSeuil = Math.pow(pokemon['level'], 3);
    let lvlUp = 0;

    while (pokemon["xp"] >= xpSeuil) {
        pokemon["xp"] -= xpSeuil;
        pokemon['level']++
        lvlUp++;
    }

    return lvlUp;
}

function execute(message) {
    let args = message.content.split(" ");
    if (args[1] === "test") {
        test(message);
    } else if (args[1] === "explore") {
        exploreGrass(message).then(r => {});
    } else if (args[1] === "scrap" && message.author.id.toString() === "198381114602160128") {
        scarpPokemons().then(r => {});
    } else if (args[1] === "liste" || args[1] === "list" || args[1] === "inv") {
        printPokemons(message);
    } else if (args[1] === "start") {
        playerStart(message).then(r => {});
    }
}


module.exports = {
    execute
}


async function test(message) {
    let msgEmbed = new EmbedBuilder();
    msgEmbed.setTitle("Test");
    msgEmbed.setDescription("test");

    const messageSent = await message.channel.send({embeds: [msgEmbed]});

    await messageSent.react('1️⃣');
    await messageSent.react('2️⃣');
    await messageSent.react('3️⃣');

    const filter = (reaction, user) => {
        return ['1️⃣', '2️⃣', '3️⃣'].includes(reaction.emoji.name) && !user.bot;
    };

    const collector = messageSent.createReactionCollector(filter, {time: 15000});

    collector.on('collect', (reaction, user) => {
        if (reaction.emoji.name === '1️⃣') {
            console.log(user.username + " a réagi avec 1️⃣");
        } else if (reaction.emoji.name === '2️⃣') {
            console.log(user.username + " a réagi avec 2️⃣");
        } else if (reaction.emoji.name === '3️⃣') {
            console.log(user.username + " a réagi avec 3️⃣");
        } else {
            console.log(user);
            console.log(reaction);
            console.log(reaction.emoji);
        }
    });

    collector.on("end", collected => {
        console.log(`Fin de la collecte : ${collected.size} réactions collectées.`);
    });
}

const axios = require('axios');
const cheerio = require('cheerio');

async function scarpPokemons() {
    let pokemonTab = [
        "Bulbizarre", "Herbizarre", "Florizarre",
        "Salamèche", "Reptincel", "Dracaufeu",
        "Carapuce", "Carabaffe", "Tortank",
        "Chenipan", "Chrysacier", "Papilusion",
        "Aspicot", "Coconfort", "Dardargnan",
        "Roucool","Roucoups","Roucarnage",
        "Rattata","Rattatac",
        "Piafabec","Rapasdepic",
        "Abo","Arbok",
        "Pikachu","Raichu",
        "Sabelette","Sablaireau",
        "Nidoran♀", "Nidorina","Nidoqueen",
        "Nidoran♂", "Nidorino","Nidoking",
        "Mélofée","Mélodelfe",
        "Goupix","Feunard",
        "Rondoudou","Grodoudou",
        "Nosferapti","Nosferalto",
        "Mystherbe","Ortide","Rafflesia",
        "Paras","Parasect",
        "Mimitoss","Aéromite",
        "Taupiqueur", "Triopikeur",
        "Miaouss","Persian",
        "Psykokwak","Akwakwak",
        "Férosinge","Colossinge",
        "Caninos","Arcanin",
        "Ptitard","Têtarte","Tartard",
        "Abra","Kadabra","Alakazam",
        "Machoc","Machopeur","Mackogneur",
        "Chétiflor","Boustiflor","Empiflor",
        "Tentacool","Tentacruel",
        "Racaillou","Gravalanch","Grolem",
        "Ponyta","Galopa",
        "Ramoloss","Flagadoss",
        "Magnéti","Magnéton",
        "Canarticho",
        "Doduo","Dodrio",
        "Otaria","Lamantine",
        "Tadmorv","Grotadmorv",
        "Kokiyas","Crustabri",
        "Fantominus","Spectrum","Ectoplasma",
        "Onix",
        "Soporifik","Hypnomade",
        "Krabby","Krabboss",
        "Voltorbe","Électrode",
        "Noeunoeuf","Noadkoko",
        "Osselait","Ossatueur",
        "Kicklee","Tygnon",
        "Excelangue",
        "Smogo","Smogogo",
        "Rhinocorne","Rhinoféros",
        "Leveinard",
        "Saquedeneu",
        "Kangourex",
        "Hypotrempe","Hypocéan",
        "Poissirène","Poissoroy",
        "Stari","Staross",
        "M._Mime",
        "Insécateur",
        "Lippoutou",
        "Élektek",
        "Magmar",
        "Scarabrute",
        "Tauros",
        "Magicarpe","Léviator",
        "Lokhlass",
        "Métamorph",
        "Évoli","Aquali","Voltali","Pyroli",
        "Porygon",
        "Amonita","Amonistar",
        "Kabuto","Kabutops",
        "Ptéra",
        "Ronflex",
        "Artikodin","Électhor","Sulfura",
        "Minidraco","Draco","Dracolosse",
        "Mewtwo","Mew"
    ];
    let pokemonJSON = [];

    for (let i = 0; i < pokemonTab.length; i++) {
        try {
            console.log("Pokemon(" + i + ")");
            const response = await axios.get("https://www.pokepedia.fr/" + pokemonTab[i]);
            const html = response.data;
            let selector;

            const $ = cheerio.load(html);

            let id = parseInt($('#mw-content-text > div.mw-parser-output > table:nth-child(1) > tbody > tr:nth-child(2) > td:nth-child(2)').text());
            let pokemonName = $('span.mw-page-title-main').text();

            let type1 = $('#mw-content-text > div.mw-parser-output > table.tableaustandard.ficheinfo > tbody > tr:nth-child(8) > td > span:nth-child(1) > a').attr('title').split(" ")[0];
            let type2;
            selector = '#mw-content-text > div.mw-parser-output > table.tableaustandard.ficheinfo > tbody > tr:nth-child(8) > td > span:nth-child(2) > a';
            if ($(selector).length) {
                type2 = $(selector).attr("title").split(" ")[0];
            }


            let sex = $('#mw-content-text > div.mw-parser-output > table.tableaustandard.ficheinfo > tbody > tr:nth-child(18) > td').text().split(" ")[0].split(" ");
            let sex1 = 1000 - (parseFloat(sex) * 10);

            let eggsGroup1 = $('#mw-content-text > div.mw-parser-output > table.tableaustandard.ficheinfo > tbody > tr:nth-child(13) > td > a:nth-child(1)').text();
            let eggsGroup2 = $('#mw-content-text > div.mw-parser-output > table.tableaustandard.ficheinfo > tbody > tr:nth-child(13) > td > a:nth-child(3)').text();

            let captureRate = parseInt($('#mw-content-text > div.mw-parser-output > table.tableaustandard.ficheinfo > tbody > tr:nth-child(20) > td').text());
            let eggHatchTime = parseInt($('#mw-content-text > div.mw-parser-output > table.tableaustandard.ficheinfo > tbody > tr:nth-child(14) > td').text().split(" ")[0]);

            let size = parseFloat($('#mw-content-text > div.mw-parser-output > table.tableaustandard.ficheinfo > tbody > tr:nth-child(10) > td').text().split(" ")[0].replace(/,/g, '.'));
            let weight = parseFloat($('#mw-content-text > div.mw-parser-output > table.tableaustandard.ficheinfo > tbody > tr:nth-child(11) > td').text().split(" ")[0].replace(/,/g, '.'));

            let category = $('#mw-content-text > div.mw-parser-output > table.tableaustandard.ficheinfo > tbody > tr:nth-child(9) > td').text().split(" ").slice(1).join(" ");

            let talent1 = $('#mw-content-text > div.mw-parser-output > table.tableaustandard.ficheinfo > tbody > tr:nth-child(12) > td > a:nth-child(1)').text();
            let talent2 = $('#mw-content-text > div.mw-parser-output > table.tableaustandard.ficheinfo > tbody > tr:nth-child(12) > td > a:nth-child(3)').text();

            //let description = $('#mw-content-text > div.mw-parser-output > dl:nth-child(27) > dd:nth-child(2)').text();
            let description = $('dl > dd:nth-child(2)').text();

            let stat1 = parseInt($('table.tableaustandard.tableau-overflow > tbody > tr:nth-child(4) > td:nth-child(2)').text());
            let stat2 = parseInt($('table.tableaustandard.tableau-overflow > tbody > tr:nth-child(5) > td:nth-child(2)').text());
            let stat3 = parseInt($('table.tableaustandard.tableau-overflow > tbody > tr:nth-child(6) > td:nth-child(2)').text());
            let stat4 = parseInt($('table.tableaustandard.tableau-overflow > tbody > tr:nth-child(7) > td:nth-child(2)').text());
            let stat5 = parseInt($('table.tableaustandard.tableau-overflow > tbody > tr:nth-child(8) > td:nth-child(2)').text());
            let stat6 = parseInt($('table.tableaustandard.tableau-overflow > tbody > tr:nth-child(9) > td:nth-child(2)').text());
            let stat7 = parseInt($('table.tableaustandard.tableau-overflow > tbody > tr:nth-child(10) > td:nth-child(2)').text());

            let finalObj = {
                "id": id,
                "name": pokemonName,
                "types": [
                    type1
                ],
                "level": 1,
                "captureRate": captureRate,
                "sex": sex1,
                "eggsGroups": [
                    eggsGroup1
                ],
                "eggHatchTime": eggHatchTime,
                "stade": "@TODO",
                "evolve": "@TODO",
                "evolveLvl": "@TODO",
                "size": size,
                "weight": weight,
                "category": category,
                "talents": [
                    talent1
                ],
                "description": description,
                "stats": [
                    stat1, stat2, stat3, stat4, stat5, stat6
                ]
            }

            // push des groupes d'oeuf et des talents
            if (type2) finalObj["types"].push(type2);
            if (eggsGroup2) finalObj["eggsGroups"].push(eggsGroup2);
            if (talent2) finalObj["talents"].push(talent2);
            if (stat7) finalObj["stats"].push(stat7);

            pokemonJSON.push(finalObj);
        } catch (error) {
            console.error('Une erreur s\'est produite :', error);
        }
    }

    // demande pour chaque pokémon de son stade, l'id de son evolve et son evolve lvl


    for (const pokemon of pokemonJSON) {
        let stade = await askQuestion("Entrer le stade d'évolution de " + pokemon['name'] + "(" + pokemon['id'] + ") : ");
        if (stade === "3") {
            pokemon['stade'] = 3;
            pokemon['evolve'] = -1;
            pokemon['evolveLvl'] = -1;
            continue;
        }
        pokemon['stade'] = parseInt(stade.toString());

        let evolve = await askQuestion("Quel est l'id de l'évolution de " + pokemon['name'] + ", s'il n'en a pas taper -1 : ");
        if (evolve === "-1") {
            pokemon['evolve'] = -1;
            pokemon['evolveLvl'] = -1;
            continue;
        }
        pokemon['evolve'] = parseInt(evolve.toString());

        let evolveLvl = await askQuestion("A quel niveau " + pokemon['name'] + " évolue ? : ");
        pokemon['evolveLvl'] = parseInt(evolveLvl.toString());
    }

    rl.close();
    fs.writeFileSync(path.resolve(__dirname, "../../json_files/pokemonTestListe.json"), JSON.stringify(pokemonJSON));
    console.log("end");
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(question) {
    return new Promise((resolve, reject) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}