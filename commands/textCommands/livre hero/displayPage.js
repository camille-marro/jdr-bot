let fs = require('fs');
const path = require("path");

const { EmbedBuilder } = require('discord.js');

const log = require('../../../assets/log');

const footer = "Pour plus d'informations utiliser la commande \"help av\"";

/**
 * Actualise data pour sauvegarder les changements
 */
function updateData(players) {
    fs.writeFileSync(path.resolve(__dirname, "../../../json_files/livre hero/players.json"), JSON.stringify(players));
    console.log("|-- data successfully updated");
    log.print("data has been successfully updated", 1);
}

async function displayPage(player, message, players) {
    if (player === null || !player.hasOwnProperty("personnage")) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Aucun personnage trouvé pour vous !");
        msgEmbed.setDescription("Pour créer un personnage utiliser la commande \"av start\"");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: footer});

        message.channel.send({embeds: [msgEmbed]});
        return;
    }

    let page;
    try {
        console.log("|-- Loading data from players.json ...");
        const rawData = fs.readFileSync(path.resolve(__dirname, "../../../json_files/livre hero/chapitre_" + player["chapter"] + "/page_" + player["page"] + ".json"));
        page = JSON.parse(rawData);
    } catch (err) {
        console.log("|-- no file named " + "../../../json_files/livre hero/chapitre_" + player["chapter"] + "/page_" + player["page"] + ".json");
        page = false;
    }

    message.channel.send(page["text"]);

    if (page["dice_roll"]) {
        let msgEmbed = new EmbedBuilder()
        msgEmbed.setTitle("TEST DE COMPÉTENCE DE " + page["dice_roll"]["comp_name"].toUpperCase());
        msgEmbed.setDescription("Vous devez faire un test de compétence de " + page["dice_roll"]["comp_name"] + "\n" +
            "Votre compétence de " + page["dice_roll"]["comp_name"] + " est de : " + player["personnage"]["stats"][page["dice_roll"]["comp"]] + ".\n" +
            "Pour ce test vous avez un bonus/malus de : " + page["dice_roll"]["bonus"] + ".\n\n" +
            "Réagissez à ce message avec : \n:one: : si le test est réussi\n:two: : si le test est manqué"
        );
        msgEmbed.setColor("#2fd7b4");

        roll_dice(msgEmbed, page, player, message).then(() => {
            updateData(players);
            wantNextPage(message, player, players).then();
        });
    } else if (page["choice"]) {
        takeDecision(page, player, message).then(() => {
            updateData(players);
            wantNextPage(message, player, players).then();
        });
    } else if (page["nextPage"]) {
        player["page"] = page["nextPage"];
        updateData(players);
        wantNextPage(message, player, players).then();
    } else if (page["death"]) {
        player["dead"] = true;
        updateData(players);
        let msgEmbed = new EmbedBuilder()
        msgEmbed.setTitle("Vous êtes mort !");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setDescription("Vous pouvez recommencer l'histoire en faisant la commande \"av reset\"");

        message.channel.send({embeds: [msgEmbed]});
    } else if (page["end"]) {
        player["page"] = 1;
        player["chapter"] += 1;
        updateData(players);

        let msgEmbed = new EmbedBuilder()
        msgEmbed.setTitle("Fin du chapitre " + (player["chapter"]-1));
        msgEmbed.setColor("#ffffff");
        msgEmbed.setDescription("Pour continuer l'aventure utilisez la commande \"av continue\"\n **ATTENTION LE CHAPITRE 2 N'EST PAS ENCORE FAIT CA CASSE LE BOT SI VOUS VOULEZ LE FAIRE**");

        message.channel.send({embeds: [msgEmbed]});
    }
}

async function takeDecision(page, player, message) {
    return new Promise(async (resolve, reject) => {
        let emojis = [
            "1️⃣",
            "2️⃣",
            "3️⃣",
            "4️⃣",
            "5️⃣",
            "6️⃣",
            "7️⃣"
        ];

        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Quel choix faites-vous ?");
        msgEmbed.setColor("#2fd7b4");

        let msgSent = await message.channel.send({embeds: [msgEmbed]});

        for (let i = 0; i < page["choice"].length; i++) {
            await msgSent.react(emojis[i]);
        }

        const filter = (reaction, user) => {
            return emojis.includes(reaction.emoji.name) && !user.bot;
        };

        let collector = msgSent.createReactionCollector(filter, {time: 15000});

        collector.on('collect', (reaction, user) => {
            if (user.id === message.author.id) {
                let i = 0;
                while (i < page["choice"].length) {
                    if (reaction.emoji.name === emojis[i]) {
                        collector.stop();
                        player["page"] = page["choice"][i];
                        resolve();
                    }
                    i++;
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
    });
}

async function wantNextPage(message, player, players) {
    return new Promise(async (resolve, reject) => {
        let emojis = [
            '👍',
            '👎'
        ];

        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Voulez-vous continuer ?");
        msgEmbed.setColor("#2fd7b4");

        let msgSent = await message.channel.send({embeds: [msgEmbed]});

        for (let i = 0; i < emojis.length; i++) {
            await msgSent.react(emojis[i]);
        }

        const filter = (reaction, user) => {
            return emojis.includes(reaction.emoji.name) && !user.bot;
        };

        let collector = msgSent.createReactionCollector(filter, {time: 15000});

        collector.on('collect', (reaction, user) => {
            if (user.id === message.author.id) {
                collector.stop();
                if (reaction.emoji.name === emojis[0]) {
                    displayPage(player, message, players);
                    resolve();
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
    });
}

async function roll_dice(msgEmbed, page, player, message) {
    return new Promise(async (resolve, reject) => {
        let emojis = [
            "1️⃣",
            "2️⃣"
        ];

        let msgSent = await message.channel.send({embeds: [msgEmbed]});

        for (let i = 0; i < emojis.length; i++) {
            await msgSent.react(emojis[i]);
        }

        const filter = (reaction, user) => {
            return emojis.includes(reaction.emoji.name) && !user.bot;
        };

        let collector = msgSent.createReactionCollector(filter, {time: 15000});

        collector.on('collect', (reaction, user) => {
            if (user.id === message.author.id) {
                collector.stop();
                if (reaction.emoji.name === emojis[0]) {
                    player["page"] = page["dice_roll"]["ok"];
                    resolve();
                }
                else if (reaction.emoji.name === emojis[1]) {
                    player["page"] = page["dice_roll"]["miss"];
                    resolve();
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
    })
}

module.exports = {
    displayPage
}