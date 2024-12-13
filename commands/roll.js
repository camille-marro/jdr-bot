const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

function roll(nb_lance, nb_faces) {
    const format = /^[0-9]+$/gm;

    if (!format.test(nb_lance) || format.test(nb_faces)) return getMessageError();

    let sum = 0;
    let average = 0;
    let list = [];
    for (let i = 0; i < parseInt(nb_lance); i++) {
        let number = Math.floor(Math.random() * parseInt(nb_faces)) + 1;
        list.push(number);
        sum += number;
    }

    for (let i = 0; i < list.length; i++) average += list[i];
    average = average / list.length;

    return getResultMessage(sum, list, average);
}

function getResultMessage(sum, list, average) {
    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#005522");
    msgEmbed.setTitle("Résultat : " + sum.toString());
    msgEmbed.setDescription("Résumé des lancés : " + list.toString() + "\nMoyenne : " + average);
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande\"help roll\""});

    return msgEmbed;
}

function getMessageError() {
    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#ff0000");
    msgEmbed.setTitle("Erreur de syntaxe !");
    msgEmbed.setDescription("Le nombre de lancés et le nombre de dés doivent être des chiffres uniquement.");
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande\"help roll\""});

    return msgEmbed;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Lance un ou plusieurs dés')
        .addStringOption(option =>
            option
                .setName('nb_lance')
                .setDescription('Nombre de lancés à faire.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('nb_faces')
                .setDescription('Nombre de faces du dé ou des dés.')
                .setRequired(true)
        )
    ,

    async execute(interaction) {
        const nb_lance = interaction.options.getString('nb_lance');
        const nb_faces = interaction.options.getString('nb_faces');

        let msgEmbed = roll(nb_lance, nb_faces);

        await interaction.reply({embeds: [msgEmbed]});

    }
}