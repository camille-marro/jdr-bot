const {EmbedBuilder} = require('discord.js');

let { getPlayerWithId, createPlayer, drawPokemonWithId, catchPokemon, drawPokemon } = require("./assets");
const { emojis } = require('./utils');

/**
 * Créer un objet player pour un nouveau joueur et permet de sélectionner son premier pokémon
 * @param {Object}message
 * @returns {Promise<void>}
 */
async function playerStart(message) {
    let msgEmbed = new EmbedBuilder();
    let player = getPlayerWithId(message.author.id);
    if (player) {
        msgEmbed.setTitle("Erreur : vous avez déjà un compte créé !");
        msgEmbed.setDescription("Pour jouer utilisez la commande *pokemon explore*");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

        message.channel.send({embeds: [msgEmbed]});
        return;
    }

    player = createPlayer(message.author);

    msgEmbed.setTitle("Bienvenue dans le monde merveilleux de Pokémon !");
    msgEmbed.setDescription("Pour commencer à jouer vous devez choisir votre starter, pour cela vous avez le choix entre un starter aléatoire parmi tous les pokémons ou alors le choix d'un starter normal.");
    msgEmbed.addFields({name: "Choisir son starter", value: ":one:", inline: true});
    msgEmbed.addFields({name: "Avoir un pokémon aléatoire", value: ":two:", inline: true});
    msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

    let msgSent = await message.channel.send({embeds: [msgEmbed]});

    await msgSent.react(emojis[0]);
    await msgSent.react(emojis[1]);

    const filter = (reaction, user) => {
        return emojis.includes(reaction.emoji.name) && !user.bot;
    };

    let collector = msgSent.createReactionCollector(filter, {time: 15000});

    collector.on('collect', async (reaction, user) => {
        if (user.id === message.author.id) {
            if (reaction.emoji.name === '1️⃣') {

                let msgChooseStarter = new EmbedBuilder();
                msgChooseStarter.setColor("#0293af");
                msgChooseStarter.setTitle("Veuillez choisir votre starter dans la liste ci-dessous :");
                msgChooseStarter.addFields({name: "Bulbizarre", value: ":one:", inline: true});
                msgChooseStarter.addFields({name: "Salamèche", value: ":two:", inline: true});
                msgChooseStarter.addFields({name: "Carapuce", value: ":three:", inline: true});
                msgChooseStarter.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                let msgSent1 = await message.channel.send({embeds: [msgChooseStarter]});

                await msgSent1.react('1️⃣');
                await msgSent1.react('2️⃣');
                await msgSent1.react('3️⃣');

                let collector1 = msgSent1.createReactionCollector(filter, {time: 15000});
                collector1.on('collect', (reaction, user) => {
                    if (user.id === message.author.id) {
                        let starter;
                        if (reaction.emoji.name === '1️⃣') {
                            // bulbizarre
                            starter = drawPokemonWithId(1);
                            catchPokemon(starter, player["discordId"]);
                            collector1.stop();
                        } else if (reaction.emoji.name === '2️⃣') {
                            // salamèche
                            starter = drawPokemonWithId(4);
                            catchPokemon(starter, player["discordId"]);
                            collector1.stop();
                        } else if (reaction.emoji.name === '3️⃣') {
                            // carapuce
                            starter = drawPokemonWithId(7);
                            catchPokemon(starter, player["discordId"]);
                            collector1.stop();
                        }
                        let msgEmbed = new EmbedBuilder();
                        msgEmbed.setTitle("Bravo vous venez d'avoir votre premier pokémon : " + starter["name"] + " !");
                        msgEmbed.setDescription("Pour commencer à jouer utilisez la commande *pokemon explore*.");
                        msgEmbed.setColor("#fff300");
                        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                        message.channel.send({embeds: [msgEmbed]});
                        collector1.stop();
                    } else if (!user.bot) {
                        let msgEmbed = new EmbedBuilder();
                        msgEmbed.setTitle("Vous ne pouvez pas réagir aux messages des autres !");
                        msgEmbed.setDescription("<@" + user.id + "> fait plus ça c'est pas bien !");
                        msgEmbed.setColor("#ff0000");
                        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                        message.channel.send({embeds: [msgEmbed]});
                    }
                });


                collector.stop();
            } else if (reaction.emoji.name === '2️⃣') {
                let pokemon = drawPokemon();
                catchPokemon(pokemon, player["discordId"]);

                let msgEmbed = new EmbedBuilder();
                msgEmbed.setTitle("Bravo vous venez d'avoir votre premier pokémon : " + pokemon["name"] + " !");
                msgEmbed.setDescription("Pour commencer à jouer utilisez la commande *pokemon explore*.");
                msgEmbed.setColor("#fff300");
                msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                message.channel.send({embeds: [msgEmbed]});
                collector.stop();
            }
        } else if (!user.bot) {
            let msgEmbed = new EmbedBuilder();
            msgEmbed.setTitle("Vous ne pouvez pas réagir aux messages des autres !");
            msgEmbed.setDescription("<@" + user.id + "> fait plus ça c'est pas bien !");
            msgEmbed.setColor("#ff0000");
            msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

            message.channel.send({embeds: [msgEmbed]});
        }
    });
}

module.exports = {
    playerStart
}