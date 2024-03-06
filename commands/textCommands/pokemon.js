let fs = require('fs');
const path = require("path");
const readline = require('readline');
let LootTable = require("loot-table");
const {v4: uuid } = require('uuid');

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
    "5️⃣",
    "6️⃣"
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
                msgEmbedCatch = catchPokemon(pokemonsFound[0], message.author.id);
            } else if (reaction.emoji.name === '2️⃣') {
                msgEmbedCatch = catchPokemon(pokemonsFound[1], message.author.id);
            } else if (reaction.emoji.name === '3️⃣') {
                msgEmbedCatch = catchPokemon(pokemonsFound[2], message.author.id);
            } else if (reaction.emoji.name === '4️⃣') {
                msgEmbedCatch = catchPokemon(pokemonsFound[3], message.author.id);
            } else if (reaction.emoji.name === '5️⃣') {
                msgEmbedCatch = catchPokemon(pokemonsFound[4], message.author.id);
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
 * Récupérer des pokémons aléatoirement parmi la liste de tous les pokémons
 * @param {Number}nbRencontres - Nombre de pokémons à récupérer
 * @returns {Object[]} - Liste des pokémons récupérés
 */
function getPokemons(nbRencontres) {
    let pokemonFounds = [];
    for (let i = 0; i < nbRencontres; i++) {
        pokemonFounds.push(drawPokemon());
    }

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
    let args = message.content.split(" ");

    let player;
    if (args[2]) {
        player = getPlayerWithId(args[2].slice(2, args[2].length-1));
        if (!player) {
            message.channel.send("Aucun joueur avec cet id trouvé !");
            return;
        }
    } else {
        player = getPlayerWithId(message.author.id);
        if (!player) {
            message.channel.send("Vous n'êtes pas inscrit dans le jeu !");
            return;
        }
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

/**
 * Fait évoluer un pokémon en son évolution en lui ajoutant les bonnes stats
 * @param pokemon - Pokémon à évoluer
 * @returns {EmbedBuilder} - Renvoie un message de succès prêt à être envoyé
 */
function evolvePokemon(pokemon) {
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

    let diffSize = Math.abs(basePokemon["size"] - evolutionPokemon["size"]);
    let diffWeight = Math.abs(basePokemon["weight"] - evolutionPokemon["weight"]);

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

    updateData();

    return msgEmbed;
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
 * Fonction qui permet de lancer la commande train
 * @param message
 * @returns {Promise<void>}
 */
async function train(message) {
    let args = message.content.split(" ");
    let player = getPlayerWithId(message.author.id);

    if (!player) {
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
    let pokemon = {};
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
                    let evolveMsg = evolvePokemon(pokemon);
                    message.channel.send({embeds: [evolveMsg]});
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

/**
 * Annule l'évolution d'un pokémon
 * @param pokemon - Pokémon à qui annuler l'évolution
 */
function cancelEvolve(pokemon) {
    pokemon["evolveLvl"] = -1;
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

            pokemon["stats"][0] = Math.ceil(((((pokemonCopy["stats"][0] * 2) + pokemon["ivs"][0]) * pokemon["level"]) / 100) + 10 + pokemon["level"]);
            for (let i = 0; i < pokemon["stats"].length - 1; i++) {
                pokemon["stats"][i + 1] = Math.ceil(((((pokemonCopy["stats"][i + 1] * 2) + pokemon["ivs"][i + 1]) * pokemon["level"]) / 100) + 5);
            }

            // demander à remplacer ou juste ignorer
            // message avec 5 emotes 1 pour chaque compétence à modifier et 1 pour ignorer
            await checkLearning(pokemon, message).then((res, rej) => {
            });
        }

        resolve(lvlUp);
    })
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
    })
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
 * Fonction qui permet de lancer la commande info
 * @param message
 * @returns {Promise<void>}
 */
async function infosPokemon(message) {
    let args = message.content.split(" ");
    let player = getPlayerWithId(message.author.id);

    //message.channel.send("La commande est pas dispo faudrait que je reset les pokémons de tous le monde et flemme :)");
    //return;

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

function adminHeal(playerId, message) {
    let player = getPlayerWithId(playerId);
    if (!player) {
        message.channel.send("Aucun joueur avec cet ID !");
        return;
    }

    healAllPokemons(player);
    message.channel.send("Tous les pokémons de <@" + playerId + "> ont été soignés avec succès !");
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
 * Réinitialise toutes les données de tous les joueurs
 * @param message
 */
function resetAllPlayers(message) {
    pokemonData["players"] = [];
    message.channel.send("Toutes les données des joueurs ont été supprimées avec succès !");
    updateData();
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
 * Fonction principale pour la commande de combat en PVE
 * @param message
 */
function pveMain(message) {
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
        msgEmbed.setTitle("Veuillez saisir une difficulté !");
        msgEmbed.setDescription("Les difficultés sont : facile/esay, medium, hard/difficile");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande *pokemon help*."});

        message.channel.send({embeds: [msgEmbed]});
        return;
    }

    if (!args[3]) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Veuillez saisir un nom de pokémon à envoyer au combat !");
        msgEmbed.setDescription("La commande s'utilise comme ceci : pokemon trainPVE difficulté nom_du_pokemon.");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande *pokemon help*."});

        message.channel.send({embeds: [msgEmbed]});
        return;
    }

    let difficulty;
    if (args[2] === "facile" || args[2] === "easy") difficulty = 1;
    else if (args[2] === "medium") difficulty = 2;
    else difficulty = 3;

    let pokemons = getPlayerPokemonsWithName(player, args[3]);
    if (!pokemons) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Vous n'avez aucun pokémon de ce nom !");
        msgEmbed.setDescription("Vérifier qu'il n'y aucune faute de syntaxe ou que vous possédez bien ce pokémon.");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande *pokemon help*."});

        message.channel.send({embeds: [msgEmbed]});
    } else if (pokemons.length > 1) {
        choosePokemonPVE(pokemons, message).then(pokemon => {
            pveDrawEnemyPokemon(pokemon, difficulty).then( enemyPokemon => {
                startCombatPVE(pokemon, enemyPokemon, difficulty, message).then(r => {});
            });
        });
    } else {
        pveDrawEnemyPokemon(pokemons[0], difficulty).then( enemyPokemon => {
            startCombatPVE(pokemons[0], enemyPokemon, difficulty, message).then(r => {});
        })
    }
}

/**
 * Début de la fonction récursive pour le combat en PVE
 * @param myPokemon - Pokémon allié a envoyé au combat
 * @param enemyPokemon - Pokémon ennemi à combattre
 * @param {number}difficulty - Difficulté du combat
 * @param message
 * @returns {Promise<void>}
 */
async function startCombatPVE(myPokemon, enemyPokemon, difficulty, message) {
    if (myPokemon["currentHP"] <= 0) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Votre : " + myPokemon["name"] + " est K.O. !");
        msgEmbed.setDescription("Vous ne pouvez pas combattre avec un pokémon déjà K.O.");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});
        msgEmbed.setColor("#ff0000");

        message.channel.send({embeds: [msgEmbed]});
        return;
    }

    let combatObject = {
        "myPokemonHP": myPokemon["currentHP"],
        "enemyPokemonHP": enemyPokemon["stats"][0],
        "myTurn": true,
        "fuite": false,
        "fuiteCpt": 0
    }

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setTitle("Vous entrez dans un combat contre : " + enemyPokemon["name"] + " !");
    msgEmbed.setDescription("Le " + enemyPokemon["name"] + " est de niveau " + enemyPokemon["level"] + " et possède " + enemyPokemon["stats"][0] + " PV.\nBonne chance pour votre combat :)");
    msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});
    msgEmbed.setColor("#ff5600");

    message.channel.send({embeds: [msgEmbed]});

    combatPVE(myPokemon, enemyPokemon, combatObject, message).then(async (res, rej) => {
        let msgEmbed = new EmbedBuilder();
        if (res) {
            let xpWon = Math.ceil(enemyPokemon.level * 2 * 1.5 * difficulty);
            await addExp(myPokemon, xpWon, message).then(lvlUp => {
                msgEmbed.setTitle("Victoire !");
                msgEmbed.setDescription("Bravo vous avez gagné votre combat contre " + enemyPokemon.name + " (lvl:" + enemyPokemon.level + ") !");
                msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});
                msgEmbed.setColor("#08ff00");
                msgEmbed.addFields({name: "Expérience gagnée", value: xpWon.toString(), inline: true});
                if (lvlUp > 0) msgEmbed.addFields({name: "Niveau(x) gagné(s)", value: lvlUp.toString(), inline: true});
            });
        } else {
            msgEmbed.setTitle("Défaite !");
            msgEmbed.setDescription("Pas de chance vous avez perdu votre combat contre " + enemyPokemon.name + " (lvl:" + enemyPokemon.level + ") !");
            msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});
            msgEmbed.setColor("#ce1369");
        }
        if (combatObject["myPokemonHP"] < 0) combatObject["myPokemonHP"] = 0;
        myPokemon["currentHP"] = combatObject["myPokemonHP"];

        message.channel.send({embeds: [msgEmbed]});

        updateData();
    });
}

