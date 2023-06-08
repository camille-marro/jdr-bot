const { EmbedBuilder } = require('discord.js');

function roll (message) {
    let msg = message.content;
    let options = msg.split(" ");

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#005522");
    msgEmbed.setTitle("Lancé de dés");
    msgEmbed.setDescription("Lancer des dés de plusieurs faces");

    if (options[1] === "help") {
        msgEmbed.addFields({name : "Syntaxe de la commande", value: "roll [nb_lancers]d[nb_faces]"});
        msgEmbed.addFields({name : "Paramètres", value: " ", inline: true});
        msgEmbed.addFields({name : "nb_lancers", value: "Nombre de lancé à faire", inline: true});
        msgEmbed.addFields({name : "nb_faces", value: "Nombre de faces du dé", inline: true});
        msgEmbed.addFields({name : "Exemple de commande", value: "roll 3d6"});
        msgEmbed.addFields({name : " ", value: " "});
        msgEmbed.addFields({name : "Description", value: "La commande affiche la liste des tirages dans l'ordre ainsi que la moyenne des jets."})
        msgEmbed.setColor("#6e0e91");
        message.channel.send({embeds: [msgEmbed]});

        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for roll command.");
        return;
    }

    if (options.length === 1) {
        msgEmbed.addFields({name : "Erreur de syntaxe", value:"roll [x]d[y] \n avec : x le nombre de lancers et y le nombre de face du dé"});
        msgEmbed.setColor("#ff0000");
        message.channel.send({embeds: [msgEmbed]});

        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to roll dices.");
        console.log("|-- syntax error");
        console.log("|-- " + message.content);
        return;
    }

    //check si options[1] contient un d avant de faire ça :
    if (!options[1].includes("d")) {
        msgEmbed.addFields({name : "Erreur de syntaxe", value:"roll [x]d[y] \n avec : x le nombre de lancers et y le nombre de face du dé"});
        msgEmbed.setColor("#ff0000");
        message.channel.send({embeds: [msgEmbed]});

        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to roll dices.");
        console.log("|-- " + "syntax error");
        console.log("|-- " + message.content);
        return;
    }
    let values = options[1].split("d");

    if (values[0] === '' || values[1] === '') {
        msgEmbed.addFields({name : "Erreur de syntaxe", value:"roll [x]d[y] \n avec : x le nombre de lancers et y le nombre de face du dé"});
        msgEmbed.setColor("#ff0000");
        message.channel.send({embeds: [msgEmbed]});

        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to roll dices.");
        console.log("|-- " + "syntax error");
        console.log("|-- " + message.content);
        return;
    }

    //check si values[0] et values[1] sont au bon format c'est à dire des chiffres
    let checkFormat = /^[0-9]+$/gm;
    let checkFormat2 = /^[0-9]+$/gm;
    let check = checkFormat.test(values[0]);
    let check2 = checkFormat2.test(values[1]);

    if (!check || !check2) {
        msgEmbed.addFields({name : "Erreur de syntaxe", value:"roll [x]d[y] \n avec : x le nombre de lancers et y le nombre de face du dé"});
        msgEmbed.setColor("#ff0000");
        message.channel.send({embeds: [msgEmbed]});

        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to roll dices.");
        console.log("|-- " + "syntax error");
        console.log("|-- " + message.content);
        return;
    }

    let list = [];
    let sum = 0;

    for (let i = 0; i < values[0]; i++) {
        let number = Math.floor(Math.random() * parseInt(values[1])) + 1;
        list.push(number);
        sum += number;
    }

    let strRollsList = list.toString();
    let average = 0;
    for (let i = 0; i < list.length; i++) {
        average += list[i];
    }

    average = average / list.length;

    msgEmbed.addFields({name : `Tirage de ${values[0]} dé(s) ${values[1]}`, value: `Somme des lancés : ${sum}`});
    msgEmbed.addFields({name : " ", value:" "});
    msgEmbed.addFields({name : "Liste des jets", value: strRollsList, inline: true});
    msgEmbed.addFields({name : "Moyenne", value:average.toPrecision(3).toString(), inline: true});
    message.channel.send({embeds: [msgEmbed]});

    console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") rolled dices (" + values[0] + "d" + values[1] + ").");
}
module.exports = {
    roll
}