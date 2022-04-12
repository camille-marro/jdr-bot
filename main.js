const Discord = require('discord.js');
const {Intents} = require("discord.js");

const token = require('./assets/token.js');
const connection = require('./assets/db_connect.js');
const createEmbed = require('./assets/createEmbed.js');
let fs = require('fs');

const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"] });

let config = require('./assets/config.js');
console.log("Current config :");
console.log(config);

client.on("ready", function() {
    console.log("Connected to Discord server");
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

        } //NOT-YET DONE - 1 TODO
        if (msg.indexOf("infos") === 1) { //@TODO : issue avec les id des persos
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
        } //DONE - 1 TODO
        if (msg.indexOf("config") === 1) { //@TODO : check que prefix est de longueur 1
            let options = msg.split(" ")
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
                    let msgConfigLangErrorPrefixEmbed = createEmbed(JSONEmbed['msgConfigLangErrorPrefixEmbed']['color'], JSONEmbed['msgConfigLangErrorPrefixEmbed']['title'], JSONEmbed['msgConfigLangErrorPrefixEmbed']['description'], JSONEmbed['msgConfigLangErrorPrefixEmbed']['field'], [])
                    message.channel.send({embeds: [msgConfigLangErrorPrefixEmbed]});
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
            }
        } //DONE - 1 TODO
        if (msg.indexOf("help") === 1) {
            let msgHelpEmbed = createEmbed(JSONEmbed['msgHelpEmbed']['color'], JSONEmbed['msgHelpEmbed']['title'], JSONEmbed['msgHelpEmbed']['description'], JSONEmbed['msgHelpEmbed']['field'], [])
            message.channel.send({embeds: [msgHelpEmbed]});
        } //DONE
    }
})

//@TODO move all commands into specifics files

client.on("voiceStateUpdate", (oldUser, newUser) => {
    let newChan = newUser.voiceChannel;
    let userId = newUser.id;

    // channels "tunnel secret" qui permettent de sortir dans un autre tunnel random
    let tunnels = client.channels.cache.filter(channel => channel.name === 'tunnel secret E');
    let userTunnel = tunnels.find(channel => channel.id === newUser.channelId);
    if (userTunnel) {
        console.log ("|- " + newUser.member.user.username + "(#" + newUser.member.user.id + ") entered in a secret tunnel.");
        let listTunnel = [];
        let tunnelSorties = client.channels.cache.filter(channel => channel.name === 'tunnel secret S');
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
    }

    // channel "exit" qui kick du serv quand on rentre dedans
    if (newUser.channelId === '961727519608963082') {
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
    if (oldUser.channelId === '961727070092791828') {
        newUser.setChannel(client.channels.cache.find(channel => channel.id === '961727070092791828'))
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
    if (newUser.channelId === '513090608047325184') {
        let channel = client.channels.cache.find(channel => channel.id === '513090608047325184')//.setPosition(Math.floor(Math.random()*client.channels.cache.filter(channels => channels.guildId === '370599964033679371'.length)));
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
    if (newUser.channelId === '961727121888247878') {
        let users =  newUser.guild.channels.cache.find(channel => channel.id === '961727070092791828').members
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