/**
 * Fonction récursive pour le combat en PVE
 * @param {Object}myPokemon - Pokémon allié à envoyer au combat
 * @param {Object}enemyPokemon - Pokémon ennemi à affronter
 * @param {Object}combatObject - Objet de combat pour garder les informations du combat en cours
 * @param message
 * @returns {Promise<unknown>}
 */
async function combatPVE(myPokemon, enemyPokemon, combatObject, message) {
    return new Promise(async (resolve, reject) => {
        if (combatObject["myPokemonHP"] <= 0) {
            resolve(false);
            return;
        } else if (combatObject["enemyPokemonHP"] <= 0) {
            resolve(true);
            return;
        } else if (combatObject["fuite"]) {
            resolve(false);
            return;
        }

        if (!combatObject["myTurn"]) {
            let cc = getCC(enemyPokemon["level"], enemyPokemon["stats"][5]);
            let attack = chooseRandomAttack(enemyPokemon);
            let avantageType = getMultiAvantageType(attack["type"], myPokemon["types"]);

            let multi = cc * avantageType;

            let puissanceAttaque = attack["puissance"];
            let enemyDamage;

            if (attack["category"] === "physique") {
                enemyDamage = Math.ceil(((((((enemyPokemon["level"] * 0.4) + 2) * enemyPokemon["stats"][1] * puissanceAttaque) / myPokemon["stats"][2]) / 50) + 2) * multi);
            } else if (attack["category"] === "statut") {
                enemyDamage = 0;
            } else {
                enemyDamage = Math.ceil(((((((enemyPokemon["level"] * 0.4) + 2) * enemyPokemon["stats"][3] * puissanceAttaque) / myPokemon["stats"][4]) / 50) + 2) * multi);
            }

            damageCombatPokemon(0, combatObject, enemyDamage);

            let msgEmbed = new EmbedBuilder();
            let descriptionStr = "";
            if (cc > 1) {
                descriptionStr += "Coup Critique ! ";
                msgEmbed.setColor("#fff300");
            } else msgEmbed.setColor("#b62626");
            if (avantageType === 0) {
                descriptionStr += `${attack.name} n'affecte pas ${myPokemon.name} ... `;
            } else if (avantageType < 1) {
                descriptionStr += `${attack.name} n'est pas très efficace ... `;
            } else if (avantageType > 1) {
                descriptionStr += `${attack.name} est super efficace ! `;
            }
            descriptionStr += "La puissance de " + attack.name + " était de " + puissanceAttaque;

            msgEmbed.setTitle(enemyPokemon["name"] + " vous a attaqué et vous avez perdu " + enemyDamage + " pv !");
            msgEmbed.setDescription(descriptionStr);
            msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});
            msgEmbed.addFields({name:myPokemon["name"], value:combatObject["myPokemonHP"] + "/" + myPokemon["stats"][0] + " PV", inline: true});
            msgEmbed.addFields({name:enemyPokemon["name"], value:combatObject["enemyPokemonHP"] + "/" + enemyPokemon["stats"][0] + " PV", inline: true});
            message.channel.send({embeds: [msgEmbed]});
            
            combatObject["myTurn"] = true;
            resolve(combatPVE(myPokemon, enemyPokemon, combatObject, message));
            return;
        }

        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Choisissez si vous voulez faire une attaque normale ou une attaque spéciale !");
        msgEmbed.setColor("#0823a8");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});

        for (let i = 0; i < myPokemon["capacities"].length; i++) {
            msgEmbed.addFields({name:myPokemon["capacities"][i]["name"] + " (" + myPokemon["capacities"][i]["type"] + ")", value:emojis[i], inline: true});
            if ((i%2) === 1) msgEmbed.addFields({name:" ", value:" "});
        }

        msgEmbed.addFields({name:"Fuite", value:emojis[myPokemon["capacities"].length]});

        let msgSent = await message.channel.send({embeds: [msgEmbed]});

        for (let i = 0; i < 5; i++) await msgSent.react(emojis[i]);

        const filter = (reaction, user) => {
            return emojis.includes(reaction.emoji.name) && !user.bot;
        };

        const collector = msgSent.createReactionCollector(filter, {time: 15000});

        collector.on("collect", (reaction, user) => {
            if (user.id === message.author.id) {
                if (reaction.emoji.name === emojis[myPokemon["capacities"].length]) {
                    combatObject["fuiteCpt"]++;
                    combatObject["myTurn"] = false;

                    let msgEmbed = new EmbedBuilder();
                    let fuite = canEscape(myPokemon, enemyPokemon, combatObject["fuiteCpt"]);
                    if (fuite) {
                        msgEmbed.setColor("#11985c");
                        msgEmbed.setTitle("Vous prenez la fuite !");
                        combatObject["fuite"] = true;
                    } else {
                        msgEmbed.setColor("#00ce5e");
                        msgEmbed.setTitle("Fuite impossible !");
                    }

                    message.channel.send({embeds: [msgEmbed]});
                    collector.stop();
                    return;
                }
                let cc = getCC(myPokemon["level"], myPokemon["stats"][5])

                let i = 0;
                while (i < 4) {
                    if (reaction.emoji.name === emojis[i]) {
                        break;
                    }
                    i++;
                }

                let attack = getPokemonAttack(myPokemon, i);

                let avantageType = getMultiAvantageType(attack["type"], enemyPokemon["types"]);
                let multi = cc * avantageType;

                let puissanceAttaque = attack["puissance"];
                let myDamage;
                if (attack['category'] === "physique") {
                    myDamage = Math.ceil(((((((myPokemon["level"] * 0.4) + 2) * myPokemon["stats"][1] * puissanceAttaque) / enemyPokemon["stats"][2]) / 50) + 2) * multi);
                } else if (attack['category'] === "statut") {
                    myDamage = 0;
                } else {
                    myDamage = Math.ceil(((((((myPokemon["level"] * 0.4) + 2) * myPokemon["stats"][3] * puissanceAttaque) / enemyPokemon["stats"][4]) / 50) + 2) * multi);
                }

                damageCombatPokemon(1, combatObject, myDamage);
                combatObject["myTurn"] = false;

                let msgEmbed = new EmbedBuilder();
                let descriptionStr = "";
                if (cc > 1) {
                    descriptionStr += "Coup Critique ! ";
                    msgEmbed.setColor("#fff300");
                } else msgEmbed.setColor("#ff5600");
                if (avantageType === 0) {
                    descriptionStr += `${attack.name} n'affecte pas ${enemyPokemon.name} ... `;
                } else if (avantageType < 1) {
                    descriptionStr += `${attack.name} n'est pas très efficace ... `;
                } else if (avantageType > 1) {
                    descriptionStr += `${attack.name} est super efficace ! `;
                }
                descriptionStr += "La puissance de " + attack.name + " était de " + puissanceAttaque;

                msgEmbed.setTitle("Votre " + myPokemon["name"].toLowerCase() + " a attaqué et vous avez infligé " + myDamage + " points de dégâts !");
                msgEmbed.setDescription(descriptionStr);
                msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});
                msgEmbed.addFields({name:myPokemon["name"], value:combatObject["myPokemonHP"] + "/" + myPokemon["stats"][0] + " PV", inline: true});
                msgEmbed.addFields({name:enemyPokemon["name"], value:combatObject["enemyPokemonHP"] + "/" + enemyPokemon["stats"][0] + " PV", inline: true});

                message.channel.send({embeds: [msgEmbed]});

                collector.stop();
            } else if (!user.bot) {
                let msgEmbed = new EmbedBuilder();
                msgEmbed.setTitle("Vous ne pouvez pas réagir aux messages des autres !");
                msgEmbed.setDescription("<@" + user.id + "> fait plus ça c'est pas bien !");
                msgEmbed.setColor("#ff0000");
                msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                message.channel.send({embeds: [msgEmbed]});
            }
        });

        collector.on("end", collected => {
            resolve(combatPVE(myPokemon, enemyPokemon, combatObject, message));
            return;
        });

    });
}

