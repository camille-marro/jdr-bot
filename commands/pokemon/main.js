const { SlashCommandBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder, EmbedBuilder} = require("discord.js");

const { getPlayer, createPlayer, setTimeExplore, getPokemons } = require('../../assets/pokemon/checkPlayer.js');
const { catchPokemon } = require('../../assets/pokemon/addPokemon.js');
const { exploreGrass } = require('../../assets/pokemon/explore');
const { getPlayerPokemons } = require('../../assets/pokemon/list');

async function explore(interaction, player)  {
    let res = await exploreGrass(player);
    if (res[0]) {
        let row = new ActionRowBuilder();

        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Vous avez croisé 3 pokémons dans les hautes herbes !");
        msgEmbed.setColor("Aqua");

        for (let i = 0; i < res[1].length; i++) {
            let pokemon = res[1][i]["pokemon"];
            let types = res[1][i]["types"];

            let typeStr = "";
            for (let type of types) {
                typeStr += type["name"][0].toUpperCase() + type["name"].substring(1);
                typeStr += " - ";
            }
            typeStr = typeStr.substring(0, typeStr.length - 2);

            let button = new ButtonBuilder()
                .setCustomId("pokemon" + i)
                .setLabel("Attraper " + pokemon["name"] + " !")
                .setStyle(ButtonStyle.Secondary);

            row.addComponents(button);
            msgEmbed.addFields({name: pokemon["name"], value: typeStr, inline: true});
        }

        let response = await interaction.reply({
            content: '',
            components: [row],
            embeds: [msgEmbed]
        });

        const collectorFilter = i => i.user.id === interaction.user.id;

        try {
            const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

            for (let i = 0; i < res[1].length; i++) {
                if (confirmation.customId === ('pokemon' + i)) {
                    let msgEmbed = new EmbedBuilder();
                    msgEmbed.setTitle("Bravo vous avez attrapé un : " + res[1][i]['pokemon']["name"] + " !");
                    msgEmbed.setColor("Green");

                    await catchPokemon(player, res[1][i]['pokemon'], res[1][i]['types']);
                    await setTimeExplore(player);

                    await interaction.editReply({
                        content: '',
                        components: [],
                        embeds: [msgEmbed]
                    });

                    // @TODO : choix des compétences pour le nouveau pokémon si y'a plus de 4 compétences au niv 1
                }
            }
        } catch (e) {
            await interaction.editReply({
                content: 'Aucune confirmation après 1 minute, annulation de la commande.',
                components: [],
                embeds: []
            });

            console.error(e);
        }
    } else {
        interaction.reply({embeds: [res[1]]});
    }
}

async function list(interaction, player)  {
    let pokemons = await getPlayerPokemons(player);
    let finalStr = "";

    for (let pokemon of pokemons) {
        if (pokemon["shiny"]) finalStr += ":sparkles: ";
        finalStr += pokemon["name"] + " (" + pokemon["sex"] + ") - niv : " + pokemon["level"]
        finalStr += "\n";
    }

    interaction.reply({
        content: finalStr,
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pokemon")
        .setDescription("Jeu pokémon")
        .addStringOption(option =>
            option
                .setName("option")
                .setDescription("Commande du jeu à faire. Voici la liste : explore, list")
                .setRequired(true)
        )
    ,

    async execute(interaction) {
        let player = await getPlayer(interaction.user.id);

        if (!player) {
            await createPlayer(interaction.user.id);
        }

        let option = interaction.options.getString('option');
        if (option === "explore") await explore(interaction, player);
        else if (option === "list") await list(interaction, player);
    }
}