let fs = require('fs');
const path = require("path");

const { EmbedBuilder } = require('discord.js');

let filmsData;

try {
    console.log("|- Loading films' data from films.json ...");
    const rawFilm = fs.readFileSync(path.resolve(__dirname, "../../json_files/films.json"));
    if (rawFilm.length === 0) {
        console.log("|-- no data found, creating empty array");
        filmsData = [];
    } else {
        console.log("|- data found ! fetching data ...");
        filmsData = JSON.parse(rawFilm);
        console.log("|- film data successfully fetched")
    }
} catch (err) {
    // le fichier n'existe pas il faut donc le créer
    // creation fichier
    console.log("|-- no file named films.json found");
    console.log("|-- creating file and empty array")
    fs.writeFileSync(path.resolve(__dirname, "../../json_files/films.json"), [].toString());
    filmsData = [];
}

function setFilm(message) {
    let args = message.content.split(" ");

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#d5a32a");
    msgEmbed.setTitle("Liste de films");
    msgEmbed.setDescription("Propose un film aléatoire parmis le TOP 3 de chaque utilisateur");
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"film help\""});

    if (args[3] <= 0 || args[3] > 3 || isNaN(parseInt(args[3]))) {
        console.log("|-- wrong index given : " + args[3] + ", index must be between 1 and 3");

        msgEmbed.setColor("#ff0000");
        msgEmbed.addFields({name: "Erreur d'argument", "value": "L'indice du film doit être compris en 1 et 3"});

        message.channel.send({embeds: [msgEmbed]});
        return;
    }


    let modif = false;
    filmsData.forEach(data => {
        if (data['id'] === message.member.id) {
            if (args[2] === "nom") {
                let query = "";
                for (let i = 4; i < args.length; i++) {
                    query += (args[i] + " ");
                }

                let name;
                if (data['top'][args[3]-1]["name"]) name = data['top'][args[3]-1]["name"];
                else name = "Pas d'ancien nom";

                data['top'][args[3]-1]["name"] = query;

                let newData = JSON.stringify(filmsData);
                fs.writeFileSync(path.resolve(__dirname, "../../json_files/films.json"), newData);

                console.log("|-- successfully changed platform name " + name + " to " + query);

                msgEmbed.addFields({name: "Changement du nom du film", value: " "});
                msgEmbed.addFields({name: "Ancien nom", value: name});
                msgEmbed.addFields({name: "Nouveau nom", value: query});

                message.channel.send({embeds: [msgEmbed]});

                modif = !modif;
            } else if (args[2] === "note") {
                let query = "";
                for (let i = 4; i < args.length; i++) {
                    query += (args[i] + " ");
                }

                let note;
                if (data['top'][args[3]-1]["note"]) note = data['top'][args[3]-1]["note"];
                else note = "Pas d'ancienne note";

                data['top'][args[3]-1]["note"] = query;

                let newData = JSON.stringify(filmsData);
                fs.writeFileSync(path.resolve(__dirname, "../../json_files/films.json"), newData);

                console.log("|-- successfully changed note from " + note + " to " + query);

                msgEmbed.addFields({name: "Changement de la note du film", value: " "});
                msgEmbed.addFields({name: "Ancienne note", value: note});
                msgEmbed.addFields({name: "Nouvelle note", value: query});

                message.channel.send({embeds: [msgEmbed]});

                modif = !modif;
            } else if (args[2] === "plateforme") {
                let query = "";
                for (let i = 4; i < args.length; i++) {
                    query += (args[i] + " ");
                }

                let plateforme;
                if (data['top'][args[3]-1]["plateforme"]) plateforme = data['top'][args[3]-1]["plateforme"];
                else plateforme = "Pas d'ancienne plateforme";

                data['top'][args[3]-1]["plateforme"] = query;

                let newData = JSON.stringify(filmsData);
                fs.writeFileSync(path.resolve(__dirname, "../../json_files/films.json"), newData);

                console.log("|-- successfully changed platform from " + plateforme + " to " + query);

                msgEmbed.addFields({name: "Changement de la plateforme du film", value: " "});
                msgEmbed.addFields({name: "Ancienne plateforme", value: plateforme, inline:true});
                msgEmbed.addFields({name: "Nouvelle plateforme", value: query, inline:true});

                message.channel.send({embeds: [msgEmbed]});

                modif = !modif;
            } else {
                console.log("|-- wrong attribut given : " + args[2] + ", attribut must be nom, plateforme or note");

                msgEmbed.setColor("#ff0000");
                msgEmbed.addFields({name: "Erreur d'argument", "value": "L'attribut doit être nom, plateforme ou note"});

                message.channel.send({embeds: [msgEmbed]});

                modif = !modif;
            }
        }
    });

    // si on ne trouve rien dans le foreach il faut créer l'user
    if (modif) return;

    filmsData.push({
        id: message.member.id,
        name: message.member.user.username,
        top: [
            {
                name: "",
                plateforme: "",
                note: ""
            },
            {
                name: "",
                plateforme: "",
                note: ""
            },
            {
                name: "",
                plateforme: "",
                note: ""
            }
        ]
    });

    msgEmbed.addFields({name: "Création de votre liste de film réussie !", value: "Vous pouvez mettre à jour votre top 3 à tout moment !"});

    let newData = JSON.stringify(filmsData);
    fs.writeFileSync(path.resolve(__dirname, "../../json_files/films.json"), newData);

    message.channel.send({embeds: [msgEmbed]});
}

