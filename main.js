const Discord = require('discord.js');
const {Intents} = require("discord.js");

const token = require('./assets/token.js');
const connection = require('./assets/db_connect.js');
const createEmbed = require('./assets/createEmbed.js');
let config = require('./assets/config.js');

let fs = require('fs');

const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"] });

client.on("ready", function() {
    console.log("Connected to Discord server");
     config.printConfig(config.config);
})

client.on("messageCreate", message => {
    let msg = message.content;
    if (msg.indexOf(config['config']['prefix']) === 0 ) {
        let rawJSONEmbed = fs.readFileSync("json_files/embed_msg/" + config['config']['lang'] + ".json");
        let JSONEmbed = JSON.parse(rawJSONEmbed);

        if (msg.indexOf("roll") === 1) {
            let msgSyntaxErrorEmbed = createEmbed(JSONEmbed['msgSyntaxErrorEmbed']['color'], JSONEmbed['msgSyntaxErrorEmbed']['title'], JSONEmbed['msgSyntaxErrorEmbed']['description'], JSONEmbed['msgSyntaxErrorEmbed']['field'], []);
            let options = msg.split(" ");
            if (options.length === 1) {
                message.channel.send({embeds: [msgSyntaxErrorEmbed]});
                console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to roll dices.");
                console.log("|-- syntax error");
                console.log("|-- " + message.content);
                return;
            }

            //check si options[1] contient un d avant de faire ça :
            if (!options[1].includes("d")) {
                message.channel.send({embeds: [msgSyntaxErrorEmbed]});
                console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to roll dices.");
                console.log("|-- " + "syntax error");
                console.log("|-- " + message.content);
                return;
            }
            let values = options[1].split("d");

            if (values[0] === '' || values[1] === '') {
                message.channel.send({embeds: [msgSyntaxErrorEmbed]});
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
                message.channel.send({embeds: [msgSyntaxErrorEmbed]});
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
            console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") rolled dices (" + values[0] + "d" + values[1] + ").");
        } //DONE
        /*if (msg.indexOf("reload") === 1) {
            connection.query("SELECT * FROM Personnage", function (err, result, fields) {
                if (err) return console.error(error.message);
                let resultStr = JSON.stringify(result);
                fs.writeFile("personnage.json", resultStr, function (err, result) {
                    let embedOptions = [];
                    embedOptions['!color'] = "#005522";
                    if (config['config']['lang'] === "en") {
                        embedOptions['!status'] = "Successful :)";
                    } else {
                        embedOptions['!status'] = "Réussite :)";
                    }

                    if (err) {
                        console.error(err);
                        //@TODO: passer les options en objet pour gérer l'erreur (dans le embed msg)
                        return;
                    }
                    console.log("personnage.json reloaded.");

                    let msgRefreshDBEmbed = createEmbed(JSONEmbed['msgRefreshDBEmbed']['color'], JSONEmbed['msgRefreshDBEmbed']['title'], JSONEmbed['msgRefreshDBEmbed']['description'], JSONEmbed['msgRefreshDBEmbed']['field'], embedOptions)
                    message.channel.send({embeds: [msgRefreshDBEmbed]});
                });
            });

        }*/ //NOT-YET DONE - 1 TODO
        /*if (msg.indexOf("infos") === 1) { //@TODO : issue avec les id des persos
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
        }*/ //DONE - 1 TODO
        if (msg.indexOf("config") === 1) { //@TODO :
            let options = msg.split(" ")
            if (options[1] === "print") {
                //print config
                config.printConfigEmbed(message.channel);
                config.printConfig();
                console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") printed config");
                return;
            }
            else if (options[1] === "lang") {
                if (options[2] === "fr" || options[2] === "en") {
                    let prevLang = config['config']['lang'];
                    config['config']['lang'] = options[2];
                    config.changeConfig(config.config);

                    let embedOptions = [];
                    embedOptions['!strConfig'] = "prefix : " + config['config']['prefix'] + " - lang : " + config['config']['lang'];

                    let msgConfigLangSuccessEmbed = createEmbed(JSONEmbed['msgConfigLangSuccessEmbed']['color'], JSONEmbed['msgConfigLangSuccessEmbed']['title'], JSONEmbed['msgConfigLangSuccessEmbed']['description'], JSONEmbed['msgConfigLangSuccessEmbed']['field'], embedOptions)
                    message.channel.send({embeds: [msgConfigLangSuccessEmbed]});
                    console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") changed language from " + prevLang + " to " + config['config']['lang']);
                } else {
                    let msgConfigLangErrorLangEmbed = createEmbed(JSONEmbed['msgConfigLangErrorLangEmbed']['color'], JSONEmbed['msgConfigLangErrorLangEmbed']['title'], JSONEmbed['msgConfigLangErrorLangEmbed']['description'], JSONEmbed['msgConfigLangErrorLangEmbed']['field'], [])
                    message.channel.send({embeds: [msgConfigLangErrorLangEmbed]});
                    console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to change language");
                }
            }
            else if (options[1] === "prefix") {
                if (options[2] === undefined) {
                    let msgConfigLangErrorPrefixEmbed = createEmbed(JSONEmbed['msgConfigLangErrorPrefixEmbed']['color'], JSONEmbed['msgConfigLangErrorPrefixEmbed']['title'], JSONEmbed['msgConfigLangErrorPrefixEmbed']['description'], JSONEmbed['msgConfigLangErrorPrefixEmbed']['field'], [])
                    message.channel.send({embeds: [msgConfigLangErrorPrefixEmbed]});
                    console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to change prefix with an empty one");
                    return;
                }
                if (options[2].length > 1) {
                    let msgConfigLangErrorPrefixLengthEmbed= createEmbed(JSONEmbed['msgConfigLangErrorPrefixLengthEmbed']['color'], JSONEmbed['msgConfigLangErrorPrefixLengthEmbed']['title'], JSONEmbed['msgConfigLangErrorPrefixLengthEmbed']['description'], JSONEmbed['msgConfigLangErrorPrefixLengthEmbed']['field'], [])
                    message.channel.send({embeds: [msgConfigLangErrorPrefixLengthEmbed]});
                    console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to change prefix with a too long one");
                    return;
                }
                let prevPrefix = config['config']['prefix'];
                config['config']['prefix'] = options[2];
                config.changeConfig(config.config);

                let embedOptions = [];
                embedOptions['!strConfig'] = "prefix : " + config['config']['prefix'] + " - lang : " + config['config']['lang'];

                let msgConfigLangSuccessEmbed = createEmbed(JSONEmbed['msgConfigLangSuccessEmbed']['color'], JSONEmbed['msgConfigLangSuccessEmbed']['title'], JSONEmbed['msgConfigLangSuccessEmbed']['description'], JSONEmbed['msgConfigLangSuccessEmbed']['field'], embedOptions)
                message.channel.send({embeds: [msgConfigLangSuccessEmbed]});
                console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") chhanged prefix from " + prevPrefix + " to " + config['config']['prefix']);
            }
            else if (options[1] === "channels") {
                let rawJSONEmbed = fs.readFileSync("json_files/embed_msg/" + config['config']['lang'] + ".json");
                let JSONEmbed = JSON.parse(rawJSONEmbed);

                if (options[2] === "secret_tunnel") {
                    if (options[3] === "E") {
                        for (let i = 5; i < options.length; i++) {
                            options[4] += " " + options[i];
                        }
                        let new_channel = message.guild.channels.cache.find(channel => channel.name === options[4]);
                        if (new_channel) {
                            let prevName = config['config']['voice channels']['secret tunnel']['E']['name'];
                            let prevID = config['config']['voice channels']['secret tunnel']['E']['id'];
                            config['config']['voice channels']['secret tunnel']['E']['name'] = new_channel.name;
                            config['config']['voice channels']['secret tunnel']['E']['id'] = new_channel.id;
                            config.changeConfig(config.config);

                            let embedOptions = [];
                            if (config['config']['lang'] === "fr") {
                                embedOptions['!str1'] = "Changement du salon secret_tunnel E";
                                embedOptions['!str2'] = "Le salon d'entrée du tunnel secret est désormais le salon avec le nom " + new_channel.name;
                            } else if (config['config']['lang'] === "en") {
                                embedOptions['!str1'] = "Changing secret_tunnel E channel";
                                embedOptions['!str2'] = "The new name of the secret tunnel entrace is " + new_channel.name;
                            }

                            let msgSuccessConfigVoiceChannelsEmbed = createEmbed(JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['color'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['title'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['description'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['field'], embedOptions)
                            message.channel.send({embeds: [msgSuccessConfigVoiceChannelsEmbed]});


                            console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") changed secret tunnel entrace");
                            console.log("|-- from " + prevName + "(#" + prevID + ") for " + config['config']['voice channels']['secret tunnel']['E']['name'] + "(#" + config['config']['voice channels']['secret tunnel']['E']['id'] + ")");
                            return;
                        } else {
                            //console.log("channel existe pas starf");
                            let msgSyntaxErrorConfigVoiceChannelsEmbed = createEmbed(JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['color'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['title'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['description'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['field'], [])
                            message.channel.send({embeds: [msgSyntaxErrorConfigVoiceChannelsEmbed]});
                            console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to change secret tunnel entrace with an unexisting channel");
                            return;
                        }
                    } else if (options[3] === "S") {
                        for (let i = 5; i < options.length; i++) {
                            options[4] += " " + options[i];
                        }
                        let new_channel = message.guild.channels.cache.filter(channel => channel.name === options[4]);
                        if (new_channel.size == 0) {
                            console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to change secret tunnel exit with an unexisting channel");
                            let msgSyntaxErrorConfigVoiceChannelsEmbed = createEmbed(JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['color'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['title'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['description'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['field'], [])
                            message.channel.send({embeds: [msgSyntaxErrorConfigVoiceChannelsEmbed]});
                            return
                        }
                        let new_channel_ids = [];
                        let prevName = config['config']['voice channels']['secret tunnel']['S']['name'];
                        let prevIDs = config['config']['voice channels']['secret tunnel']['S']['ids'];
                        new_channel.forEach((channel) => {
                            config['config']['voice channels']['secret tunnel']['S']['name'] = channel.name;
                            new_channel_ids.push(channel.id.toString());
                        });
                        config['config']['voice channels']['secret tunnel']['S']['ids'] = new_channel_ids;
                        config.changeConfig(config.config);

                        let embedOptions = [];
                        if (config['config']['lang'] === "fr") {
                            embedOptions['!str1'] = "Changement du salon secret_tunnel S";
                            embedOptions['!str2'] = "Le ou les salon(s) de sortie du tunnel seccret est/sont désormais le/les salon(s) avec le(s) nom(s) " + config['config']['voice channels']['secret tunnel']['S']['name'];
                        } else if (config['config']['lang'] === "en") {
                            embedOptions['!str1'] = "Changing secret_tunnel S channel";
                            embedOptions['!str2'] = "The new name(s) of the secret tunnel exit(s) is/are " + config['config']['voice channels']['secret tunnel']['S']['name'];
                        }
                        let msgSuccessConfigVoiceChannelsEmbed = createEmbed(JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['color'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['title'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['description'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['field'], embedOptions)
                        message.channel.send({embeds: [msgSuccessConfigVoiceChannelsEmbed]});


                        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") change secret tunnel exit");
                        console.log("|-- from " + prevName + "(" + prevIDs + ")");
                        console.log("|-- for " + config['config']['voice channels']['secret tunnel']['S']['name'] + " (" + config['config']['voice channels']['secret tunnel']['S']['ids'] + ")");
                        return;
                    } else {
                        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to change secrets tunnels");
                        let msgSyntaxErrorConfigVoiceChannelsEmbed = createEmbed(JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['color'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['title'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['description'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['field'], [])
                        message.channel.send({embeds: [msgSyntaxErrorConfigVoiceChannelsEmbed]});
                        return;
                    }
                } else if (options[2] === "kick_channel") {
                    for (let i = 4; i < options.length; i++) {
                        options[3] += " " + options[i];
                    }
                    let new_channel = message.guild.channels.cache.find(channel => channel.name === options[3]);
                    if (new_channel) {
                        let prevName = config['config']['voice channels']['kick channel']['name'];
                        let prevID = config['config']['voice channels']['kick channel']['id'];
                        config['config']['voice channels']['kick channel']['name'] = new_channel.name;
                        config['config']['voice channels']['kick channel']['id'] = new_channel.id;
                        config.changeConfig(config.config);

                        let embedOptions = [];
                        if (config['config']['lang'] === "fr") {
                            embedOptions['!str1'] = "Changement du salon kick_channel";
                            embedOptions['!str2'] = "Le salon kick est désormais le salon avec le nom " + new_channel.name;
                        } else if (config['config']['lang'] === "en") {
                            embedOptions['!str1'] = "Changing kick_channel";
                            embedOptions['!str2'] = "The new name of the kick channel is " + new_channel.name;
                        }

                        let msgSuccessConfigVoiceChannelsEmbed = createEmbed(JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['color'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['title'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['description'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['field'], embedOptions)
                        message.channel.send({embeds: [msgSuccessConfigVoiceChannelsEmbed]});


                        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") changed kick channel");
                        console.log("|-- from " + prevName + "(#" + prevID + ") to " + config['config']['voice channels']['kick channel']['name'] + "(#" + config['config']['voice channels']['kick channel']['id'] + ")");
                        return;
                    } else {
                        //console.log("channel existe pas starf");
                        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to change kick channel with an unexisting channel");
                        let msgSyntaxErrorConfigVoiceChannelsEmbed = createEmbed(JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['color'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['title'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['description'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['field'], [])
                        message.channel.send({embeds: [msgSyntaxErrorConfigVoiceChannelsEmbed]});
                        return;
                    }
                } else if (options[2] === "safety_net") {
                    for (let i = 4; i < options.length; i++) {
                        options[3] += " " + options[i];
                    }
                    let new_channel = message.guild.channels.cache.find(channel => channel.name === options[3]);
                    if (new_channel) {
                        let prevName = config['config']['voice channels']['safety net']['name'];
                        let prevID = config['config']['voice channels']['safety net']['id'];
                        config['config']['voice channels']['safety net']['name'] = new_channel.name;
                        config['config']['voice channels']['safety net']['id'] = new_channel.id;
                        config.changeConfig(config.config);

                        let embedOptions = [];
                        if (config['config']['lang'] === "fr") {
                            embedOptions['!str1'] = "Changement du salon safety_net";
                            embedOptions['!str2'] = "Le salon filet de sécurité est désormais le salon avec le nom " + new_channel.name;
                        } else if (config['config']['lang'] === "en") {
                            embedOptions['!str1'] = "Changing safety_net channel";
                            embedOptions['!str2'] = "The new name of the safety net channel is " + new_channel.name;
                        }
                        let msgSuccessConfigVoiceChannelsEmbed = createEmbed(JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['color'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['title'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['description'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['field'], embedOptions)
                        message.channel.send({embeds: [msgSuccessConfigVoiceChannelsEmbed]});


                        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") change safety net");
                        console.log("|-- from " + prevName + "(#" + prevID + ") to " + config['config']['voice channels']['safety net']['name'] + "(#" + config['config']['voice channels']['safety net']['id'] + ")");
                        return;
                    } else {
                        //console.log("channel existe pas starf");
                        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to change safety net with an unexisting channel");
                        let msgSyntaxErrorConfigVoiceChannelsEmbed = createEmbed(JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['color'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['title'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['description'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['field'], [])
                        message.channel.send({embeds: [msgSyntaxErrorConfigVoiceChannelsEmbed]});
                        return;
                    }
                } else if (options[2] === "mystery_machine") {
                    for (let i = 4; i < options.length; i++) {
                        options[3] += " " + options[i];
                    }
                    let new_channel = message.guild.channels.cache.find(channel => channel.name === options[3]);
                    if (new_channel) {
                        let prevName = config['config']['voice channels']['mystery machine']['name'];
                        let prevID = config['config']['voice channels']['mystery machine']['id'];
                        config['config']['voice channels']['mystery machine']['name'] = new_channel.name;
                        config['config']['voice channels']['mystery machine']['id'] = new_channel.id;
                        config.changeConfig(config.config);

                        let embedOptions = [];
                        if (config['config']['lang'] === "fr") {
                            embedOptions['!str1'] = "Changement du salon mystery machine";
                            embedOptions['!str2'] = "Le salon mystery machine est désormais le salon avec le nom " + new_channel.name;
                        } else if (config['config']['lang'] === "en") {
                            embedOptions['!str1'] = "Changing mystery_machine channel";
                            embedOptions['!str2'] = "The new name of mystery machine channel is " + new_channel.name;
                        }

                        let msgSuccessConfigVoiceChannelsEmbed = createEmbed(JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['color'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['title'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['description'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['field'], embedOptions)
                        message.channel.send({embeds: [msgSuccessConfigVoiceChannelsEmbed]});


                        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") change mystery machine");
                        console.log("|-- from " + prevName + "(#" + prevID + ") to " + config['config']['voice channels']['mystery machine']['name'] + "(#" + config['config']['voice channels']['mystery machine']['id'] + ")");
                        return;
                    } else {
                        //console.log("channel existe pas starf");
                        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to mystery machine net with an unexisting channel");
                        let msgSyntaxErrorConfigVoiceChannelsEmbed = createEmbed(JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['color'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['title'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['description'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['field'], [])
                        message.channel.send({embeds: [msgSyntaxErrorConfigVoiceChannelsEmbed]});
                        return;
                    }
                } else if (options[2] === "bong_channel") {
                    for (let i = 4; i < options.length; i++) {
                        options[3] += " " + options[i];
                    }
                    let new_channel = message.guild.channels.cache.find(channel => channel.name === options[3]);
                    if (new_channel) {
                        let prevName = config['config']['voice channels']['bong']['name'];
                        let prevID = config['config']['voice channels']['bong']['id'];
                        config['config']['voice channels']['bong']['name'] = new_channel.name;
                        config['config']['voice channels']['bong']['id'] = new_channel.id;
                        config.changeConfig(config.config);

                        let embedOptions = [];
                        if (config['config']['lang'] === "fr") {
                            embedOptions['!str1'] = "Changement du salon bong_channel";
                            embedOptions['!str2'] = "Le salon bong est désormais le salon avec le nom " + new_channel.name;
                        } else if (config['config']['lang'] === "en") {
                            embedOptions['!str1'] = "Changing bong_channel";
                            embedOptions['!str2'] = "The new name of the bong channel is " + new_channel.name;
                        }

                        let msgSuccessConfigVoiceChannelsEmbed = createEmbed(JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['color'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['title'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['description'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['field'], embedOptions)
                        message.channel.send({embeds: [msgSuccessConfigVoiceChannelsEmbed]});


                        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") change bong");
                        console.log("|-- from " + prevName + "(#" + prevID + ") to " + config['config']['voice channels']['bong']['name'] + "(#" + config['config']['voice channels']['bong']['id'] + ")");
                        return;
                    } else {
                        //console.log("channel existe pas starf");
                        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to change bong with an unexisting channel");
                        let msgSyntaxErrorConfigVoiceChannelsEmbed = createEmbed(JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['color'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['title'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['description'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['field'], [])
                        message.channel.send({embeds: [msgSyntaxErrorConfigVoiceChannelsEmbed]});
                        return;
                    }
                } else {
                    // pas de channel encore créé :/
                    //console.log("yapo");
                    console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to change an unexisting voice channel");
                    let msgSyntaxErrorConfigVoiceChannelsEmbed = createEmbed(JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['color'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['title'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['description'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['field'], [])
                    message.channel.send({embeds: [msgSyntaxErrorConfigVoiceChannelsEmbed]});
                }
            } else {
                let msgConfigLangErrorEmbed = createEmbed(JSONEmbed['msgConfigLangErrorEmbed']['color'], JSONEmbed['msgConfigLangErrorEmbed']['title'], JSONEmbed['msgConfigLangErrorEmbed']['description'], JSONEmbed['msgConfigLangErrorEmbed']['field'], [])
                message.channel.send({embeds: [msgConfigLangErrorEmbed]});
                console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to change configuration");
            }
        } //DONE - 0 TODO
        if (msg.indexOf("help") === 1) {
            //TODO : extension help pour chaque commande ...
            let msgHelpEmbed = createEmbed(JSONEmbed['msgHelpEmbed']['color'], JSONEmbed['msgHelpEmbed']['title'], JSONEmbed['msgHelpEmbed']['description'], JSONEmbed['msgHelpEmbed']['field'], [])
            message.channel.send({embeds: [msgHelpEmbed]});
            console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked for help");
        } //DONE
    }
})

client.on("voiceStateUpdate", (oldUser, newUser) => {
    let newChan = newUser.voiceChannel;
    let userId = newUser.id;

    // channels "tunnel secret" qui permettent de sortir dans un autre tunnel random
    let tunnels = client.channels.cache.filter(channel => channel.name === config['config']['voice channels']['secret tunnel']['E']['name']);
    let userTunnel = tunnels.find(channel => channel.id === newUser.channelId);
    if (userTunnel) {
        console.log ("|- " + newUser.member.user.username + "(#" + newUser.member.user.id + ") entered in a secret tunnel.");
        let listTunnel = [];
        let tunnelSorties = client.channels.cache.filter(channel => channel.name === config['config']['voice channels']['secret tunnel']['S']['name']);
        tunnelSorties.forEach((value, key) => {
            if (value.id !== userTunnel.id) {
                listTunnel.push(value);
            }
        });
        newUser.setChannel(listTunnel[Math.floor(Math.random()*listTunnel.length)])
            .then (() => {
                console.log ("|-- " + newUser.member.user.username + "(#" + newUser.member.user.id + ") get moved to an other secret tunnel.");
            })
            .catch(() => {
                console.log ("|-- " + newUser.member.user.username + "(#" + newUser.member.user.id + ") didn't get moved.");
            });
        return;
    }

    // channel "exit" qui kick du serv quand on rentre dedans
    if (newUser.channelId === config['config']['voice channels']['kick channel']['id']) {
        //console.log (newUser);
        console.log("|- " + newUser.member.user.username + "(#" + newUser.member.user.id + ") entered in the devil channel.")
        let channel = client.channels.cache.find(channel => channel.name === 'conseil-du-sucre');
        //console.log("|- user : " + newUser.member.user.username + " joined channel named : " + newUser. + " (#" + newUser.channelId + ")");
        newUser.member.kick({reason: 'PAS DE PO :('})
            .then (() => {
                channel.send('@here : <@' + newUser.member.user.id + "> est allé dans le salon du démon. AHAHAHAH CETTE SALE MERDE");
                console.log ("|-- " + newUser.member.user.username + "(#" + newUser.member.user.id + ") get kicked.");
            })
            .catch(() => {
                channel.send('<@' + newUser.member.user.id + "> est un sombre fils de pute, les analyses sont formelles.");
                console.log ("|-- " + newUser.member.user.username + "(#" + newUser.member.user.id + ") didn't get kicked.");
            });
    }

    // channel "filet de sécurité qui empeche d'en sortir"
    if (oldUser.channelId === config['config']['voice channels']['safety net']['id']) {
        newUser.setChannel(client.channels.cache.find(channel => channel.id === config['config']['voice channels']['safety net']['id']))
            .then (() => {
                console.log ("|- " + newUser.member.user.username + "(#" + newUser.member.user.id + ") is back in the safety net.");
            })
            .catch(() => {
                console.log ("|- " + newUser.member.user.username + "(#" + newUser.member.user.id + ") disconnected.");
            });
        //console.log(client.channels.cache.find(channel => channel.name === 'The Mistery Machine'));
        //client.channels.cache.find(channel => channel.name === 'The Mistery Machine').setPosition(5);
    }
    
    // channel mystery machine qui tansporte le channel aléatoirement dans le serveur
    if (newUser.channelId === config['config']['voice channels']['mystery machine']['id']) {
        let channel = client.channels.cache.find(channel => channel.id === config['config']['voice channels']['mystery machine']['id'])//.setPosition(Math.floor(Math.random()*client.channels.cache.filter(channels => channels.guildId === '370599964033679371'.length)));
        let pos = channel.rawPosition;
        let nbVocalChannels = client.channels.cache.filter(channels => channels.guildId === '370599964033679371' && channels.type === 'GUILD_VOICE').size;
        let newPos = Math.floor(Math.random()*nbVocalChannels);
        let channelText = client.channels.cache.find(channel => channel.name === 'conseil-du-sucre');

        console.log("|- " + newUser.member.user.username + "(#" + newUser.member.user.id + ") entered the mystery machine.");

        channel.setPosition(newPos)
            .then(() => {
                console.log("|-- moved mystery machine from #" + pos + " to #" + newPos + ".");
                channelText.send(':red_car: VROUM VOURM :red_car:, <@' + newUser.member.user.id + "> a prit la mystery machine pour aller découvrir le monde    !");
            })
            .catch(() => {
                console.log("|-- mystery machine didn't move.");
            })
    }

    // quand un mec rentre dans le channel grand baton ca disconnect un des mecs dans le filet de sécurité
    if (newUser.channelId === config['config']['voice channels']['bong']['id']) {
        let users =  newUser.guild.channels.cache.find(channel => channel.id === config['config']['voice channels']['safety net']['id']).members
        let rand = Math.floor(Math.random()*users.size);
        let i = 0;
        users.forEach((value,key) => {
            if (i == rand) {
                console.log("|- " + newUser.member.user.username + "(#" + newUser.member.user.id + ") tried to help someone in the safety net.");
                value.voice.disconnect()
                    .then(() => {
                        console.log("|-- " + newUser.member.user.username + "(#" + newUser.member.user.id + ") helped " + value.user.username + "(#" + value.user.id + ").");
                    })
                    .catch(() => {
                        console.log("|-- " + newUser.member.user.username + "(#" + newUser.member.user.id + ") cannot help " + value.user.username + "(#" + value.user.id + ").");
                    })
            }
            i++;
       });
    }
})

client.login (token.token);