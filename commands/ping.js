const { SlashCommandBuilder } = require('discord.js');

const command = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Pong!');

async function execute(interaction) {
    await interaction.reply(interaction);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),

    async execute(interaction) {
        await interaction.reply('Pong!');
    },
};