function film(message) {
    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#d5a32a");
    msgEmbed.setTitle("Liste de films");
    msgEmbed.setDescription("Propose un film aléatoire parmis le TOP 3 de chaque utilisateurs");
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"film help\""});

    if (filmsData === []) {
        msgEmbed.addFields({name: "Erreur de récupération", value: "Aucun film n'a été soumis"})
        msgEmbed.setColor("#ff0000");

        console.log("|-- action is impossible : no data to fetch");
        message.channel.send({embeds: [msgEmbed]});
        return;
    }

    let user = Math.floor(Math.random() * filmsData.length);
    let indiceFilm = Math.floor(Math.random() * 3);

    while (filmsData[user]['id'] === message.member.id) user = Math.floor(Math.random() * filmsData.length);

    console.log("|-- film fetched : " + filmsData[user]['top'][indiceFilm]['name'] + "submitted by " + filmsData[user]['name'])

    msgEmbed.addFields({name: "Film proposé", value: filmsData[user]['top'][indiceFilm]['name'], inline: true});
    msgEmbed.addFields({name: "Soumis par", value: filmsData[user]['name'], inline: true});
    msgEmbed.addFields({name: "Note", value: filmsData[user]['top'][indiceFilm]['note'], inline: true});

    message.channel.send({embeds: [msgEmbed]});
}

function getFilm(message) {
    let args = message.content.split(" ");

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#d5a32a");
    msgEmbed.setTitle("Liste de films");
    msgEmbed.setDescription("Propose un film aléatoire parmis le TOP 3 de chaque utilisateurs");
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"film help\""});

    let id;
    if (args[2]) {
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to get the top 3 of " + args[2]);
        id = args[2].substring(2, args[2].length - 1);
    } else {
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to get his/her top 3.");
        id = message.member.id;
    }

    let filmFound = false;
    filmsData.forEach(data => {
        if (data['id'] === id) {
            filmFound = !filmFound;
            let i = 1;
            data['top'].forEach(film => {
                msgEmbed.addFields({name: `Film numéro ${i}`, value: " "});
                if (film['name'] === "") film['name'] = " ";
                msgEmbed.addFields({name: "Titre", value: film['name'], inline: true});
                if (film['note'] === "") film['note'] = " ";
                msgEmbed.addFields({name: "Note", value: film['note'], inline: true});
                if (film['plateforme'] === "") film['plateforme'] = " ";
                msgEmbed.addFields({name: "Plateforme", value: film['plateforme'], inline: true});
                i++;
            })
        }
    });

    if (!filmFound) {
        console.log("|-- no data found, user doesn't have a top 3");
        msgEmbed.setColor("#ff0000");
        msgEmbed.addFields({name: "Erreur de récupération", value: "Aucun top 3 n'a été trouvé"});

        message.channel.send({embeds: [msgEmbed]});
        return
    }

    console.log("|-- successfully fetched top 3")
    message.channel.send({embeds: [msgEmbed]});
}

function help(message) {
    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#6e0e91");
    msgEmbed.setTitle("Liste de films");
    msgEmbed.setDescription("Propose un film aléatoire parmis le TOP 3 de chaque utilisateurs");
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"film help\""});

    msgEmbed.addFields({name: "Syntaxe de la commande", value: "film [commande] [options]"});
    msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
    msgEmbed.addFields({name: "commande", value: "set / get", inline: true});
    msgEmbed.addFields({name: "options", value: "options en fonction de la commande", inline: true});
    msgEmbed.addFields({name: "film set [attribut] [film] [valeur]", value: " "});
    msgEmbed.addFields({name: "Paramètres", value: " "});
    msgEmbed.addFields({name: "attribut", value: "Attribut à changer : nom, note ou plateforme", inline: true});
    msgEmbed.addFields({name: "film", value: "indice du film à modifier : 1, 2 ou 3", inline: true});
    msgEmbed.addFields({name: "valeur", value: "valeur à donner aux champs modifier", inline: true});
    msgEmbed.addFields({name: "film get [user:optionnel]", value: " "});
    msgEmbed.addFields({name: "Paramètres", value: " "});
    msgEmbed.addFields({name: "user:optionnel", value: "utilisateur à qui récupérer le TOP 3, si rien n'est spécifié c'est son propre TOP qui est affiché"});
    msgEmbed.addFields({name: "Exemples de commande", value: " "});
    msgEmbed.addFields({name: "set", value: "film set nom 1 Avatar : la voie de l'eau", inline: true});
    msgEmbed.addFields({name: "get", value: "film get", inline: true});
    msgEmbed.addFields({name: "sans options", value: "film", inline: true});
    msgEmbed.addFields({name: "Description", value: "La commande permet d'obtenir aléatoirement un film parmis le top 3 des utilisateurs ou de modifier son top 3."});

    message.channel.send({embeds: [msgEmbed]});
}

function execute(message) {
    let args = message.content.split(" ");

    if (args[1] === "set") {
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to change his films' top 3.");
        setFilm(message);
    } else if (args[1] === "get") {
        getFilm(message);
    } else if (args[1] === "help") {
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for film command.");
        help(message);
    } else {
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to get a random film.");
        film(message);
    }
}

module.exports = {
    execute
}