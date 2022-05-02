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

let loadcommands = require ("./assets/laod-commands.js")();
let commands = [];
commands = loadcommands.loadCommands().then(() => {
        console.log("Commands loaded : ")
        console.log(commands);
}).catch(() => {});

client.on("messageCreate", message => {
    let msg = message.content;
    let prefix = config['config']['prefix'];
    let args = msg.split(" ")
    switch(args[0]) {
        case (prefix + "help"):
            let command = require('./commands/help.js');
            command.help(message);
            break;
        case (prefix + "ping"):
            let command = require('./commands/ping.js');
            command.ping(message.channel);
            break;
        case (prefix + "roll"):
            let command = require('./commands/roll.js');
            command.roll(message);
            break;
        case (prefix + "config"):
            let command = require('./commands/config.js');
            command.configCommand(message);
            break;
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