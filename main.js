const Discord = require('discord.js');
const {Intents} = require("discord.js");
const {MessageEmbed} = require('discord.js');
const token = require('./token.js');
let fs = require('fs');
let mysql = require('mysql');
const client = new Discord.Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const rawConfig = require('./config.js');
const config = rawConfig['config'];

let connection = mysql.createConnection({
    host: 'mysql-camille-marro.alwaysdata.net',
    user: '232065_bot-jdr',
    password: 'CbVru8A34',
    database: 'camille-marro_bdd'
});

connection.connect(function(err) {
    if (err) {
        return console.error('error: ' + err.message);
    }
    console.log('Connecté à la base de données.');
});

client.on("ready", function() {
    console.log("Connecté au serveur Discord.");
})

client.on("message", message => {
    let msg = message.content
    if (msg.indexOf(config['prefix']) === 0 ) {
        if (msg.indexOf("lance") === 1) {
            const msgErreurSyntaxeEmbed = new MessageEmbed()
                .setColor("#ff0000")
                .setTitle("Lancés de dés")
                .setDescription("Résultats du ou des lancers de dés fait par le bot")
                .setFields(
                    {
                        name: 'Erreur de syntaxe',
                        value: 'lance [x]d[y] \n avec : x le nombre de lancers et y le nombre de face du dé'
                    }
                );

            let options = msg.split(" ");
            console.log(options);
            if (options.length == 1) {
                message.channel.send({embeds: [msgErreurSyntaxeEmbed]});
                return;
            }

            let values = options[1].split("d");

            if (values[0] == '' || values[1] == '') {
                message.channel.send({embeds: [msgErreurSyntaxeEmbed]});
                return;
            }

            let list = [];
            let somme = 0;

            for (let i = 0; i < values[0]; i++) {
                let nombre = Math.floor(Math.random() * parseInt(values[1])) + 1;
                list.push(nombre);
                somme += nombre;
            }

            let strMain = 'Lancement de ' + values[0] + ' dé(s) ' + values[1];
            let strSomme = 'Somme : ' + somme;
            let strListeJets = list.toString();

            let moyenne = 0;
            for (let i = 0; i < list.length; i++) {
                moyenne += list[i];
            }

            moyenne = moyenne / list.length;
            const resultEmbed = new MessageEmbed()
                .setColor("#005522")
                .setTitle("Lancés de dés")
                .setDescription("Résultats du ou des lancers de dés fait par le bot")
                .setFields(
                    {name: strMain, value: strSomme},
                    {name: '\u200B', value: '\u200B'}, //saut de ligne
                    {name: 'Liste des jets', value: strListeJets, inline: true},
                    {name: 'Moyenne', value: moyenne.toString(), inline: true},
                );

            message.channel.send({embeds: [resultEmbed]});
        } //DONE
        if (msg.indexOf("recharge") === 1) {
            connection.query("SELECT * FROM Personnage", function (err, result, fields) {
                if (err) return console.error("CHIBRE - " + error.message);
                let resultStr = JSON.stringify(result);
                fs.writeFile("personnage.json", resultStr, function (err, result) {
                    let status = "Réussite :)";
                    let color = "#005522";
                    if (err) {
                        console.error(err);
                        status = "Echec :(";
                        color = "#ff0000";
                        return;
                    }
                    console.log("personnage.json actualisé :)")
                    const resultEmbed = new MessageEmbed()
                        .setColor(color)
                        .setTitle("Actualisation BDD")
                        .setDescription("Actualisation des données de la BDD")
                        .setFields(
                            {name: 'Statut de l\'actualisation', value: status},
                        );

                    message.channel.send({embeds: [resultEmbed]});
                });
            });

        }
        if (msg.indexOf("infos") === 1) {
            let options = msg.split(" ");
            let rawperso = fs.readFileSync("personnage.json")
            let personnages = JSON.parse(rawperso);

            let name = options[1];
            for (let i = 0; i < personnages.length; i++) {
                if (personnages[i]['nom'] == name || personnages[i]['ID'] == name) {
                    let strName = "Informations de " + personnages[i]['nom'];

                    let race = personnages[i]['race'].toString();
                    let agi = personnages[i]['agi'].toString();
                    let int = personnages[i]['int'].toString();
                    let force = personnages[i]['for'].toString();
                    let cha = personnages[i]['cha'].toString();
                    let mag_name = "Magie : " + personnages[i]['mag_name'].toString();
                    let mag = ":sparkles: " + personnages[i]['mag'].toString()
                    let counter = personnages[i]['mag_counter'].toString();
                    let glods = personnages[i]['glods'].toString() + " glods";

                    let strRace = race + " - " + glods;
                    let strComp = ":person_doing_cartwheel: " + agi + " - :brain: " + int + " - :muscle: " + force + " - :lips: " + cha;

                    const resultEmbed = new MessageEmbed()
                        .setColor("#005522")
                        .setTitle("Infos personnage")
                        .setDescription("Récupère les informations d'un personnage avec son nom ou son ID")
                        .setFields(
                            {
                                name: strName,
                                value: strRace
                            },
                            {
                                name: "\u200B",
                                value: "\u200B"
                            },
                            {
                                name: 'Agilité - Intelligence - Force - Charisme',
                                value: strComp,
                                inline: true
                            },
                            {
                                name: "\u200B",
                                value: "\u200B"
                            },
                            {
                                name: mag_name,
                                value: mag,
                                inline: true
                            },
                            {
                                name: 'Contrecoup :',
                                value: counter,
                                inline: true
                            }
                        );
                    message.channel.send({embeds: [resultEmbed]});
                    return;
                }
            }
            const resultEmbed = new MessageEmbed()
                .setColor("#ff0000")
                .setTitle("Infos personnage")
                .setDescription("Récupère les informations d'un personnage avec son nom ou son ID")
                .setFields(
                    {
                        name: "Erreur dans la récupération d'informations",
                        value: "Veuillez saisir un identifiant ou un nom de personnage existant et valide."
                    },
                );
            message.channel.send({embeds: [resultEmbed]});
        }
    }
})

client.login (token.token);