function getPokemonAttack(pokemon, index) {
    return pokemon["capacities"][index];
}

function chooseRandomAttack(pokemon) {
    return pokemon["capacities"][Math.floor(Math.random() * pokemon["capacities"].length)];
}

/**
 * Récupère le multiplicateur d'attaque en fonction du type de l'attaque et du ou des types du défenseur
 * @param {String}typeAtt - Type de l'attaque
 * @param {String[]}typesDefs - Tableau du ou des types du défenseur
 * @returns {number} - Renvoie le multiplicateur
 */
function getMultiAvantageType(typeAtt, typesDefs) {
    let multi = 1;
    typesDefs.forEach(typeDef => {
        switch(typeAtt) {
            case "Acier":
                switch(typeDef) {
                    case "Acier":
                        multi = multi*0.5
                        break;
                    case "Eau":
                        multi = multi*0.5
                        break;
                    case "Électrik":
                        multi = multi*0.5
                        break;
                    case "Fée":
                        multi = multi*2
                        break;
                    case "Feu":
                        multi = multi*0.5
                        break;
                    case "Glace":
                        multi = multi*2
                        break;
                    case "Roche":
                        multi = multi*2
                        break;
                    default:
                        break;
                }
                break;
            case "Combat":
                switch(typeDef) {
                    case "Acier":
                        multi = multi*2
                        break;
                    case "Fée":
                        multi = multi*0.5
                        break;
                    case "Glace":
                        multi = multi*2
                        break;
                    case "Insecte":
                        multi = multi*0.5
                        break;
                    case "Normal":
                        multi = multi*2
                        break;
                    case "Poison":
                        multi = multi*0.5
                        break;
                    case "Psy":
                        multi = multi*0.5
                        break;
                    case "Roche":
                        multi = multi*2
                        break;
                    case "Spectre":
                        multi = 0
                        break;
                    case "Ténèbres":
                        multi = multi*2
                        break;
                    case "Vol":
                        multi = multi*0.5
                        break;
                    default:
                        break;
                }
                break;
            case "Dragon":
                switch(typeDef) {
                    case "Acier":
                        multi = multi*0.5
                        break;
                    case "Dragon":
                        multi = multi*2
                        break;
                    case "Fée":
                        multi = 0
                        break;
                    default:
                        break;
                }
                break;
            case "Eau":
                switch(typeDef) {
                    case "Dragon":
                        multi = multi*0.5
                        break;
                    case "Eau":
                        multi = multi*0.5
                        break;
                    case "Feu":
                        multi = multi*2
                        break;
                    case "Plante":
                        multi = multi*0.5
                        break;
                    case "Roche":
                        multi = multi*2
                        break;
                    case "Sol":
                        multi = multi*2
                        break;
                    default:
                        break;
                }
                break;
            case "Électrik":
                switch(typeDef) {
                    case "Dragon":
                        multi = multi*0.5
                        break;
                    case "Eau":
                        multi = multi*2
                        break;
                    case "Électrik":
                        multi = multi*0.5
                        break;
                    case "Plante":
                        multi = multi*0.5
                        break;
                    case "Sol":
                        multi = 0
                        break;
                    case "Vol":
                        multi = multi*2
                        break;
                    default:
                        break;
                }
                break;
            case "Fée":
                switch(typeDef) {
                    case "Acier":
                        multi = multi*0.5
                        break;
                    case "Combat":
                        multi = multi*2
                        break;
                    case "Dragon":
                        multi = multi*2
                        break;
                    case "Feu":
                        multi = multi*0.5
                        break;
                    case "Poison":
                        multi = multi*0.5
                        break;
                    case "Ténèbres":
                        multi = multi*0.5
                        break;
                    default:
                        break;
                }
                break;
            case "Feu":
                switch(typeDef) {
                    case "Acier":
                        multi = multi*2
                        break;
                    case "Dragon":
                        multi = multi*0.5
                        break;
                    case "Eau":
                        multi = multi*0.5
                        break;
                    case "Feu":
                        multi = multi*0.5
                        break;
                    case "Glace":
                        multi = multi*2
                        break;
                    case "Insecte":
                        multi = multi*2
                        break;
                    case "Plante":
                        multi = multi*2
                        break;
                    case "Roche":
                        multi = multi*0.5
                        break;
                    default:
                        break;
                }
                break;
            case "Glace":
                switch(typeDef) {
                    case "Acier":
                        multi = multi*0.5
                        break;
                    case "Dragon":
                        multi = multi*2
                        break;
                    case "Eau":
                        multi = multi*0.5
                        break;
                    case "Feu":
                        multi = multi*0.5
                        break;
                    case "Glace":
                        multi = multi*0.5
                        break;
                    case "Plante":
                        multi = multi*2
                        break;
                    case "Sol":
                        multi = multi*2
                        break;
                    case "Vol":
                        multi = multi*2
                        break;
                    default:
                        break;
                }
                break;
            case "Insecte":
                switch(typeDef) {
                    case "Acier":
                        multi = multi*0.5
                        break;
                    case "Combat":
                        multi = multi*0.5
                        break;
                    case "Fée":
                        multi = multi*0.5
                        break;
                    case "Feu":
                        multi = multi*0.5
                        break;
                    case "Plante":
                        multi = multi*2
                        break;
                    case "Poison":
                        multi = multi*0.5
                        break;
                    case "Psy":
                        multi = multi*2
                        break;
                    case "Spectre":
                        multi = multi*0.5
                        break;
                    case "Ténèbres":
                        multi = multi*2
                        break;
                    case "Vol":
                        multi = multi*0.5
                        break;
                    default:
                        break;
                }
                break;
            case "Normal":
                switch(typeDef) {
                    case "Acier":
                        multi = multi*0.5
                        break;
                    case "Roche":
                        multi = multi*0.5
                        break;
                    case "Spectre":
                        multi = 0
                        break;
                    default:
                        break;
                }
                break;
            case "Plante":
                switch(typeDef) {
                    case "Acier":
                        multi = multi*0.5
                        break;
                    case "Dragon":
                        multi = multi*0.5
                        break;
                    case "Eau":
                        multi = multi*2
                        break;
                    case "Feu":
                        multi = multi*0.5
                        break;
                    case "Insecte":
                        multi = multi*0.5
                        break;
                    case "Plante":
                        multi = multi*0.5
                        break;
                    case "Poison":
                        multi = multi*0.5
                        break;
                    case "Roche":
                        multi = multi*2
                        break;
                    case "Sol":
                        multi = multi*2
                        break;
                    case "Vol":
                        multi = multi*0.5
                        break;
                    default:
                        break;
                }
                break;
            case "Poison":
                switch(typeDef) {
                    case "Acier":
                        multi = 0
                        break;
                    case "Fée":
                        multi = multi*2
                        break;
                    case "Plante":
                        multi = multi*2
                        break;
                    case "Poison":
                        multi = multi*0.5
                        break;
                    case "Roche":
                        multi = multi*0.5
                        break;
                    case "Sol":
                        multi = multi*0.5
                        break;
                    case "Spectre":
                        multi = multi*0.5
                        break;
                    default:
                        break;
                }
                break;
            case "Psy":
                switch(typeDef) {
                    case "Acier":
                        multi = multi*0.5
                        break;
                    case "Combat":
                        multi = multi*2
                        break;
                    case "Poison":
                        multi = multi*2
                        break;
                    case "Psy":
                        multi = multi*0.5
                        break;
                    case "Ténèbres":
                        multi = 0
                        break;
                    default:
                        break;
                }
                break;
            case "Roche":
                switch(typeDef) {
                    case "Acier":
                        multi = multi*0.5
                        break;
                    case "Combat":
                        multi = multi*0.5
                        break;
                    case "Feu":
                        multi = multi*2
                        break;
                    case "Glace":
                        multi = multi*2
                        break;
                    case "Insecte":
                        multi = multi*2
                        break;
                    case "Sol":
                        multi = multi*0.5
                        break;
                    case "Vol":
                        multi = multi*2
                        break;
                    default:
                        break;
                }
                break;
            case "Sol":
                switch(typeDef) {
                    case "Acier":
                        multi = multi*2
                        break;
                    case "Électrik":
                        multi = multi*2
                        break;
                    case "Feu":
                        multi = multi*2
                        break;
                    case "Insecte":
                        multi = multi*0.5
                        break;
                    case "Plante":
                        multi = multi*0.5
                        break;
                    case "Poison":
                        multi = multi*2
                        break;
                    case "Roche":
                        multi = multi*2
                        break;
                    case "Vol":
                        multi = 0
                        break;
                    default:
                        break;
                }
                break;
            case "Spectre":
                switch(typeDef) {
                    case "Normal":
                        multi = 0
                        break;
                    case "Psy":
                        multi = multi*2
                        break;
                    case "Spectre":
                        multi = multi*2
                        break;
                    case "Ténèbres":
                        multi = multi*0.5
                        break;
                    default:
                        break;
                }
                break;
            case "Ténèbres":
                switch(typeDef) {
                    case "Combat":
                        multi = multi*0.5
                        break;
                    case "Fée":
                        multi = multi*0.5
                        break;
                    case "Psy":
                        multi = multi*2
                        break;
                    case "Spectre":
                        multi = multi*2
                        break;
                    case "Ténèbres":
                        multi = multi*0.5
                        break;
                    default:
                        break;
                }
                break;
            case "Vol":
                switch(typeDef) {
                    case "Acier":
                        multi = multi*0.5
                        break;
                    case "Combat":
                        multi = multi*2
                        break;
                    case "Électrik":
                        multi = multi*0.5
                        break;
                    case "Insecte":
                        multi = multi*2
                        break;
                    case "Plante":
                        multi = multi*2
                        break;
                    case "Roche":
                        multi = multi*0.5
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }
    });

    return multi;

}

/**
 * Détermine si un pokémon peut s'enfuir d'un combat
 * @param {Object}myPokemon - Pokémon qui doit s'enfuir
 * @param {Object}enemyPokemon - Pokémon ennemi
 * @param {Number}multi=1 - Multiplicateur de chance d'évasion
 * @returns {boolean} - Renvoie vrai si le pokémon peut s'enfuir renvoie faux sinon
 */
function canEscape(myPokemon, enemyPokemon, multi= 1) {
    let A = myPokemon["stats"][5]*32
    let B = Math.floor(enemyPokemon["stats"][5]/4)%255;
    let chance = (Math.floor(A/B)+30)*multi;

    if (chance > 255) return true;

    let rand = Math.floor(Math.random() * 256);

    return rand <= chance;
}

/**
 * Inflige des dégâts selon la cible du combat PVE
 * @param {Number}target - Si 0 la cilbe est le pokémon allié sinon c'est le pokémon ennemi
 * @param {Object}combatObject - Objet de combat pour garder les informations du combat en cours
 * @param {Number}damage - Dégâts à infliger
 */
function damageCombatPokemon(target, combatObject, damage) {
    if (target === 0) {
        combatObject["myPokemonHP"] -= damage;
    } else {
        combatObject["enemyPokemonHP"] -= damage;
    }
}

/**
 * Fonction pour déterminer la puissance d'une attaque aléatoirement
 * @returns {number} - Puissance de l'attaque
 */
function chooseAttackPower() {
    let rand = Math.floor(Math.random() * 10) + 1;
    return rand*10;
}

/**
 * Fonction pour déterminer la puissance d'un coup critique et s'il a lieu ou non
 * @param {Number}level - Niveau du pokémon
 * @param {Number}speed - Vitesse du pokémon
 * @param {Number}modif=1 - Modificateur de chance
 * @returns {number} - Modificateur de dégâts du coup critique
 */
function getCC(level, speed, modif = 1) {
    let damageMulti = ((2*level)+5)/(2*level);
    let rand = Math.floor(Math.random() * 256);
    let chance = (Math.floor(speed/2) * modif);
    if (chance >= 255) chance = 254;

    if (chance > rand) return damageMulti;
    else return 1;
}

async function pveDrawEnemyPokemon(pokemon, difficulty) {
    return new Promise(async (resolve, reject) => {
        let enemyPokemon = parsePokemon(drawPokemon());
        let level = 0;
        let xpToAdd = 0;
        if (difficulty === 1) {
            let rand = Math.floor(Math.random() * 3);
            level = (rand - 3) + pokemon['level'];
            if (level <= 0) level = 1;
            if (level > 100) level = 100;
            for (let i = 0; i < level; i++) xpToAdd += Math.pow(i, 2);
        } else if (difficulty === 2) {
            let rand = Math.floor(Math.random() * 6);
            level = (rand - 2) + pokemon['level'];
            if (level <= 0) level = 1;
            if (level > 100) level = 100;
            for (let i = 0; i < level; i++) xpToAdd += Math.pow(i, 2);
        } else {
            let rand = Math.floor(Math.random() * 10);
            level = rand + pokemon['level'];
            if (level <= 0) level = 1;
            if (level > 100) level = 100;
            for (let i = 0; i < level; i++) xpToAdd += Math.pow(i, 2);
        }

        await addExp(enemyPokemon, xpToAdd);
        resolve(enemyPokemon);
    })
}

/**
 * Fonction pour choisir le pokémon à envoyer au combat quand plusieurs sont trouvés
 * @param {Object[]}pokemons - Liste des pokémons à sélectionner
 * @param message
 * @returns {Promise<unknown>}
 */
function choosePokemonPVE(pokemons, message) {
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
                collector.stop();
            }
        });
    })
}

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
 * Compare les UUID de deux pokémons
 * @param {Object}pokemon1
 * @param {Object}pokemon2
 * @returns {boolean}
 */
