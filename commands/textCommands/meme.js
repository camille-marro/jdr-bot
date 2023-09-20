let fs = require('fs');
const path = require("path");

const cheerio = require('cheerio');
const axios = require('axios');

const { EmbedBuilder } = require('discord.js');

const log = require('../../assets/log');

let memesData;

try {
    console.log("|-- Loading memes' data from meme.json ...");
    log.print("loading memes' data from meme.json", 1);
    const rawData = fs.readFileSync(path.resolve(__dirname, "../../json_files/meme.json"));
    if (rawData.length === 0) {
        console.log("|-- no data found, creating empty array");
        memesData = [];
        log.print("no data found, creating empty array", 1);
    } else {
        console.log("|-- data found ! fetching data");
        log.print("data found, fetching data", 1);
        memesData = JSON.parse(rawData);
    }
} catch (err) {
    // le fichier n'existe pas il faut donc le créer
    // creation fichier
    console.log("|-- no file named meme.json found");
    console.log("|-- creating file and empty array");
    fs.writeFileSync(path.resolve(__dirname, "../../json_files/meme.json"), []);
    memesData = [];
    log.print("no file named meme.json found, creating a new file and initializing new array", 1);
}

async function showMeme(message) {
    log.print("tried to get a meme", message.author, message.content);

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#34aec0");
    msgEmbed.setTitle("Meme");
    msgEmbed.setDescription("Montre un meme stocké par les utilisateurs");
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"meme help\""});

    if (memesData.length === 0) {
        msgEmbed.addFields({name: "Erreur de récuparation", value: "La liste de meme est vide :("});
        msgEmbed.setColor("#ff0000");

        message.channel.send({embeds: [msgEmbed]});
        log.print("error : meme list is empty");
        return;
    }

    let indiceMeme = Math.floor(Math.random() * memesData.length);
    let meme = memesData[indiceMeme];

    msgEmbed.addFields({name: "Voici un meme bien drôle", value: meme['link']});
    msgEmbed.addFields({name: "Ajouté par", value: `<@${meme['user']}>`, inline: true});
    msgEmbed.addFields({name: "Le", value: meme['date'], inline: true});

    const regex = /https?:\/\/[^\s/$.?#].[^\s]*/g;
    if (regex.test(meme['link'])) {
        const regexYoutube = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=)|youtu\.be\/)([\w-]{11})$/;
        const regexTenorGif = /^https?:\/\/tenor\.com\/view\/([a-zA-Z0-9-]+)-(\d+)$/;
        const imageExtension = /\.(png|gif|jpe?g|bmp|svg|webp)$/i;

        if (regexYoutube.test(meme['link'])) {
            let args = meme['link'].split('/');
            let index = args[3].lastIndexOf('=');
            args[3] = args[3].substring(index + 1);
            console.log(`|-- youtube video found, thumbnail link : https://img.youtube.com/vi/${args[3]}/hqdefault.jpg`);
            log.print("youtube video found, getting thumbnail link", 1);
            msgEmbed.setImage(`https://img.youtube.com/vi/${args[3]}/hqdefault.jpg`);
        } else if (regexTenorGif.test(meme['link'])) {
            let imageLink;
            await axios.get(meme['link'])
                .then(r => {
                    const html = r.data;
                    const $ = cheerio.load(html);
                    const imgTags = $('img');

                    imageLink = $(imgTags[2]).attr('src');
                    console.log("|-- gif found : " + imageLink);
                    log.print("gif found, getting gif link", 1);
                })
                .catch(e => {
                    console.log('|-- error : ' + e);
                    log.print("error : " + e, 1);
                });
            console.log(imageLink);
            log.print("link fecthed : " + imageLink, 1);
            msgEmbed.setImage(imageLink);
        } else if (imageExtension.test(meme['link'])) {
            console.log("|-- image found");
            log.print("image found", 1);
            msgEmbed.setImage(meme['link']);
        } else {
            console.log("|-- not a gif or yt video, deleting image preview");
            log.print("not a gif or a youtube video, deleting image preview", 1);
        }
    }

    message.channel.send({embeds: [msgEmbed]});
    log.print("success message sent", 1);
}

function addMeme(message) {
    log.print("tried to add a meme", message.author, message.content);
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
        log.print("action is impossible : no link given", 1, message.content);
        message.channel.send({embeds: [msgEmbed]});
        return;
    } else if (!regex.test(args[2])){
        msgEmbed.addFields({name: "Erreur de syntaxe", value: "L'argument donné n'est pas un lien"});
        msgEmbed.addFields({name: "Syntaxe de la commande", value: "meme add [lien]"});
        msgEmbed.setColor("#ff0000");

        console.log("|-- action is impossible : not a link");
        log.print("action is impossible : not a link", 1, message.content);
        message.channel.send({embeds: [msgEmbed]});
        return;
    } else {
        let stop = false;
        memesData.forEach(meme => {
            if (meme['link'] === args[2]) {
                msgEmbed.addFields({name: "Erreur d'ajout", value: "Le meme existe déjà"});
                msgEmbed.setColor("#ff0000");

                console.log("|-- action is impossible : meme already exist");
                log.print("action is impossible : meme already exist", 1, message.content);
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
    log.print("successfully uploaded meme", 1);

    console.log("|-- successfully upload meme");

    msgEmbed.addFields({name: "Ajout du meme réussi", value: " "});
    message.channel.send({embeds: [msgEmbed]});
    log.print("success message sent", 1);
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
    log.print("asked help for meme command", message.author, message.content);
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
        showMeme(message).then(r => "");
    }
}

module.exports = {
    execute
}