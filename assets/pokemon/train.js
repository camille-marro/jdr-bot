const {PokemonGenerated, PokemonPlayers} = require("../db");
const {choosePokemon, checkTraining, getTrainingTime} = require("./handlePlayer");
const {addXp, checkLearning, learnCapacity} = require("./handlePokemon");
const {EmbedBuilder} = require("discord.js");

async function train(interaction, player) {
    if (!checkTraining(player)) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Vous n'avez plus d'entrainements disponible !");
        msgEmbed.setColor("Red");
        msgEmbed.setDescription("Prochain entraînement dans : " + getTrainingTime(player) + ".");

        interaction.reply({
            content: "",
            components: [],
            embeds: [msgEmbed],
        });

        return;
    } else player["trainingLeft"]--;

    let reply = false;
    let pokemonName  = interaction.options.getString('pokemon');
    pokemonName = pokemonName.charAt(0).toUpperCase() + pokemonName.substring(1).toLowerCase();

    let playerPokemons = await PokemonGenerated.findAll({
        where: {
            IDPlayer: player.ID,
            name: pokemonName
        }
    });

    let pokemon;

    if (playerPokemons.length > 1) {
        let pokemons = [];
        for (let pokemon of playerPokemons) {
            pokemons.push(pokemon["dataValues"]);
        }
        reply = true;
        pokemon = await choosePokemon(player, pokemons, interaction);
    } else if (playerPokemons.length === 0) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Vous n'avez aucun pokémon appelé : " + pokemonName + " !");
        msgEmbed.setColor("Red");

        interaction.reply({
            content: "",
            components: [],
            embeds: [msgEmbed],
        });

        return;
    } else {
        pokemon = playerPokemons[0]["dataValues"];
    }

    let randInt = Math.floor(Math.random() * 9) + 1;
    randInt -= 5;

    let enemyPokemonLvl = pokemon['level'] + randInt;
    if (enemyPokemonLvl <= 0) enemyPokemonLvl = 1;

    let xpTable = [1, 1, 1, 1, 2, 2, 2, 3, 3, 4];
    let xpMultiplier = xpTable[Math.floor(Math.random() * xpTable.length)];

    let xpWin = enemyPokemonLvl * xpMultiplier * 2;
    let levelUp = await addXp(pokemon, xpWin);

    for (let i = 0; i < levelUp; i++) {
        let newCapacities = await checkLearning(interaction, pokemon);
        if (newCapacities.length >= 1) {
            for (let capacity of newCapacities) {
                let result = await learnCapacity(interaction, pokemon, capacity, reply);

                if (result[0]) reply = true;
                let msgEmbed = result[1];
                if (reply) {
                    interaction.editReply({
                        content: "",
                        components: [],
                        embeds: [msgEmbed],
                    });
                } else {
                    interaction.reply({
                        content: "",
                        components: [],
                        embeds: [msgEmbed],
                    });
                }
            }
        }
    }

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setTitle("Votre " + pokemon["name"] + " a gagné " + levelUp + " niveau(x) et " + xpWin + " points d'expérience !");
    msgEmbed.setColor("Yellow");

    if (reply) {
        interaction.followUp({
            content: "",
            components: [],
            embeds: [msgEmbed],
        });
    } else {
        interaction.reply({
            content: "",
            components: [],
            embeds: [msgEmbed],
        });
    }

    PokemonPlayers.update(
        {
            trainingLeft: player["trainingLeft"],
            lastTraining: new Date().getTime(),
        },
        {
            where: {
                ID: player["ID"],
            }
        }
    )
}

module.exports = {
    train
}