function comparePokemonUUID(pokemon1, pokemon2) {
    return pokemon1["uuid"] === pokemon2["uuid"];
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

/**
 * Fonction pour choisir et afficher le bon message d'aide
 * @param message
 */
function help(message) {
    let args = message.content.split(" ");

    let msgEmbed;
    if (args[2] === "start") {
        msgEmbed = helpStart();
    } else if (args[2] === "list" || args[2] === "liste" || args[2] === "inv") {
        msgEmbed = helpList();
    } else if (args[2] === "info") {
        msgEmbed = helpInfo();
    } else if (args[2] === "explore") {
        msgEmbed = helpExplore();
    } else if (args[2] === "train") {
        msgEmbed = helpTrain();
    } else if (args[2] === "trainPVE") {
        msgEmbed = helpTrainPVE();
    } else if (args[2] === "heal") {
        msgEmbed = helpHeal();
    } else if (args[2] === "team") {
        if (args[3] === "print") {
            msgEmbed = helpTeamPrint();
        } else if (args[3] === "add") {
            msgEmbed = helpTeamAdd();
        } else if (args[3] === "remove") {
            msgEmbed = helpTeamRemove();
        } else if (args[3] === "create") {
            msgEmbed = helpTeamCreate();
        } else {
            msgEmbed = helpTeam();
        }
    } else if (args[2] === "release") {
        msgEmbed = helpRelease();
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

    msgEmbed.setTitle("Pokémon - Start");
    msgEmbed.setDescription("Permet de commencer son aventure pokémon !");
    msgEmbed.setFooter({text: "pour plus d'informations utilisez la commande \"pokemon help\"."});
    msgEmbed.setColor("#6e0e91");
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "pokemon start"});
    msgEmbed.addFields({name: "Exemple de commande", value: "pokemon start"});

    return msgEmbed;
}

