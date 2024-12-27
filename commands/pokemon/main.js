const { SlashCommandBuilder } = require("discord.js");

const { getPlayer, createPlayer } = require('../../assets/pokemon/handlePlayer.js');
const { explore } = require('../../assets/pokemon/explore');
const { list } = require('../../assets/pokemon/list');
const { train } = require('../../assets/pokemon/train');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pokemon")
        .setDescription("Jeu pokémon")
        .addSubcommand(subCommand =>
            subCommand
                .setName("explore")
                .setDescription("Explorer les hautes herbes pour attraper un pokémon")
        )
        .addSubcommand(subCommand =>
            subCommand
                .setName("list")
                .setDescription("Afficher la liste de ses pokémons")
        )
        .addSubcommand(subCommand =>
            subCommand
                .setName("train")
                .setDescription("Entraîner un pokémon")
                .addStringOption(option =>
                    option
                        .setName("pokemon")
                        .setDescription("Pokémon à entraîner")
                )
        )

    ,

    async execute(interaction) {
        let player = await getPlayer(interaction.user.id);

        if (!player) {
            await createPlayer(interaction.user.id);
        }

        let option = interaction.options.getSubcommand();
        if (option === "explore") await explore(interaction, player);
        else if (option === "list") await list(interaction, player);
        else if (option === "train") await train(interaction, player)
    }
}