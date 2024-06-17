let fs = require('fs');
const path = require("path");

const log = require('../../../assets/log');

const { EmbedBuilder } = require('discord.js');

const footer = "Pour plus d'informations utiliser la commande \"help av\"";

/**
 * Actualise data pour sauvegarder les changements
 */
function updateData(players) {
    fs.writeFileSync(path.resolve(__dirname, "../../../json_files/livre hero/players.json"), JSON.stringify(players));
    console.log("|-- data successfully updated");
    log.print("data has been successfully updated", 1);
}

/**
 * Permet la création d'un personnage pour commencer l'aventure
 * @param message
 * @param {Object}player - Objet de data relié au joueur
 * @param {Object[]}players - data
 * @returns {Promise<void>}
 */
async function startNewGame(message, player, players) {
    let args = message.content.split(" ");
    if (player == null) {
        player = createNewPlayer(message, players);
    }
    if (player.hasOwnProperty("personnage")) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Vous possédez déjà un personnage");
        msgEmbed.setDescription("Pour réinitialiser votre progression utilisez la commande \"reset\"");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: footer});

        message.channel.send({embeds: [msgEmbed]});
        return;
    }
    if (!args[2]) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Veuillez renseigner un nom pour votre personnage");
        msgEmbed.setDescription("Pour utiliser correctement la commande vous devez renseigner un nom et la méthode pour générer les stats. Voici un exemple de commande : \"start Prout random\".\nLes différents modes de génération de compétence sont les suivants : \"random\", \"select\".\nRandom vous permet de générer aléatoirement vos compétences et select vous permet de choisir parmi un panel de compétences déjà créés.");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: footer});

        message.channel.send({embeds: [msgEmbed]});
        return;
    }
    if (!args[3]) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Veuillez renseigner un mode de sélection pour les compétences");
        msgEmbed.setDescription("Pour utiliser correctement la commande vous devez renseigner un nom et la méthode pour générer les stats. Voici un exemple de commande : \"start Prout random\".\nLes différents modes de génération de compétence sont les suivants : \"random\", \"select\".\nRandom vous permet de générer aléatoirement vos compétences et select vous permet de choisir parmi un panel de compétences déjà créés.");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: footer});

        message.channel.send({embeds: [msgEmbed]});
        return;
    }

    if (args[3] === "random") {
        player["personnage"] = {
            "name": args[2],
            "stats": {
                "Int": "0",
                "For": "0",
                "Cha": "0",
                "Dex": "0",
                "CS": "0",
                "MC": "0",
                "Dis": "0",
                "Inti": "0",
                "Sur": "0",
                "Per": "0",
                "Soi": "0",
                "CAC": "0",
                "CAD": "0",
                "Ref": "0",
                "Mag": "0",
                "Tal": "0"
            },
            "talent": "",
            "money": 0
        };
        let msgEmbed = generateRandomComp(player["personnage"]);
        message.channel.send({embeds: [msgEmbed]});

        player["personnage"]["money"] = 10;
        player["dead"] = false;

        updateData(players);

        msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Personnage créé avec succès !");
        msgEmbed.setDescription("Pour commencer votre aventure utilisez la commande \"av continue\"");
        msgEmbed.setColor("#08ff00");
        msgEmbed.setFooter({text: footer});

        message.channel.send({embeds: [msgEmbed]});

        console.log("Successfully started campaign !");
        log.print("Successfully started campaign", 1);
    } else if (args[3] === "select") {
        player["personnage"] = {
            "name": args[2],
            "stats": {
                "Int": "0",
                "For": "0",
                "Cha": "0",
                "Dex": "0",
                "CS": "0",
                "MC": "0",
                "Dis": "0",
                "Inti": "0",
                "Sur": "0",
                "Per": "0",
                "Soi": "0",
                "CAC": "0",
                "CAD": "0",
                "Ref": "0",
                "Mag": "0",
                "Tal": "0"
            },
            "talent": "",
            "money": 0
        };
        chooseComp(player["personnage"], message).then((msgEmbed) => {
            message.channel.send({embeds: [msgEmbed]});

            player["personnage"]["money"] = 10;
            player["dead"] = false;

            updateData(players);

            msgEmbed = new EmbedBuilder();
            msgEmbed.setTitle("Personnage créé avec succès !");
            msgEmbed.setDescription("Pour commencer votre aventure utilisez la commande \"av continue\"");
            msgEmbed.setColor("#08ff00");
            msgEmbed.setFooter({text: footer});

            message.channel.send({embeds: [msgEmbed]});

            console.log("Successfully started campaign !");
            log.print("Successfully started campaign", 1);
        });
    } else {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Mode de sélection des compétences inconnu !");
        msgEmbed.setDescription("Pour utiliser correctement la commande vous devez renseigner un nom et la méthode pour générer les stats. Voici un exemple de commande : \"start Prout random\".\nLes différents modes de génération de compétence sont les suivants : \"random\", \"select\".\nRandom vous permet de générer aléatoirement vos compétences et select vous permet de choisir parmi un panel de compétences déjà créés.");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: footer});

        message.channel.send({embeds: [msgEmbed]});
    }
}