/**
 * Message d'aide pour la commande list
 * @returns {EmbedBuilder}
 */
function helpList() {
    let msgEmbed = new EmbedBuilder();

    msgEmbed.setTitle("Pokémon - Liste");
    msgEmbed.setDescription("Permet d'afficher la liste de ses pokémons !");
    msgEmbed.setFooter({text: "pour plus d'informations utilisez la commande \"pokemon help\"."});
    msgEmbed.setColor("#6e0e91");
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "pokemon list"});
    msgEmbed.addFields({name: "Alias", value: " ", inline: true});
    msgEmbed.addFields({name: "list", value: "list, liste, inv", inline: true});
    msgEmbed.addFields({name: "Exemple de commande", value: "pokemon liste"});

    return msgEmbed;
}

/**
 * Message d'aide pour la commande info
 * @returns {EmbedBuilder}
 */
function helpInfo() {
    let msgEmbed = new EmbedBuilder();

    msgEmbed.setTitle("Pokémon - Info");
    msgEmbed.setDescription("Permet d'afficher les informations d'un pokémon !");
    msgEmbed.setFooter({text: "pour plus d'informations utilisez la commande \"pokemon help\"."});
    msgEmbed.setColor("#6e0e91");
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "pokemon info [nom_du_pokemon]"});
    msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
    msgEmbed.addFields({name: "nom_du_pokemon", value: "Nom du pokémon dont il faut afficher les informations", inline: true});
    msgEmbed.addFields({name: "Exemple de commande", value: "pokemon info évoli"});

    return msgEmbed;
}

/**
 * Message d'aide pour la commande explore
 * @returns {EmbedBuilder}
 */
function helpExplore() {
    let msgEmbed = new EmbedBuilder();

    msgEmbed.setTitle("Pokémon - Explore");
    msgEmbed.setDescription("Permet d'explorer les hautes herbes pour attraper un nouveau pokémon. Vous pouvez utiliser la commande une fois toutes les heures.");
    msgEmbed.setFooter({text: "pour plus d'informations utilisez la commande \"pokemon help\"."});
    msgEmbed.setColor("#6e0e91");
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "pokemon explore"});
    msgEmbed.addFields({name: "Exemple de commande", value: "pokemon explore"});

    return msgEmbed;
}

