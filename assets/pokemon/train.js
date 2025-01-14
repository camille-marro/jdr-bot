const {EmbedBuilder} = require("discord.js");
const {PokemonGenerated} = require("../db");
const {choosePokemon, addXp, getNewComp, chooseNewComp} = require("./pokemon");

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
    }

    let pokemonName = interaction.options.getString('pokemon');
    pokemonName = pokemonName.charAt(0).toUpperCase() + pokemonName.substring(1).toLowerCase();

    let playerPokemons = await PokemonGenerated.findAll({
        where: {
            IDPlayer: player.ID,
            name: pokemonName
        },
        order: [
            ['level', 'DESC']
        ]
    });

    let pokemon;
    if (playerPokemons.length > 1) {
        pokemon = await choosePokemon(interaction, playerPokemons);
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
        pokemon = playerPokemons[0];
    }

    player.lastTraining = new Date().getTime();
    player.trainingLeft--
    player.save();

    let randInt = Math.floor(Math.random() * 9) + 1;
    randInt -= 5;

    let enemyPokemonLvl = pokemon.level + randInt;
    if (enemyPokemonLvl <= 0) enemyPokemonLvl = 1;

    let xpTable = [1, 1, 1, 1, 2, 2, 2, 3, 3, 4];
    let xpMultiplier = xpTable[Math.floor(Math.random() * xpTable.length)];

    let xpWin = enemyPokemonLvl * xpMultiplier * 2;
    let levelUp = addXp(pokemon, xpWin);

    let finalLevel = pokemon.level;

    for (let i = 0; i < levelUp; i++) {
        pokemon.level = finalLevel - levelUp + i + 1;
        let newComps = await getNewComp(pokemon);

        if (newComps.length >= 1) {
            for (let comp of newComps) {
                let learned = false;
                if (pokemon.IDComp1 === null) {
                    pokemon.IDComp1 = comp.capacityID;
                    learned = true;
                }
                else if (pokemon.IDComp2 === null) {
                    pokemon.IDComp2 = comp.capacityID;
                    learned = true;
                }
                else if (pokemon.IDComp3 === null) {
                    pokemon.IDComp3 = comp.capacityID;
                    learned = true;
                }
                else if (pokemon.IDComp4 === null) {
                    pokemon.IDComp4 = comp.capacityID;
                    learned = true;
                }

                if (learned) {
                    let msgEmbed = new EmbedBuilder();
                    msgEmbed.setTitle("Votre " + pokemon.name + " a appris une nouvelle compétence !");
                    msgEmbed.setColor("Red");
                    msgEmbed.setDescription("**" + comp.name + " (" + comp.type + ")**\n" +
                        "Attaque " + comp.category + " avec une puissance de " + comp.power + " et une précision de " + comp.preci + "."
                    );
                    if (interaction.replied) {
                        await interaction.followUp({
                            content: "",
                            components: [],
                            embeds: [msgEmbed],
                        });
                    } else {
                        await interaction.reply({
                            content: "",
                            components: [],
                            embeds: [msgEmbed],
                        });
                    }

                } else await chooseNewComp(interaction, pokemon, comp);
            }
        }
    }

    pokemon.level = finalLevel;
    pokemon.save();

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setTitle("Votre " + pokemon["name"] + " a gagné " + levelUp + " niveau(x) et " + xpWin + " points d'expérience !");
    msgEmbed.setColor("Yellow");

    if (interaction.replied) {
        await interaction.followUp({
            content: "",
            components: [],
            embeds: [msgEmbed],
        });
    } else {
        await interaction.reply({
            content: "",
            components: [],
            embeds: [msgEmbed],
        });
    }
}

function checkTraining(player) {
    if ((new Date().getTime() - player.trainingLeft) / (1000 * 60 * 60) >= 1) {
        player.trainingLeft = 5;
        return true;
    } else return player.trainingLeft > 0;
}

function getTrainingTime(player) {
    let diff = new Date().getTime() - player.trainingLeft;

    let finalDiff = 3600000 - diff //3600000 === 1 heure

    const seconds = Math.floor(finalDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    return `${hours % 24} heure(s), ${minutes % 60} minute(s) et ${seconds % 60} seconde(s)`;
}

module.exports = {
    train
}