/**
 * Créé un nouveau joueur et l'ajoute à data
 * @param message
 * @param players
 */
function createNewPlayer(message, players) {
    let player = {
        "discordId": message.author.id.toString(),
        "chapter": 1,
        "page": 1
    }

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setTitle("Joueur créé avec succès !");
    msgEmbed.setColor("#06ff00");
    msgEmbed.setFooter({text: footer});

    message.channel.send({embeds: [msgEmbed]});

    console.log("Player successfully created");
    log.print("Player successfully created", 1);

    players.push(player);
    updateData(players);

    return player;
}

/**
 * Permet à l'utilisateur de choisir le set de compétence à utiliser
 * @param {Object}personnage - Personnage dont il faut générer les compétences
 * @param message
 * @returns {Promise<Object>} - Renvoie sous forme de Promise le message contenant toutes les informations
 */
async function chooseComp(personnage, message) {
    return new Promise(async (resolve) => {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Quel set de compétences voulez-vous utiliser ?");
        msgEmbed.setDescription(
            ":one: : Guerrier\n" +
            ":two: : Barde\n" +
            ":three: : Voleur\n" +
            ":four: : Chasseur\n" +
            ":five: : Paysan\n" +
            ":six: : Érudit\n" +
            ":seven: : Aléatoire"
        );
        msgEmbed.setColor("#0293af");

        let emojis = [
            "1️⃣",
            "2️⃣",
            "3️⃣",
            "4️⃣",
            "5️⃣",
            "6️⃣",
            "7️⃣"
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
                if (reaction.emoji.name === emojis[0]) resolve(makeWarrior(personnage));
                else if (reaction.emoji.name === emojis[1]) resolve(makeBard(personnage));
                else if (reaction.emoji.name === emojis[2]) resolve(makeThief(personnage));
                else if (reaction.emoji.name === emojis[3]) resolve(makeHunter(personnage));
                else if (reaction.emoji.name === emojis[4]) resolve(makePeasant(personnage));
                else if (reaction.emoji.name === emojis[5]) resolve(makeSavant(personnage));
                else resolve(generateRandomComp(personnage));

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

/**
 * Génère les compétences d'un guerrier
 * @param {Object}personnage - Personnage dont il faut générer les compétences
 * @returns {EmbedBuilder} - Renvoie un message contenant toutes les informations
 */
function makeWarrior(personnage) {
    personnage["stats"] = {
        "Int": "40",
        "For": "80",
        "Cha": "50",
        "Dex": "70",
        "CS": "60",
        "MC": "60",
        "Dis": "50",
        "Inti": "50",
        "Sur": "60",
        "Per": "60",
        "Soi": "50",
        "CAC": "70",
        "CAD": "30",
        "Ref": "70",
        "Mag": "0",
        "Tal": "70"
    }

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#bd48d2");
    msgEmbed.setTitle("Compétences du personnage");
    msgEmbed.setDescription("Voici les compétences de votre personnage, générées aléatoirement.")

    msgEmbed.addFields({name: "Intelligence", value: personnage["stats"]["Int"].toString(), inline: true});
    msgEmbed.addFields({name: "Force", value: personnage["stats"]["For"].toString(), inline: true});
    msgEmbed.addFields({name: "Charisme", value: personnage["stats"]["Cha"], inline: true});
    msgEmbed.addFields({name: "Dextérité", value: personnage["stats"]["Dex"], inline: true});
    msgEmbed.addFields({name: "Courir / Sauter", value: personnage["stats"]["CS"], inline: true});
    msgEmbed.addFields({name: "Mentir / Convaincre", value: personnage["stats"]["MC"], inline: true});
    msgEmbed.addFields({name: "Discrétion", value: personnage["stats"]["Dis"]});
    msgEmbed.addFields({name: "Réflexes", value: personnage["stats"]["Ref"]});
    msgEmbed.addFields({name: "Intimidation", value: personnage["stats"]["Inti"]});
    msgEmbed.addFields({name: "Survie", value: personnage["stats"]["Sur"]});
    msgEmbed.addFields({name: "Perception", value: personnage["stats"]["Per"]});
    msgEmbed.addFields({name: "Soigner", value: personnage["stats"]["Soi"]});
    msgEmbed.addFields({name: "Combat rapproché", value: personnage["stats"]["CAC"]});
    msgEmbed.addFields({name: "Combat à distance", value: personnage["stats"]["CAD"]});
    msgEmbed.addFields({name: "Talent", value: personnage["stats"]["Tal"]});
    msgEmbed.addFields({name: "Magie", value: personnage["stats"]["Mag"]});

    msgEmbed.setFooter({text: footer})

    log.print("character successfully created", 1);
    return msgEmbed;
}

/**
 * Génère les compétences d'un barde
 * @param {Object}personnage - Personnage dont il faut générer les compétences
 * @returns {EmbedBuilder} - Renvoie un message contenant toutes les informations
 */
function makeBard(personnage) {
    personnage["stats"] = {
        "Int": "70",
        "For": "40",
        "Cha": "80",
        "Dex": "60",
        "CS": "50",
        "MC": "70",
        "Dis": "60",
        "Inti": "30",
        "Sur": "60",
        "Per": "70",
        "Soi": "30",
        "CAC": "60",
        "CAD": "60",
        "Ref": "60",
        "Mag": "0",
        "Tal": "70"
    }

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#bd48d2");
    msgEmbed.setTitle("Compétences du personnage");
    msgEmbed.setDescription("Voici les compétences de votre personnage, générées aléatoirement.")

    msgEmbed.addFields({name: "Intelligence", value: personnage["stats"]["Int"].toString(), inline: true});
    msgEmbed.addFields({name: "Force", value: personnage["stats"]["For"].toString(), inline: true});
    msgEmbed.addFields({name: "Charisme", value: personnage["stats"]["Cha"], inline: true});
    msgEmbed.addFields({name: "Dextérité", value: personnage["stats"]["Dex"], inline: true});
    msgEmbed.addFields({name: "Courir / Sauter", value: personnage["stats"]["CS"], inline: true});
    msgEmbed.addFields({name: "Mentir / Convaincre", value: personnage["stats"]["MC"], inline: true});
    msgEmbed.addFields({name: "Discrétion", value: personnage["stats"]["Dis"]});
    msgEmbed.addFields({name: "Réflexes", value: personnage["stats"]["Ref"]});
    msgEmbed.addFields({name: "Intimidation", value: personnage["stats"]["Inti"]});
    msgEmbed.addFields({name: "Survie", value: personnage["stats"]["Sur"]});
    msgEmbed.addFields({name: "Perception", value: personnage["stats"]["Per"]});
    msgEmbed.addFields({name: "Soigner", value: personnage["stats"]["Soi"]});
    msgEmbed.addFields({name: "Combat rapproché", value: personnage["stats"]["CAC"]});
    msgEmbed.addFields({name: "Combat à distance", value: personnage["stats"]["CAD"]});
    msgEmbed.addFields({name: "Talent", value: personnage["stats"]["Tal"]});
    msgEmbed.addFields({name: "Magie", value: personnage["stats"]["Mag"]});

    msgEmbed.setFooter({text: footer})

    log.print("character successfully created", 1);
    return msgEmbed;
}

/**
 * Génère les compétences d'un voleur
 * @param {Object}personnage - Personnage dont il faut générer les compétences
 * @returns {EmbedBuilder} - Renvoie un message contenant toutes les informations
 */
function makeThief(personnage) {
    personnage["stats"] = {
        "Int": "50",
        "For": "50",
        "Cha": "50",
        "Dex": "90",
        "CS": "70",
        "MC": "70",
        "Dis": "80",
        "Inti": "30",
        "Sur": "60",
        "Per": "70",
        "Soi": "30",
        "CAC": "60",
        "CAD": "20",
        "Ref": "70",
        "Mag": "0",
        "Tal": "70"
    }

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#bd48d2");
    msgEmbed.setTitle("Compétences du personnage");
    msgEmbed.setDescription("Voici les compétences de votre personnage, générées aléatoirement.")

    msgEmbed.addFields({name: "Intelligence", value: personnage["stats"]["Int"].toString(), inline: true});
    msgEmbed.addFields({name: "Force", value: personnage["stats"]["For"].toString(), inline: true});
    msgEmbed.addFields({name: "Charisme", value: personnage["stats"]["Cha"], inline: true});
    msgEmbed.addFields({name: "Dextérité", value: personnage["stats"]["Dex"], inline: true});
    msgEmbed.addFields({name: "Courir / Sauter", value: personnage["stats"]["CS"], inline: true});
    msgEmbed.addFields({name: "Mentir / Convaincre", value: personnage["stats"]["MC"], inline: true});
    msgEmbed.addFields({name: "Discrétion", value: personnage["stats"]["Dis"]});
    msgEmbed.addFields({name: "Réflexes", value: personnage["stats"]["Ref"]});
    msgEmbed.addFields({name: "Intimidation", value: personnage["stats"]["Inti"]});
    msgEmbed.addFields({name: "Survie", value: personnage["stats"]["Sur"]});
    msgEmbed.addFields({name: "Perception", value: personnage["stats"]["Per"]});
    msgEmbed.addFields({name: "Soigner", value: personnage["stats"]["Soi"]});
    msgEmbed.addFields({name: "Combat rapproché", value: personnage["stats"]["CAC"]});
    msgEmbed.addFields({name: "Combat à distance", value: personnage["stats"]["CAD"]});
    msgEmbed.addFields({name: "Talent", value: personnage["stats"]["Tal"]});
    msgEmbed.addFields({name: "Magie", value: personnage["stats"]["Mag"]});

    msgEmbed.setFooter({text: footer})

    log.print("character successfully created", 1);
    return msgEmbed;
}

/**
 * Génère les compétences d'un chasseur
 * @param {Object}personnage - Personnage dont il faut générer les compétences
 * @returns {EmbedBuilder} - Renvoie un message contenant toutes les informations
 */
function makeHunter(personnage) {
    personnage["stats"] = {
        "Int": "50",
        "For": "70",
        "Cha": "30",
        "Dex": "70",
        "CS": "70",
        "MC": "20",
        "Dis": "80",
        "Inti": "30",
        "Sur": "80",
        "Per": "80",
        "Soi": "60",
        "CAC": "20",
        "CAD": "70",
        "Ref": "70",
        "Mag": "0",
        "Tal": "70"
    }

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#bd48d2");
    msgEmbed.setTitle("Compétences du personnage");
    msgEmbed.setDescription("Voici les compétences de votre personnage, générées aléatoirement.")

    msgEmbed.addFields({name: "Intelligence", value: personnage["stats"]["Int"].toString(), inline: true});
    msgEmbed.addFields({name: "Force", value: personnage["stats"]["For"].toString(), inline: true});
    msgEmbed.addFields({name: "Charisme", value: personnage["stats"]["Cha"], inline: true});
    msgEmbed.addFields({name: "Dextérité", value: personnage["stats"]["Dex"], inline: true});
    msgEmbed.addFields({name: "Courir / Sauter", value: personnage["stats"]["CS"], inline: true});
    msgEmbed.addFields({name: "Mentir / Convaincre", value: personnage["stats"]["MC"], inline: true});
    msgEmbed.addFields({name: "Discrétion", value: personnage["stats"]["Dis"]});
    msgEmbed.addFields({name: "Réflexes", value: personnage["stats"]["Ref"]});
    msgEmbed.addFields({name: "Intimidation", value: personnage["stats"]["Inti"]});
    msgEmbed.addFields({name: "Survie", value: personnage["stats"]["Sur"]});
    msgEmbed.addFields({name: "Perception", value: personnage["stats"]["Per"]});
    msgEmbed.addFields({name: "Soigner", value: personnage["stats"]["Soi"]});
    msgEmbed.addFields({name: "Combat rapproché", value: personnage["stats"]["CAC"]});
    msgEmbed.addFields({name: "Combat à distance", value: personnage["stats"]["CAD"]});
    msgEmbed.addFields({name: "Talent", value: personnage["stats"]["Tal"]});
    msgEmbed.addFields({name: "Magie", value: personnage["stats"]["Mag"]});

    msgEmbed.setFooter({text: footer})

    log.print("character successfully created", 1);
    return msgEmbed;
}

/**
 * Génère les compétences d'un paysan
 * @param {Object}personnage - Personnage dont il faut générer les compétences
 * @returns {EmbedBuilder} - Renvoie un message contenant toutes les informations
 */
function makePeasant(personnage) {
    personnage["stats"] = {
        "Int": "30",
        "For": "70",
        "Cha": "30",
        "Dex": "70",
        "CS": "60",
        "MC": "50",
        "Dis": "70",
        "Inti": "40",
        "Sur": "70",
        "Per": "70",
        "Soi": "50",
        "CAC": "60",
        "CAD": "60",
        "Ref": "70",
        "Mag": "0",
        "Tal": "70"
    }

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#bd48d2");
    msgEmbed.setTitle("Compétences du personnage");
    msgEmbed.setDescription("Voici les compétences de votre personnage, générées aléatoirement.")

    msgEmbed.addFields({name: "Intelligence", value: personnage["stats"]["Int"].toString(), inline: true});
    msgEmbed.addFields({name: "Force", value: personnage["stats"]["For"].toString(), inline: true});
    msgEmbed.addFields({name: "Charisme", value: personnage["stats"]["Cha"], inline: true});
    msgEmbed.addFields({name: "Dextérité", value: personnage["stats"]["Dex"], inline: true});
    msgEmbed.addFields({name: "Courir / Sauter", value: personnage["stats"]["CS"], inline: true});
    msgEmbed.addFields({name: "Mentir / Convaincre", value: personnage["stats"]["MC"], inline: true});
    msgEmbed.addFields({name: "Discrétion", value: personnage["stats"]["Dis"]});
    msgEmbed.addFields({name: "Réflexes", value: personnage["stats"]["Ref"]});
    msgEmbed.addFields({name: "Intimidation", value: personnage["stats"]["Inti"]});
    msgEmbed.addFields({name: "Survie", value: personnage["stats"]["Sur"]});
    msgEmbed.addFields({name: "Perception", value: personnage["stats"]["Per"]});
    msgEmbed.addFields({name: "Soigner", value: personnage["stats"]["Soi"]});
    msgEmbed.addFields({name: "Combat rapproché", value: personnage["stats"]["CAC"]});
    msgEmbed.addFields({name: "Combat à distance", value: personnage["stats"]["CAD"]});
    msgEmbed.addFields({name: "Talent", value: personnage["stats"]["Tal"]});
    msgEmbed.addFields({name: "Magie", value: personnage["stats"]["Mag"]});

    msgEmbed.setFooter({text: footer})

    log.print("character successfully created", 1);
    return msgEmbed;
}

/**
 * Génère les compétences d'un érudit
 * @param {Object}personnage - Personnage dont il faut générer les compétences
 * @returns {EmbedBuilder} - Renvoie un message contenant toutes les informations
 */
function makeSavant(personnage) {
    personnage["stats"] = {
        "Int": "90",
        "For": "30",
        "Cha": "70",
        "Dex": "30",
        "CS": "40",
        "MC": "70",
        "Dis": "70",
        "Inti": "30",
        "Sur": "80",
        "Per": "70",
        "Soi": "80",
        "CAC": "50",
        "CAD": "20",
        "Ref": "70",
        "Mag": "0",
        "Tal": "70"
    }

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#bd48d2");
    msgEmbed.setTitle("Compétences du personnage");
    msgEmbed.setDescription("Voici les compétences de votre personnage, générées aléatoirement.")

    msgEmbed.addFields({name: "Intelligence", value: personnage["stats"]["Int"].toString(), inline: true});
    msgEmbed.addFields({name: "Force", value: personnage["stats"]["For"].toString(), inline: true});
    msgEmbed.addFields({name: "Charisme", value: personnage["stats"]["Cha"], inline: true});
    msgEmbed.addFields({name: "Dextérité", value: personnage["stats"]["Dex"], inline: true});
    msgEmbed.addFields({name: "Courir / Sauter", value: personnage["stats"]["CS"], inline: true});
    msgEmbed.addFields({name: "Mentir / Convaincre", value: personnage["stats"]["MC"], inline: true});
    msgEmbed.addFields({name: "Discrétion", value: personnage["stats"]["Dis"]});
    msgEmbed.addFields({name: "Réflexes", value: personnage["stats"]["Ref"]});
    msgEmbed.addFields({name: "Intimidation", value: personnage["stats"]["Inti"]});
    msgEmbed.addFields({name: "Survie", value: personnage["stats"]["Sur"]});
    msgEmbed.addFields({name: "Perception", value: personnage["stats"]["Per"]});
    msgEmbed.addFields({name: "Soigner", value: personnage["stats"]["Soi"]});
    msgEmbed.addFields({name: "Combat rapproché", value: personnage["stats"]["CAC"]});
    msgEmbed.addFields({name: "Combat à distance", value: personnage["stats"]["CAD"]});
    msgEmbed.addFields({name: "Talent", value: personnage["stats"]["Tal"]});
    msgEmbed.addFields({name: "Magie", value: personnage["stats"]["Mag"]});

    msgEmbed.setFooter({text: footer})

    log.print("character successfully created", 1);
    return msgEmbed;
}

/**
 * Génère aléatoirement les compétences d'un personnage
 * @param {Object}personnage - Personnage dont il faut générer les compétences
 * @returns {EmbedBuilder} - Renvoie un message contenant toutes les informations
 */
function generateRandomComp(personnage) {
    let numbers = [];

    for (let i = 0; i < 14; i++) {
        let number = Math.floor(Math.random() * 100 + 1);
        numbers.push(number);
    }

    // rectify number
    // if 0-10 -> 10 | if 90-100 -> 90 | arrondi au 5
    for (let i = 0; i < numbers.length; i++) {
        if (numbers[i] <= 10) numbers[i] = 10
        else if (numbers[i]>=90) numbers[i] = 90
        else {
            numbers[i] = Math.round(numbers[i]/5) * 5;
        }
    }

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#bd48d2");
    msgEmbed.setTitle("Compétences du personnage");
    msgEmbed.setDescription("Voici les compétences de votre personnage, générées aléatoirement.")

    personnage["stats"]["Int"] = numbers[0];
    msgEmbed.addFields({name: "Intelligence", value: numbers[0].toString(), inline: true});
    personnage["stats"]["For"] = numbers[1];
    msgEmbed.addFields({name: "Force", value: numbers[1].toString(), inline: true});
    personnage["stats"]["Cha"] = numbers[2];
    msgEmbed.addFields({name: "Charisme", value: numbers[2].toString(), inline: true});
    personnage["stats"]["Dex"] = numbers[3];
    msgEmbed.addFields({name: "Dextérité", value: numbers[3].toString(), inline: true});
    personnage["stats"]["CS"] = numbers[4];
    msgEmbed.addFields({name: "Courir / Sauter", value: numbers[4].toString(), inline: true});
    personnage["stats"]["MC"] = numbers[5];
    msgEmbed.addFields({name: "Mentir / Convaincre", value: numbers[5].toString(), inline: true});
    personnage["stats"]["Dis"] = numbers[6];
    msgEmbed.addFields({name: "Discrétion", value: numbers[6].toString()});
    personnage["stats"]["Inti"] = numbers[7];
    msgEmbed.addFields({name: "Intimidation", value: numbers[7].toString()});
    personnage["stats"]["Sur"] = numbers[8];
    msgEmbed.addFields({name: "Survie", value: numbers[8].toString()});
    personnage["stats"]["Per"] = numbers[9];
    msgEmbed.addFields({name: "Perception", value: numbers[9].toString()});
    personnage["stats"]["Soi"] = numbers[10];
    msgEmbed.addFields({name: "Soigner", value: numbers[10].toString()});
    personnage["stats"]["CAC"] = numbers[11];
    msgEmbed.addFields({name: "Combat rapproché", value: numbers[11].toString()});
    personnage["stats"]["CAD"] = numbers[12];
    msgEmbed.addFields({name: "Combat à distance", value: numbers[12].toString()});
    personnage["stats"]["Ref"] = numbers[13];
    msgEmbed.addFields({name: "Réflexes", value: numbers[13].toString()});
    personnage["stats"]["Tal"] = 70;
    msgEmbed.addFields({name: "Talent", value: "70"});
    personnage["stats"]["Mag"] = 0
    msgEmbed.addFields({name: "Magie", value: "0"});

    msgEmbed.setFooter({text: footer})

    log.print("character successfully created", 1);
    return msgEmbed;
}

module.exports = {
    startNewGame
}