/**
 * Message d'aide pour la commande train
 * @returns {EmbedBuilder}
 */
function helpTrain() {
    let msgEmbed = new EmbedBuilder();

    msgEmbed.setTitle("Pokémon - Train");
    msgEmbed.setDescription("Permet d'entrainer un pokémon. Vous avez 5 entrainements disponibles toutes les heures.");
    msgEmbed.setFooter({text: "pour plus d'informations utilisez la commande \"pokemon help\"."});
    msgEmbed.setColor("#6e0e91");
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "pokemon train [nom_du_pokemon]"});
    msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
    msgEmbed.addFields({name: "nom_du_pokemon", value: "Nom du pokémon à entrainer", inline: true});
    msgEmbed.addFields({name: "Exemple de commande", value: "pokemon train évoli"});

    return msgEmbed;
}

/**
 * Message d'aide pour la commande trainPVE
 * @returns {EmbedBuilder}
 */
function helpTrainPVE() {
    let msgEmbed = new EmbedBuilder();

    msgEmbed.setTitle("Pokémon - TrainPVE");
    msgEmbed.setDescription("Permet de faire des combats contre un pokémon sauvage ! Il existe plusieurs niveaux de difficultés." +
        "Les niveaux de difficultés influent sur le niveau des pokémons sauvages rencontrés : \n" +
        "- easy/facile : entre -3 et 0 niveaux de différence\n" +
        "- medium : entre -2 et +3 niveaux de différence\n" +
        "- hard/difficile : entre 0 et +10 niveaux de différence.\n\n" +
        "Les combats gagnés rapportent de l'expérience, et la difficulté ajoute un multiplicateur sur la quantité d'expérience gagnée : \n" +
        "- easy/facile : x1\n" +
        "- medium : x2\n" +
        "- hard/difficile: x3\n\n" +
        "De plus chaque combat rapport 1.5 fois plus d'expérience qu'un entrainement normal.\n\n" +
        "**Les points de vie perdus de votre pokémon ne sont pas restaurés à la fin des combats !** " +
        "\nFaites attention à bien vérifier ces derniers si vous ne voulez pas que votre pokémon tombe K.O.");
    msgEmbed.setFooter({text: "pour plus d'informations utilisez la commande \"pokemon help\"."});
    msgEmbed.setColor("#6e0e91");
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "pokemon trainPVE [difficulty] [nom_du_pokemon]"});
    msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
    msgEmbed.addFields({name: "difficulty", value: "Difficulté de la rencontre : easy/facile, medium, hard/difficile", inline: true});
    msgEmbed.addFields({name: "nom_du_pokemon", value: "Nom du pokémon à envoyer combattre", inline: true});
    msgEmbed.addFields({name: "Exemple de commande", value: "pokemon trainPVE medium évoli"});

    return msgEmbed;
}

/**
 * Message d'aide pour la commande heal
 * @returns {EmbedBuilder}
 */
function helpHeal() {
    let msgEmbed = new EmbedBuilder();

    msgEmbed.setTitle("Pokémon - Heal");
    msgEmbed.setDescription("Permet de soigner ses pokémons ! Vous ne pouvez soigner vos pokémons qu'une fois toutes les heures");
    msgEmbed.setFooter({text: "pour plus d'informations utilisez la commande \"pokemon help\"."});
    msgEmbed.setColor("#6e0e91");
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "pokemon heal"});
    msgEmbed.addFields({name: "Exemple de commande", value: "pokemon heal"});

    return msgEmbed;
}

/**
 * Message d'aide pour la commande team
 * @returns {EmbedBuilder}
 */
function helpTeam() {
    let msgEmbed = new EmbedBuilder();

    msgEmbed.setTitle("Pokémon - Team");
    msgEmbed.setDescription("Permet de gérer sa team de pokémon !\nPar défaut la commande affiche la team si elle existe.");
    msgEmbed.setFooter({text: "pour plus d'informations utilisez la commande \"pokemon help\"."});
    msgEmbed.setColor("#6e0e91");
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "pokemon team [commande] [options:optionnel]"});
    msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
    msgEmbed.addFields({name: "commande", value: "Commande à faire pour gérer sa team : create, print, add, remove", inline: true});
    msgEmbed.addFields({name: "options", value: "Options des différentes commandes", inline: true});
    msgEmbed.addFields({name: "Exemple de commande", value: "pokemon team print"});

    return msgEmbed;
}

/**
 * Message d'aide pour la commande team create
 * @returns {EmbedBuilder}
 */
function helpTeamCreate() {
    let msgEmbed = new EmbedBuilder();

    msgEmbed.setTitle("Pokémon - Team - Create");
    msgEmbed.setDescription("Permet de créer sa team de pokémon !");
    msgEmbed.setFooter({text: "pour plus d'informations utilisez la commande \"pokemon help\"."});
    msgEmbed.setColor("#6e0e91");
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "pokemon team create [nom_du_pokemon_1] [nom_du_pokemon_2] ..."});
    msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
    msgEmbed.addFields({name: "nom_du_pokemon_x", value: "Nom du pokémon à ajouter à sa team", inline: true});
    msgEmbed.addFields({name: "Exemple de commande", value: "pokemon team create évoli roucool léviator arcanin"});

    return msgEmbed;
}

/**
 * Message d'aide pour la commande team print
 * @returns {EmbedBuilder}
 */
function helpTeamPrint() {
    let msgEmbed = new EmbedBuilder();

    msgEmbed.setTitle("Pokémon - Team - Print");
    msgEmbed.setDescription("Permet d'afficher sa team de pokémon !");
    msgEmbed.setFooter({text: "pour plus d'informations utilisez la commande \"pokemon help\"."});
    msgEmbed.setColor("#6e0e91");
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "pokemon team print"});
    msgEmbed.addFields({name: "Exemple de commande", value: "pokemon team print"});

    return msgEmbed;
}

/**
 * Message d'aide pour la commande team add
 * @returns {EmbedBuilder}
 */
function helpTeamAdd() {
    let msgEmbed = new EmbedBuilder();

    msgEmbed.setTitle("Pokémon - Team - Add");
    msgEmbed.setDescription("Permet d'ajouter un pokémon à sa team' !");
    msgEmbed.setFooter({text: "pour plus d'informations utilisez la commande \"pokemon help\"."});
    msgEmbed.setColor("#6e0e91");
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "pokemon team add [nom_du_pokemon]"});
    msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
    msgEmbed.addFields({name: "nom_du_pokemon", value: "Nom du pokémon à ajouter à sa team", inline: true});
    msgEmbed.addFields({name: "Exemple de commande", value: "pokemon team add évoli"});

    return msgEmbed;
}

/**
 * Message d'aide pour la commande team remove
 * @returns {EmbedBuilder}
 */
