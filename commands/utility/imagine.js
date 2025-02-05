const { SlashCommandBuilder } = require('discord.js');
const { startSession, addAction, stopSession, systemContent } = require('../../assets/jdr');
const {JDRSession} = require('../../assets/db');

const {OpenAI} = require('openai');
const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('imagine')
        .setDescription('Interagit avec le jeu de rôle textuel')
        .addSubcommand(subcommand =>
            subcommand.setName('start')
                .setDescription('Démarrer une session JDR')
                .addStringOption(option =>
                    option.setName('univers')
                        .setDescription('Univers du jeu')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('cadre')
                        .setDescription('Cadre de l\'histoire')
        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('action')
                .setDescription('Effectuer une action dans le JDR')
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Décrivez votre action')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('stop')
                .setDescription('Terminer la session JDR'))
        .addSubcommand(subcommand =>
            subcommand.setName('continue')
                .setDescription('Faire avancer l\'histoire sans action spécifique'))
        .addSubcommand(subcommand =>
            subcommand.setName('resume')
                .setDescription('Obtenir un résumé de votre aventure'))
        .addSubcommand(subcommand =>
            subcommand.setName('list')
                .setDescription('Liste toutes les histoires que vous avez créé'))
        .addSubcommand(subcommand =>
            subcommand.setName('print')
                .setDescription('Affiche une histoire terminée')
                .addStringOption(option =>
                    option.setName('title')
                        .setDescription('Titre de l\'histoire à afficher')
                        .setRequired(true))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        if (subcommand === 'start') {
            const univers = interaction.options.getString('univers');
            const cadre = interaction.options.getString('cadre');
            try {
                let session = await startSession(userId, univers, cadre);
                await interaction.reply(`Session JDR commencée dans l'univers **${univers}** avec le cadre **${cadre}**.\n\n*Patientez un peu votre histoire arrive !*`);
                let response = await openai.chat.completions.create({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: systemContent },
                        { role: 'user', content: "Créé moi une histoire dans un univers" + univers + ". Le cadre de début est celui ci : " + cadre }
                    ]
                });

                let title = await openai.chat.completions.create({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: "Tu es un journaliste expert en analyse de nouvelles littéraires.\nTu vas créer un titre pour la nouvelle qui t'être donné. Le titre doit tenir en moins de 255 caractères. N'affiche pas le titre entre \"" },
                        { role: 'user', content: 'Cadre : ' + cadre + "\nUnivers : " + univers + "\n Début de la nouvelle : " + response.choices[0].message}
                    ]
                });

                await interaction.followUp("**" + title.choices[0].message.content + " :**\n" + response.choices[0].message.content );

                session.title = title.choices[0].message.content;
                session.history = "Narrateur : " + response.choices[0].message.content;
                await session.save();
            } catch (error) {
                if (interaction.replied) await interaction.followUp(error.message);
                else await interaction.reply(error.message);
            }
        }
        else if (subcommand === 'action') {
            await interaction.deferReply();
            const action = interaction.options.getString('description');
            try {
                const session = await JDRSession.findOne({ where: { IDUser: userId, status: 'active' } });
                if (!session) return interaction.editReply("Vous n'avez pas de session active.");

                const result = await addAction(session.ID, action);
                await interaction.editReply(result);
            } catch (error) {
                if (interaction.replied) await interaction.followUp(error.message);
                else await interaction.editReply(error.message);
            }
        }
        else if (subcommand === 'stop') {
            try {
                const session = await JDRSession.findOne({ where: { IDUser: userId, status: 'active' } });
                if (!session) return interaction.reply("Vous n'avez pas de session active.");

                await stopSession(session.ID);
                await interaction.reply("Votre session JDR est terminée.");
            } catch (error) {
                if (interaction.replied) await interaction.followUp(error.message);
                else await interaction.reply(error.message);
            }
        }
        else if (subcommand === 'continue') {
            await interaction.deferReply();
            try {
                const session = await JDRSession.findOne({ where: { IDUser: userId, status: 'active' } });
                if (!session) return interaction.editReply("Vous n'avez pas de session active.");

                const prompt = session.history + "\nNarrateur: ";
                const response = await openai.chat.completions.create({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {role: 'system', content: systemContent},
                        {role: 'user', content: prompt }
                    ]
                });

                session.history += '\nNarrateur: ' + response.choices[0].message.content;
                await session.save();
                await interaction.editReply(response.choices[0].message.content);
            } catch (error) {
                if (interaction.replied) await interaction.followUp(error.message);
                else await interaction.editReply(error.message);
            }
        }
        else if (subcommand === 'resume') {
            await interaction.deferReply();
            try {
                const session = await JDRSession.findOne({ where: { IDUser: userId, status: 'active' } });
                if (!session) return interaction.editReply("Vous n'avez pas de session active.");

                const summaryPrompt = "Résume les moments clés de cette histoire : " + session.history;
                const response = await openai.chat.completions.create({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: "Tu es un expert de l'analyse d'histoire et de la recherche des moments importants d'une intrigue." },
                        { role: 'user', content: summaryPrompt },
                    ]
                });

                await interaction.editReply("Résumé de votre aventure : " + response.choices[0].message.content);
            } catch (error) {
                if (interaction.replied) await interaction.followUp(error.message);
                else await interaction.editReply(error.message);
            }
        }
        else if (subcommand === 'list') {
            await interaction.deferReply();
            try {
                let sessions = await JDRSession.findAll({where: { IDUser: userId} });
                if (!sessions) return interaction.editReply("Vous n'avez aucune histoire. Pour créer une histoire utilisez la commande */imagine start*");

                let finalStr = "Voici toutes vos histoires : \n";
                for (let session of sessions) {
                    let str = session.title + " (" + session.status + ")";
                    finalStr += str + "\n";
                }

                interaction.editReply(finalStr);
            } catch (error) {
                if (interaction.replied) await interaction.followUp(error.message);
                else await interaction.editReply(error.message);
            }
        }
        else if (subcommand === 'print') {
            await interaction.deferReply();
            const title = interaction.options.getString('title');
            try {
                let session = await JDRSession.findOne({where: { IDUser: userId, status: 'terminee', title: title}});
                let i = 0;
                let str = "";
                while (i < session.history.length) {
                    str += session.history[i];
                    if (i % 1950 === 0 && i > 0) {
                        if (i > 1950) interaction.followUp(str);
                        else interaction.editReply(str);
                        str = "";
                    }
                    i++;
                }
                if (i > 1950) interaction.followUp(str);
                else interaction.editReply(str);
            } catch (error) {
                if (interaction.replied) await interaction.followUp(error.message);
                else await interaction.editReply(error.message);
            }
        }
    }
}
