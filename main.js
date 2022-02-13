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
    console.log('Connected to database.');
});

client.on("ready", function() {
    console.log("Connected to Discord server.");
})

client.on("message", message => {
    let msg = message.content
    if (msg.indexOf(config['prefix']) === 0 ) {
        if (msg.indexOf("roll") === 1) {
            const msgSyntaxErrorEmbed = new MessageEmbed()
                .setColor("#ff0000")
                .setTitle("Rolling dices")
                .setDescription("Results of the rolled dice(s) by the bot")
                .setFields(
                    {
                        name: 'Syntax error',
                        value: 'roll [x]d[y] \n with : x number of rolls and y number of dices faces'
                    }
                );

            let options = msg.split(" ");
            console.log(options);
            if (options.length == 1) {
                message.channel.send({embeds: [msgSyntaxErrorEmbed]});
                return;
            }

            let values = options[1].split("d");

            if (values[0] == '' || values[1] == '') {
                message.channel.send({embeds: [msgSyntaxErrorEmbed]});
                return;
            }

            let list = [];
            let sum = 0;

            for (let i = 0; i < values[0]; i++) {
                let number = Math.floor(Math.random() * parseInt(values[1])) + 1;
                list.push(number);
                sum += number;
            }

            let strMain = 'Rolling ' + values[0] + ' dice(s) ' + values[1];
            let strSum = 'Sum : ' + sum;
            let strRollsList = list.toString();

            let average = 0;
            for (let i = 0; i < list.length; i++) {
                average += list[i];
            }

            average = average / list.length;
            const resultEmbed = new MessageEmbed()
                .setColor("#005522")
                .setTitle("Rolling dices")
                .setDescription("Results of the rolled dice(s) by the bot")
                .setFields(
                    {name: strMain, value: strSum},
                    {name: '\u200B', value: '\u200B'},
                    {name: 'Rolls list', value: strRollsList, inline: true},
                    {name: 'Average', value: average.toString(), inline: true},
                );

            message.channel.send({embeds: [resultEmbed]});
        } //DONE
        if (msg.indexOf("reload") === 1) {
            connection.query("SELECT * FROM Personnage", function (err, result, fields) {
                if (err) return console.error(error.message);
                let resultStr = JSON.stringify(result);
                fs.writeFile("personnage.json", resultStr, function (err, result) {
                    let status = "Successful :)";
                    let color = "#005522";
                    if (err) {
                        console.error(err);
                        status = "Failure :(";
                        color = "#ff0000";
                        return;
                    }
                    console.log("personnage.json reloaded.")
                    const resultEmbed = new MessageEmbed()
                        .setColor(color)
                        .setTitle("Refreshing database")
                        .setDescription("Refreshing database's data")
                        .setFields(
                            {name: 'Actualisation status', value: status},
                        );

                    message.channel.send({embeds: [resultEmbed]});
                });
            });

        }
        if (msg.indexOf("infos") === 1) {
            let options = msg.split(" ");
            let rawPersonages = fs.readFileSync("personnage.json")
            let personages = JSON.parse(rawPersonages);

            let name = options[1];
            for (let i = 0; i < personages.length; i++) {
                if (personages[i]['nom'] == name || personages[i]['ID'] == name) {
                    let strName = "Informations de " + personages[i]['nom'];

                    let race = personages[i]['race'].toString();
                    let agi = personages[i]['agi'].toString();
                    let int = personages[i]['int'].toString();
                    let force = personages[i]['for'].toString();
                    let cha = personages[i]['cha'].toString();
                    let mag_name = "Magie : " + personages[i]['mag_name'].toString();
                    let mag = ":sparkles: " + personages[i]['mag'].toString()
                    let counter = personages[i]['mag_counter'].toString();
                    let glods = personages[i]['glods'].toString() + " glods";

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
                .setTitle("Personages infos")
                .setDescription("Getting personages infos with his name or ID")
                .setFields(
                    {
                        name: "Error during the process",
                        value: "Please enter an existing and valid character name or ID"
                    },
                );
            message.channel.send({embeds: [resultEmbed]});
        }
    }
})

client.login (token.token);