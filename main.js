const Discord = require('discord.js');
const {Intents} = require("discord.js");
const {MessageEmbed} = require("discord.js");
let mysql = require('mysql');
//let config = require('./config_db.js');
const client = new Discord.Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

//let connection = mysql.createConnection(config);

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

client.on("ready", function(){
    console.log("Connecté au serveur Discord.");
})

// @TODO: mettre un préfixe aux commandes (!) ou ($) ou (?)

client.on("message", message => {
    const msgErreurSyntaxeEmbed = new MessageEmbed()
        .setColor("#ff0000")
        .setTitle("Lancés de dés")
        .setDescription("Résultats du ou des lancers de dés fait par le bot")
        .setFields(
            {name: 'Erreur de syntaxe',value: 'lance [x]d[y] \n avec : x le nombre de lancers et y le nombre de face du dé'}
        );

    let msg = message.content
    if (msg.indexOf("lance") === 0) {
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
    }
    if (msg.indexOf("get") === 0) {
        let options = msg.split(" ");
        let parsed = parseInt(options[1].toString());
        let id = 0;
        if (isNaN(parsed)) {
            let persoNameRequest = `SELECT ID FROM Personnage WHERE nom = ?`;
            connection.query(persoNameRequest, [options[1]], (error, results, fields) => {
                if (error) {
                    message.channel.send("erreur dans la recuperation de l'id")
                    return console.error(error.message);
                }
                id = results[0]['ID'];
                console.log("CONNECTION - " + id);
            })
        }

        console.log(options);
        options[1] = id;
        console.log(options);
        let finalrequest = `SELECT * FROM Competences WHERE ID_p = ? AND nom = ?`;
        connection.query(finalrequest, [options[1], options[2]], (error, results, fields) => {
           if (error) {
               message.channel.send("erreur dans la requete");
               return console.error(error.message);
           }
           //message.channel.send(results[0]['valeur'].toString());
           console.log(results);
        });

        //@TODO: liér la commande à celle du lancer de dé peut etre avec genre un parametre apres lancer
    }
})

function getValeurComp (mode, value, comp) {
    if (mode == 1)
}
// mode 1 -> nom
// mode 0 -> ID
client.login ("OTI5MzkzMTY0OTcwNzc4NzA1.Ydmq1Q.rQx2MrowBCMy81GsQvwoH9ghpiA");