const LootTable = require("loot-table");

const {EmbedBuilder} = require('discord.js');

let { addExp, getPlayerWithId, getPlayerPokemonsWithName, updateData} = require("./assets");
const { emojis } = require("./utils");

async function trainMain(message) {
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
    let pokemon;
    if (!pokemons) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Vous n'avez aucun pokémon de ce nom !");
        msgEmbed.setDescription("Vérifier qu'il n'y aucune faute de syntaxe ou que vous possédez bien ce pokémon.");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande *pokemon help*."});

        message.channel.send({embeds: [msgEmbed]});
        return;
    } else if (pokemons.length > 1) {
        pokemon = await choosePokemonTraining(pokemons, message);
    } else {
        pokemon = pokemons[0];
    }

    let trainRes = await trainPokemon(pokemon, message);

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setTitle("Résultat de votre " + trainRes["training"]);
    msgEmbed.setDescription("Votre " + pokemon["name"] + " à gagné " + trainRes["xpWin"] + " points d'xp et est monté de " + trainRes["lvlUp"] + " niveau(x) !");
    msgEmbed.setColor("#0293af");
    msgEmbed.setFooter({text:"Pour plus d'informations utiliez la commande *pokemon help*."});
    message.channel.send({embeds: [msgEmbed]});

    updateData();
}

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

function getTrainingTime(player) {
    let diff = new Date().getTime() - player["lastTraining"];

    let finalDiff = 3600000 - diff //3600000 === 1 heure

    const seconds = Math.floor(finalDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    return `${hours % 24} heure(s), ${minutes % 60} minute(s) et ${seconds % 60} seconde(s)`;
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

function choosePokemonTraining(pokemons, message) {
    return new Promise(async (resolve, reject) => {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Choisissez le pokémon à entrainer");
        msgEmbed.setDescription("Pour choisir le pokémon il suffit de réagir à l'émote attribuée au pokémon voulu");
        msgEmbed.setColor("#c0763b");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande *pokemon help*."});
        let i = 0;
        pokemons.forEach(pokemon => {
            let pokemonName = pokemon.name;
            if (pokemon.shiny) pokemonName += ":sparkles:";
            pokemonName += "(lvl: " + pokemon.level + ")";
            msgEmbed.addFields({name: pokemonName, value: emojis[i], inline: true});
            i++;
        });

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
    });
}

module.exports = {
    trainMain
}