function helpTeamRemove() {
    let msgEmbed = new EmbedBuilder();

    msgEmbed.setTitle("Pokémon - Team - Remove");
    msgEmbed.setDescription("Permet de supprimer un pokémon à sa team' !");
    msgEmbed.setFooter({text: "pour plus d'informations utilisez la commande \"pokemon help\"."});
    msgEmbed.setColor("#6e0e91");
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "pokemon team remove [nom_du_pokemon]"});
    msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
    msgEmbed.addFields({name: "nom_du_pokemon", value: "Nom du pokémon à supprimer de sa team", inline: true});
    msgEmbed.addFields({name: "Exemple de commande", value: "pokemon team remove évoli"});

    return msgEmbed;
}

/**
 * Message d'aide pour la commande release
 * @returns {EmbedBuilder}
 */
function helpRelease() {
    let msgEmbed = new EmbedBuilder();

    msgEmbed.setTitle("Pokémon - Release");
    msgEmbed.setDescription("Permet de relâche un pokémon !");
    msgEmbed.setFooter({text: "pour plus d'informations utilisez la commande \"pokemon help\"."});
    msgEmbed.setColor("#6e0e91");
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "pokemon release [nom_du_pokemon]"});
    msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
    msgEmbed.addFields({name: "nom_du_pokemon", value: "Nom du pokémon à relâcher", inline: true});
    msgEmbed.addFields({name: "Exemple de commande", value: "pokemon release évoli"});

    return msgEmbed;
}

/**
 * Message d'aide global
 * @returns {EmbedBuilder}
 */
function helpGlobal() {
    let msgEmbed = new EmbedBuilder();

    msgEmbed.setTitle("Help - Pokémon");
    msgEmbed.setDescription("Commandes pour jouer au pokémon grâce au bot wouhou ! Pour chaque commande il y existe un menu help pour l'afficher utiliser la commande *pokemon [commande] help*.");
    msgEmbed.setFooter({text: "pour plus d'informations utilisez la commande \"pokemon help\"."});
    msgEmbed.setColor("#6e0e91");
    msgEmbed.addFields({name: "start", value: "Pour commencer l'aventure pokémon"});
    msgEmbed.addFields({name: "list/lsite/inv", value: "Affiche la liste de tous ses pokémons"});
    msgEmbed.addFields({name: "info", value: "Affiche les informations d'un de ses pokémons"});
    msgEmbed.addFields({name: "explore", value: "Permet d'explorer les hautes herbes pour attraper des nouveau pokémons"});
    msgEmbed.addFields({name: "train", value: "Permet d'entrainer un de vos pokémons"});
    msgEmbed.addFields({name: "trainPVE", value: "Permet de faire des combats contre des pokémons sauvages"});
    msgEmbed.addFields({name: "heal", value: "Permet de soigner tous ses pokémons"});
    msgEmbed.addFields({name: "team", value: "Permet de gérer son équipe de pokémon"});
    msgEmbed.addFields({name: "release", value: "Permet de relâcher un pokémon"});
    msgEmbed.addFields({name: "help", value: "Affiche ce message"});

    return msgEmbed;
}

/**
 * Permet de relier les objets pokémons présent entre la team et le tableau pokémon
 * @param {Object}player - Joueur à qui relier les objets
 */
function refreshTeam(player) {
    for (let j = 0; j < player["team"].length; j++) {
        let i = 0;
        while (i < player["pokemons"].length) {
            if (comparePokemonUUID(player["team"][j], player["pokemons"][i])) {
                player["team"][j] = player["pokemons"][i];
                break;
            }
            i++;
        }
    }
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
    } else if (args[1] === "train") {
        train(message).then(r => {});
    } else if (args[1] === "info") {
        infosPokemon(message).then(r => {});
    } else if (args[1] === "trainPVE" || args[1] === "trainpve") {
        pveMain(message);
    } else if (args[1] === "heal") {
        healPokemons(message);
    } else if (args[1] === "team") {
        teamManager(message);
    } else if (args[1] === "release") {
        releasePokemonMain(message);
    } else if (args[1] === "admin") {
        admin(message);
    } else if (args[1] === "help") {
        help(message);
    }
}

module.exports = {
    execute
}

async function test(message) {
    let args = message.content.split(" ");
    /*pokemonData["arenes"] = [
        {
            "name": "Arène 1",
            "pokemons": [],
            "badge": "Badge 1"
        }
    ]

    console.log("terminé !");
    updateData();

    */
    //await scarpCapacity();
    //await flemme();
    //await capaciteUnique(args[2]);
    //oui();
    //prout();
}

const axios = require('axios');
const cheerio = require('cheerio');

async function scarpCapacity() {
    try {
        const response = await axios.get("https://www.pokepedia.fr/Liste_des_capacités");
        const html = response.data;

        const $ = cheerio.load(html);
        let tbody = $('tbody')['1'];

        let i = 0;
        let resArray = [];
        let finished = false;
        $(tbody).find('tr').each((index, element) => {
            if (i === 0) {
                i++;
                return;
            } else i++;
            if (finished) return;
            const tds = $(element).find('td');
            let capIndex = $(tds[1]).text();
            let capName = $(tds[2]).text();
            let capType = $(tds[3]).find('a').attr('title').split(" ")[0];
            let capCatSplit = $(tds[4]).find('a').attr('title').split(" ");
            let capCat = capCatSplit[capCatSplit.length - 1];

            let finalObj = {
                "index": capIndex,
                "name": capName,
                "type": capType,
                "category": capCat
            }
            resArray.push(finalObj);
            if (finalObj["name"] === "Yoga") finished = true;
            //console.log(`${capIndex}, ${capName}, ${capType}, ${capCat}`);
        });

        for (let capacite of resArray) {
            if (capacite.name === "Osmerang" || capacite.name === "Pilonnage" || capacite.name === "Regard Médusant" || capacite.name === "Souplesse" || capacite.name === "Blizzard" || capacite.name === "Déflagration" || capacite.name === "Fatal-Foudre" || capacite.name === "Lance-Soleil" || capacite.name === "Laser Glace" || capacite.name === "Mur Lumière" || capacite.name === "Psyko" || capacite.name === "Reflet" || capacite.name === "Séisme" || capacite.name === "Tonnerre" || capacite.name === "Tunnel" || capacite.name === "Ultralaser") continue;
            console.log("getting pokémons for " + capacite.name);

            let linkName = ";"
            if (capacite.name === "Bouclier" || capacite.name === "Brouillard" || capacite.name === "Clonage" || capacite.name === "Métronome" || capacite.name === "Puissance" || capacite.name === "Riposte" || capacite.name === "Sacrifice" || capacite.name === "Vol") {
                linkName = capacite.name + "_(capacité)";
            } else if (capacite.name.split(" ").length > 1) {
                linkName = capacite.name.split(" ").join("_");
            } else linkName = capacite.name;

            let response = await axios.get("https://www.pokepedia.fr/" + linkName);
            const html = response.data;

            const $ = cheerio.load(html);
            let pp = $('#mw-content-text > div.mw-parser-output > table.tableaustandard.ficheinfo > tbody > tr:nth-child(10) > td').text().split(" ")[0];
            let puissance = $('#mw-content-text > div.mw-parser-output > table.tableaustandard.ficheinfo > tbody > tr:nth-child(11) > td').text();
            let precision = $('#mw-content-text > div.mw-parser-output > table.tableaustandard.ficheinfo > tbody > tr:nth-child(12) > td').text().split(" ")[0]

            let pokemons = [];
            let tbody = $('#mw-content-text > div.mw-parser-output > table.capacité-niveau').eq(0).find('tbody');
            $(tbody).find('tr').each((index, element) => {
                const tds = $(element).find('td');
                for (let i = 0; i < (tds.length)/2; i++) {
                    let pokemon = $(tds[i*2]);
                    let pokemonId = parseInt($(pokemon).find('.miniat-poke').text().split(" ")[0]);
                    let pokemonName = $(pokemon).find('.miniat-poke > a').attr("title")
                    let pokemonLvlRaw = $(tds[(i*2)+1]).text();
                    let pokemonLvl = 0;
                    if (pokemonLvlRaw !== "Départ") pokemonLvl = parseInt(pokemonLvlRaw.split(".")[1]);

                    pokemons.push({
                        'id': pokemonId,
                        "name": pokemonName,
                        'level': pokemonLvl
                    });
                }
            });

            capacite["pp"] = parseInt(pp);

            let puissanceInt = parseInt(puissance);
            if (Number.isNaN(puissanceInt)) puissanceInt = 0;
            capacite["puissance"] = puissanceInt;

            let precisionInt = parseInt(precision);
            if (Number.isNaN(precisionInt)) precisionInt = 0;
            capacite["precision"] = precisionInt;
            capacite["pokemons"] = pokemons;

            if (pokemons.length === 0) {
                console.log("sexe");
                capacite["pokemons"] = await capaciteUnique("https://www.pokepedia.fr/" + linkName + "/Génération_7#Pokémon_apprenant_la_capacité");
            }
        }

        console.log("terminé !");
        //console.log(resArray);
        fs.writeFileSync(path.resolve(__dirname, "../../json_files/pokemonCapacitesV2.json"), JSON.stringify(resArray));

        // pour chaque capacité récup PP, Puissance, Précision, Liste pokémon apprenant capacité
        //oui2(resArray);
    } catch (err) {
        console.error(err);
    }


}

