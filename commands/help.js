const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

function start(command) {
    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#6e0e91");

    if (command === "roll") {
        msgEmbed.setTitle("Help - roll");
        msgEmbed.setDescription("Lancer des dés de plusieurs faces");
        msgEmbed.addFields({name: "Syntaxe de la commande", value: "roll [nb_lancers]d[nb_faces]"});
        msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
        msgEmbed.addFields({name: "nb_lancers", value: "Nombre de lancé à faire", inline: true});
        msgEmbed.addFields({name: "nb_faces", value: "Nombre de faces du dé", inline: true});
        msgEmbed.addFields({name: "Exemple de commande", value: "roll 3d6"});
        msgEmbed.setFooter({text : "Pour plus d'informations utiliser la commande \"roll help\""});
    } else if (command === "ping") {
        msgEmbed.setTitle("Help - ping");
        msgEmbed.setDescription("Tester si le bot répond");
        msgEmbed.addFields({name: "Syntaxe de la commande", value: "ping"});
        msgEmbed.addFields({name: "Exemple de commande", value: "ping"});
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"ping help\""});
    } else {
        msgEmbed.addFields({name: "roll [nb_lancers]d[nb_faces]", value: "Lancer des dés de plusieurs faces"});
        msgEmbed.addFields({name: "config [param] [valeur]", value: "Mettre à jour la configuration du bot"});
        msgEmbed.addFields({name: "ub [options:optionnel]", value: "Lancer une partie d'Ultimate Bravery"});
        msgEmbed.addFields({name: "play [lien/mots clés]", value: "Lire un son à partir d'un lien ou d'une recherche sur Youtube"});
        msgEmbed.addFields({name: "pause", value: "Mettre en pause la lecture"});
        msgEmbed.addFields({name: "resume", value: "Reprendre la lecture"});
        msgEmbed.addFields({name: "stop", value: "Arrêter la lecture"});
        msgEmbed.addFields({name: "skip [indice:optionnel]", value: "Passer la lecture d'un son ou passer à un son spécifique de la queue"});
        msgEmbed.addFields({name: "loop", value: "Activer ou désactiver la lecture en boucle de la queue"});
        msgEmbed.addFields({name: "queue", value: "Afficher la queue"});
        msgEmbed.addFields({name: "ping", value: "pong"});
        msgEmbed.addFields({name: "film", value: "Propose un film aléatoire parmis le TOP 3 de chaque utilisateurs"});
        msgEmbed.addFields({name: "meme", value: "Montre un meme stocké par les utilisateurs"});
        msgEmbed.addFields({name: "rank", value: "Affiche le rang lol d'un joueur en fonction de son pseudo sur le jeu"});
        msgEmbed.addFields({name: "help [commande:optionnel]", value: "Afficher ce texte"});
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"help [commande]\""});
    }

    return msgEmbed;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Affiche la liste des commandes et leurs utilités")
        .addStringOption(option =>
            option
                .setName('command')
                .setDescription('Nom de la commande pour laquelle il faut afficher l\'aide')
                .setRequired(false)
        )
    ,

    async execute(interaction) {
        const command = interaction.options.getString('command');

        let msgEmbed = start(command);

        await interaction.reply({embeds: [msgEmbed]});
    }
}