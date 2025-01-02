const { PokemonPlayers, PokemonGenerated } = require('../db.js');
const {StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType} = require("discord.js");

async function getPlayer(id) {
    let player = await PokemonPlayers.findAll({
        where: {
            IDDiscord: id,
        }
    });

    if (player.length === 0) return false;
    else return player[0]["dataValues"];
}

async function createPlayer(id) {
    await PokemonPlayers.create({
        IDDiscord: id,
        lastExplore: 0,
        lastTraining: 0,
        trainingLeft: 0
    });
}

async function setTimeExplore(player) {
    let timeStamp = new Date().getTime();
    // timeStamp += 3600000; // 3600000 = 1 heure // à mettre que pour le local

    await PokemonPlayers.update(
        { lastExplore: timeStamp},
        {
            where: {
                ID: player["ID"],
            }
        }
    );
}

async function getPlayerPokemons(player) {
    let rawPokemons = await PokemonGenerated.findAll({
        where: {
            IDPlayer: player["ID"]
        },
        order: ['name', 'level']
    });

    let pokemons = [];
    for (let pokemon of rawPokemons) {
        pokemons.push(pokemon["dataValues"]);
    }

    return pokemons;
}

async function choosePokemon(player, pokemons, interaction) {

    const select = new StringSelectMenuBuilder()
        .setCustomId("choosePokemon")
        .setPlaceholder("Choisir le pokémon");

    for (let pokemon of pokemons) {
        let option = new StringSelectMenuOptionBuilder()
            .setDescription("Niveau : " + pokemon["level"])
            .setValue(pokemon["ID"].toString())
            .setLabel(pokemon["name"] + " (" + pokemon["sex"] + ")")

        if (pokemon["shiny"]) option.setEmoji("✨")

        select.addOptions(option);
    }

    const row = new ActionRowBuilder()
        .addComponents(select);

    let response = await interaction.reply({
        components: [row],
    });

    return new Promise((resolve, reject) => {
        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 3_600_000
        });

        collector.on('collect', async i => {
            if (i.user.id === player.IDDiscord) {
                // resolve(i.values[0]); // Résout avec l'ID du pokémon sélectionné

                let rawPokemon = await PokemonGenerated.findOne({
                    where: {
                        ID: i.values[0]
                    }
                });

                resolve(rawPokemon["dataValues"]);

                collector.stop();
            } else {
                await i.reply({ content: "Ce menu ne vous appartient pas.", ephemeral: true });
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason !== 'user') {
                reject(new Error("Le temps pour choisir un Pokémon est écoulé."));
            }
        });
    });
}

function checkTraining(player) {
    if ((new Date().getTime() - player["lastTraining"]) / (1000 * 60 * 60) >= 1) {
        player["trainingLeft"] = 5;
        return true;
    } else return player["trainingLeft"] > 0;
}

function getTrainingTime(player) {
    let diff = new Date().getTime() - player["lastTraining"];

    let finalDiff = 3600000 - diff //3600000 === 1 heure

    const seconds = Math.floor(finalDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    return `${hours % 24} heure(s), ${minutes % 60} minute(s) et ${seconds % 60} seconde(s)`;
}

module.exports = {
    getPlayer, createPlayer, setTimeExplore, getPlayerPokemons, choosePokemon, checkTraining, getTrainingTime
}