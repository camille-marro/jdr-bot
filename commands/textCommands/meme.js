let fs = require('fs');
const path = require("path");

const { EmbedBuilder } = require('discord.js');

let memesData;

try {
    console.log("|-- Loading memes' data from meme.json ...");
    const rawData = fs.readFileSync(path.resolve(__dirname, "../../json_files/meme.json"));
    if (rawData.length === 0) {
        console.log("|-- no data found, creating empty array");
        memesData = [];
    } else {
        console.log("|-- data found ! fetching data")
        memesData = JSON.parse(rawData);
    }
} catch (err) {
    // le fichier n'existe pas il faut donc le créer
    // creation fichier
    console.log("|-- no file named meme.json found");
    console.log("|-- creating file and empty array");
    fs.writeFileSync(path.resolve(__dirname, "../../json_files/meme.json"), []);
    memesData = [];
}

function showMeme(message) {
    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#34aec0");
    msgEmbed.setTitle("Meme");
    msgEmbed.setDescription("Montre un meme stocké par les utilisateurs");
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"meme help\""});

    if (memesData.length === 0) {
        msgEmbed.addFields({name: "Erreur de récuparation", value: "La liste de meme est vide :("});
        msgEmbed.setColor("#ff0000");

        message.channel.send({embeds: [msgEmbed]});
        return;
    }

    let indiceMeme = Math.floor(Math.random() * memesData.length);
    let meme = memesData[indiceMeme];

    msgEmbed.addFields({name: "Voici un meme bien drôle", value: meme['link']});
    msgEmbed.addFields({name: "Ajouté par", value: `<@${meme['user']}>`, inline: true});
    msgEmbed.addFields({name: "Le", value: meme['date'], inline: true});

    const regex = /https?:\/\/[^\s/$.?#].[^\s]*/g;
    if (regex.test(meme['link'])) msgEmbed.setImage(meme['link']);

    message.channel.send({embeds: [msgEmbed]});
}

function addMeme(message) {
    let args = message.content.split(" ");

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#34aec0");
    msgEmbed.setTitle("Meme");
    msgEmbed.setDescription("Montre un meme stocké par les utilisateurs");
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"meme help\""});


    const regex = /https?:\/\/[^\s/$.?#].[^\s]*/g;

    if (args[2] === "") {
        msgEmbed.addFields({name: "Erreur de syntaxe", value: "Aucun lien n'a été donné"});
        msgEmbed.addFields({name: "Syntaxe de la commande", value: "meme add [lien]"});
        msgEmbed.setColor("#ff0000");

        console.log("|-- action is impossible : no link given");
        message.channel.send({embeds: [msgEmbed]});
        return;
    } else if (!regex.test(args[2])){
        msgEmbed.addFields({name: "Erreur de syntaxe", value: "L'argument donné n'est pas un lien"});
        msgEmbed.addFields({name: "Syntaxe de la commande", value: "meme add [lien]"});
        msgEmbed.setColor("#ff0000");

        console.log("|-- action is impossible : not a link");
        message.channel.send({embeds: [msgEmbed]});
        return;
    } else {
        let stop = false;
        memesData.forEach(meme => {
            if (meme['link'] === args[2]) {
                msgEmbed.addFields({name: "Erreur d'ajout", value: "Le meme existe déjà"});
                msgEmbed.setColor("#ff0000");

                console.log("|-- action is impossible : meme already exist");
                stop = !stop;
                message.channel.send({embeds: [msgEmbed]});
            }
        });
        if (stop) return;
    }

    const rawDate = new Date();
    let date = rawDate.getDate() + "/" + (rawDate.getMonth() + 1) + "/" + rawDate.getFullYear();

    memesData.push({
        "link": args[2],
        "user": message.member.user.id,
        "date" : date
    });

    let newData = JSON.stringify(memesData);
    fs.writeFileSync(path.resolve(__dirname, "../../json_files/meme.json"), newData);

    console.log("|-- successfully upload meme");

    msgEmbed.addFields({name: "Ajout du meme réussi", value: " "});
    message.channel.send({embeds: [msgEmbed]});
}

function help(message) {
    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#6e0e91");
    msgEmbed.setTitle("Meme");
    msgEmbed.setDescription("Montre un meme stocké par les utilisateurs");
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"meme help\""});

    msgEmbed.addFields({name: "Syntaxe de la commande", value: "meme [add:optionnel] [lien:optionnel]"});
    msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
    msgEmbed.addFields({name: "add:optionnel", value: "add permet d'ajouter un meme", inline: true});
    msgEmbed.addFields({name: "lien:optionnel", value: "lien du meme a ajouté", inline: true});
    msgEmbed.addFields({name: "Exemple de commande", value: " "});
    msgEmbed.addFields({name: "meme", value: " "});
    msgEmbed.addFields({name: "meme add https://www.youtube.com/watch?v=dQw4w9WgXcQ", value: " "});
    msgEmbed.addFields({name: "Description", value: "La commande permet de sauvegarder un meme ou d'en tirer un au hasard."})

    message.channel.send({embeds: [msgEmbed]});
}

function execute (message) {
    let args = message.content.split(" ");

    if (args[1] === "add") {
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to add a meme");
        addMeme(message);
    } else if (args[1] === "help") {
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for meme command.");
        help(message);
    } else {
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to watch a meme");
        showMeme(message);
    }
}

module.exports = {
    execute
}