async function capaciteUnique(link) {
    let capacite = {};
    const response = await axios.get(link);

    const html = response.data;

    const $ = cheerio.load(html);
    let pp = $('#mw-content-text > div.mw-parser-output > table.tableaustandard.ficheinfo > tbody > tr:nth-child(10) > td').text().split(" ")[0];
    let puissance = $('#mw-content-text > div.mw-parser-output > table.tableaustandard.ficheinfo > tbody > tr:nth-child(11) > td').text();
    let precision = $('#mw-content-text > div.mw-parser-output > table.tableaustandard.ficheinfo > tbody > tr:nth-child(12) > td').text().split(" ")[0]

    let pokemons = [];
    let tbody = $('table.capacité-niveau').eq(0).find('tbody');

    $(tbody).find('tr').each((index, element) => {
        const tds = $(element).find('td');
        for (let i = 0; i < (tds.length)/2; i++) {
            let pokemon = $(tds[i*2]);
            let pokemonId = parseInt($(pokemon).find('.miniat-poke').text().split(" ")[0]);
            let pokemonName = $(pokemon).find('.miniat-poke > a').attr("title")
            let pokemonLvlRaw = $(tds[(i*2)+1]).text();
            let pokemonLvl = 0;
            if (pokemonLvlRaw !== "Départ") pokemonLvl = parseInt(pokemonLvlRaw.split(".")[1]);

            pokemons.push({
                'id': pokemonId,
                "name": pokemonName,
                'level': pokemonLvl
            });
        }
    });

    let ppInt = parseInt(pp);
    if (Number.isNaN(ppInt)) ppInt = 0
    capacite["pp"] = ppInt;

    let puissanceInt = parseInt(puissance);
    if (Number.isNaN(puissanceInt)) puissanceInt = 0;
    capacite["puissance"] = puissanceInt;

    let precisionInt = parseInt(precision);
    if (Number.isNaN(precisionInt)) precisionInt = 0;
    capacite["precision"] = precisionInt;
    capacite["pokemons"] = pokemons;

    /*console.log("\"pokemons\": [")
    capacite["pokemons"].forEach(pokemon => {
        console.log("  {");
        console.log("    \"id\": " + pokemon["id"] + ",");
        console.log("    \"name\": \"" + pokemon["name"] + "\",");
        console.log("    \"level\": " + pokemon["level"] + "");
        console.log("  },");
    });
    console.log("]");*/

    return capacite["pokemons"];
}

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

async function flemme() {
    let pokemons = []
    for (let i = 0; i < 43; i++) {
        let nom = await askQuestion("Nom du pokémon : ");
        let level = await askQuestion("Level : ");
        pokemons.push({
            "id": 0,
            "name": nom,
            "level": level
        });
    }

    for (const pokemon of pokemons) {
        pokemon["id"] = parseInt(await askQuestion("Id de " + pokemon.name + " : "));
    }

    console.log('\n\n\n');
    console.log(pokemons);
}

function oui() {
    const rawdata = fs.readFileSync(path.resolve(__dirname, "../../json_files/pokemonCapacitesV2.json"));
    let data = JSON.parse(rawdata);

    data.forEach(capacite => {
        if (!capacite.hasOwnProperty("pokemons")) console.log(capacite.name + " ** ");
        else if (capacite["pokemons"].length === 0) console.log(capacite.name);
    })
}

function prout() {
    let rawData = fs.readFileSync(path.resolve(__dirname, "../../json_files/pokemonCapacitesV2.json"));
    let capacitesData = JSON.parse(rawData);
    rawData = fs.readFileSync(path.resolve(__dirname, "../../json_files/pokemonTestListe.json"));
    let pokemons = JSON.parse(rawData);

    pokemons.forEach(pokemon => {
        pokemon["capacites"] = Array.from({ length: 100}, () => []);
    });

    let i = 0
    capacitesData.forEach(capacite => {
        console.log("capacite [" + i + "] : " + capacite.name);
        let pokemonsCap = capacite["pokemons"];
        pokemonsCap.forEach(pokemon => {
            if (pokemon.id > 151) return;
            let pokemonToAddCapacity = getPokemonWithName(pokemon.name, pokemons);
            if (!pokemonToAddCapacity) return;

            pokemonToAddCapacity["capacites"][pokemon.level].push(parseCapacite(capacite));
        });

        i++;
    });

    fs.writeFileSync(path.resolve(__dirname, "../../json_files/pokemonTestListe.json"), JSON.stringify(pokemons));
    console.log("terminé !");
}

function parseCapacite(capacite) {
    return {
        "index": capacite.index,
        "name": capacite.name,
        "type": capacite.type,
        "category": capacite.category,
        "pp": capacite.pp,
        "puissance": capacite.puissance,
        "precision": capacite.precision
    }
}