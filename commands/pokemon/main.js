const {SlashCommandBuilder} = require("discord.js");
const {createPlayer, getPlayer} = require("../../assets/pokemon/player");
const {explore} = require("../../assets/pokemon/explore");
const {train} = require("../../assets/pokemon/train");
const {list} = require("../../assets/pokemon/list");

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
                        .setRequired(true)
                )
        )
    ,

    async execute(interaction) {
        let player = await getPlayer(interaction.user.id);

        if (player === null) player = await createPlayer(interaction.user.id);

        let option = interaction.options.getSubcommand();
        if (option === "explore") await explore(interaction, player);
        else if (option === "list") await list(interaction, player);
        else if (option === "train") await train(interaction, player);
    }
}