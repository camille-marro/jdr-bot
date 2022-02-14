const Discord = require('discord.js');
const {Intents} = require("discord.js");
const {MessageEmbed} = require('discord.js');

const token = require('./token.js');
let fs = require('fs');
let mysql = require('mysql');

const client = new Discord.Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

let config = require('./config.js');
console.log("Current config :");
console.log(config);

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
    console.log('Connected to database');
});

client.on("ready", function() {
    console.log("Connected to Discord server");
})

client.on("message", message => {
    let msg = message.content
    if (msg.indexOf(config['config']['prefix']) === 0 ) {
        let rawJSONEmbed = fs.readFileSync("json_files/embed_msg/" + config['config']['lang'] + ".json");
        let JSONEmbed = JSON.parse(rawJSONEmbed);

        if (msg.indexOf("roll") === 1) {
            let msgSyntaxErrorEmbed = createEmbed(JSONEmbed['msgSyntaxErrorEmbed']['color'], JSONEmbed['msgSyntaxErrorEmbed']['title'], JSONEmbed['msgSyntaxErrorEmbed']['description'], JSONEmbed['msgSyntaxErrorEmbed']['field'], []);
            let options = msg.split(" ");
            if (options.length === 1) {
                message.channel.send({embeds: [msgSyntaxErrorEmbed]});
                return;
            }

            let values = options[1].split("d");

            if (values[0] === '' || values[1] === '') {
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
            let embedOptions = [];
            embedOptions['!strMain'] = strMain;
            embedOptions['!strSum'] = strSum;
            embedOptions['!strRollsList'] = strRollsList;
            embedOptions['!average'] = average.toString();
            let msgRolledDiceEmbed = createEmbed(JSONEmbed['msgRolledDiceEmbed']['color'], JSONEmbed['msgRolledDiceEmbed']['title'], JSONEmbed['msgRolledDiceEmbed']['description'], JSONEmbed['msgRolledDiceEmbed']['field'], embedOptions)

            message.channel.send({embeds: [msgRolledDiceEmbed]});
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
                    console.log("personnage.json reloaded.");

                    let msgRefreshDBEmbed = createEmbed(JSONEmbed['msgRefreshDBEmbed']['color'], JSONEmbed['msgRefreshDBEmbed']['title'], JSONEmbed['msgRefreshDBEmbed']['description'], JSONEmbed['msgRefreshDBEmbed']['field'], [])
                    message.channel.send({embeds: [msgRefreshDBEmbed]});
                });
            });

        } //DONE
        if (msg.indexOf("infos") === 1) {
            let options = msg.split(" ");
            let rawPersonages = fs.readFileSync("json_files/personnage.json")
            let personages = JSON.parse(rawPersonages);

            let name = options[1];
            for (let i = 0; i < personages.length; i++) {
                if (personages[i]['nom'] === name || personages[i]['ID'] === name) {
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

                    let embedOptions = [];
                    embedOptions['!strName'] = strName;
                    embedOptions['!strRace'] = strRace;
                    embedOptions['!strComp'] = strComp;
                    embedOptions['!mag_name'] = mag_name;
                    embedOptions['!mag'] = mag;
                    embedOptions['!counter'] = counter;

                    let msgPersonagesInfosEmbed = createEmbed(JSONEmbed['msgPersonagesInfosEmbed']['color'], JSONEmbed['msgPersonagesInfosEmbed']['title'], JSONEmbed['msgPersonagesInfosEmbed']['description'], JSONEmbed['msgPersonagesInfosEmbed']['field'], embedOptions)
                    message.channel.send({embeds: [msgPersonagesInfosEmbed]});
                    return;
                }
            }
            let msgPersonagesInfosErrorEmbed = createEmbed(JSONEmbed['msgPersonagesInfosErrorEmbed']['color'], JSONEmbed['msgPersonagesInfosErrorEmbed']['title'], JSONEmbed['msgPersonagesInfosErrorEmbed']['description'], JSONEmbed['msgPersonagesInfosErrorEmbed']['field'], [])
            message.channel.send({embeds: [msgPersonagesInfosErrorEmbed]});
        } //DONE
        if (msg.indexOf("config") === 1) {
            let options = msg.split(" ")
            console.log(options);
            if (options[1] === "lang") {
                if (options[2] === "fr" || options[2] === "en") {
                    config['config']['lang'] = options[2];
                    let JSONConfig = JSON.stringify(config['config']);
                    fs.writeFileSync("json_files/config.json", JSONConfig);

                    let embedOptions = [];
                    embedOptions['!strConfig'] = "prefix : " + config['config']['prefix'] + " - lang : " + config['config']['lang'];

                    let msgConfigLangSuccessEmbed = createEmbed(JSONEmbed['msgConfigLangSuccessEmbed']['color'], JSONEmbed['msgConfigLangSuccessEmbed']['title'], JSONEmbed['msgConfigLangSuccessEmbed']['description'], JSONEmbed['msgConfigLangSuccessEmbed']['field'], embedOptions)
                    message.channel.send({embeds: [msgConfigLangSuccessEmbed]});
                } else {
                    let msgConfigLangErrorLangEmbed = createEmbed(JSONEmbed['msgConfigLangErrorLangEmbed']['color'], JSONEmbed['msgConfigLangErrorLangEmbed']['title'], JSONEmbed['msgConfigLangErrorLangEmbed']['description'], JSONEmbed['msgConfigLangErrorLangEmbed']['field'], [])
                    message.channel.send({embeds: [msgConfigLangErrorLangEmbed]});
                }
            }
            else if (options[1] === "prefix") {
                if (options[2] === undefined) {
                    let msgConfigLangErrorLangEmbed = createEmbed(JSONEmbed['msgConfigLangErrorLangEmbed']['color'], JSONEmbed['msgConfigLangErrorLangEmbed']['title'], JSONEmbed['msgConfigLangErrorLangEmbed']['description'], JSONEmbed['msgConfigLangErrorLangEmbed']['field'], [])
                    message.channel.send({embeds: [msgConfigLangErrorLangEmbed]});
                    return;
                }
                config['config']['prefix'] = options[2];
                let JSONConfig = JSON.stringify(config['config']);
                fs.writeFileSync("json_files/config.json", JSONConfig);

                let embedOptions = [];
                embedOptions['!strConfig'] = "prefix : " + config['config']['prefix'] + " - lang : " + config['config']['lang'];

                let msgConfigLangSuccessEmbed = createEmbed(JSONEmbed['msgConfigLangSuccessEmbed']['color'], JSONEmbed['msgConfigLangSuccessEmbed']['title'], JSONEmbed['msgConfigLangSuccessEmbed']['description'], JSONEmbed['msgConfigLangSuccessEmbed']['field'], embedOptions)
                message.channel.send({embeds: [msgConfigLangSuccessEmbed]});
            }
            else {
                let msgConfigLangErrorEmbed = createEmbed(JSONEmbed['msgConfigLangErrorEmbed']['color'], JSONEmbed['msgConfigLangErrorEmbed']['title'], JSONEmbed['msgConfigLangErrorEmbed']['description'], JSONEmbed['msgConfigLangErrorEmbed']['field'], [])
                message.channel.send({embeds: [msgConfigLangErrorEmbed]});
                console.log("msgConfigLangErrorLangEmbed");
            }
        }
    }
})

function createEmbed(color, title, description, fields, values) {
    let msgEmbed = new MessageEmbed();

    if (color !== "") {
        if (color.indexOf("!") === 0) msgEmbed.setColor(values[color]);
        else msgEmbed.setColor(color);
    }
    else msgEmbed.setColor("#555555");

    if (title !== "") {
        if (title.indexOf("!") === 0) msgEmbed.setTitle(values[title]);
        else msgEmbed.setTitle(title.toString());
    }
    else msgEmbed.setTitle("Default");

    if (description !== "") {
        if (description.indexOf("!") === 0) msgEmbed.setDescription(values[description])
        else msgEmbed.setDescription(description);
    }
    else msgEmbed.setDescription("Default description");

    if (values !== undefined) {
        for (let i = 0; i < fields.length; i++) {
            if (fields[i]['name'].indexOf("!") === 0) fields[i]['name'] = values[fields[i]['name']];
            if (fields[i]['value'].indexOf("!") === 0) fields[i]['value'] = values[fields[i]['value']];
            msgEmbed.addFields(fields[i]);
        }
    }

    return msgEmbed;
}

client.login (token.token);