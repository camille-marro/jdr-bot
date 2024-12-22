const { SlashCommandBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder, EmbedBuilder} = require("discord.js");

const { getPlayer, createPlayer } = require('../../assets/pokemon/handlePlayer.js');
const { explore } = require('../../assets/pokemon/explore');
const { list } = require('../../assets/pokemon/list');


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