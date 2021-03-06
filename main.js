const Discord = require('discord.js');
const {Intents} = require("discord.js");
require('dotenv').config();

const token = require('./assets/token.js');
let config = require('./assets/config.js');

let fs = require('fs');

/* USED FOR HEROKU DEPLOYMENT */
var express = require('express');
var app = express();
app.set('port', (process.env.PORT || 5000));
//For avoidong Heroku $PORT error
app.get('/', function(request, response) {
    var result = 'App is running'
    response.send(result);
}).listen(app.get('port'), function() {
    console.log('App is running, server is listening on port ', app.get('port'));
});

const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"] });

client.on("ready", function() {
    console.log("Connected to Discord server");
     config.printConfig(config.config);
})

client.on("messageCreate", message => {
    let msg = message.content;
    if (msg.toLowerCase().endsWith("quoi") || msg.toLowerCase().endsWith("quoi ?")) {
        message.channel.send("feur ! AHAH TROP MARRANT");
    }
    if (msg.toLowerCase().endsWith("oui") || msg.toLowerCase().endsWith("oui ?")) {
        message.channel.send("ghour AHAH TROP MARRANT");
    }

    let prefix = config['config']['prefix'];
    let args = msg.split(" ")
    switch(args[0]) {
        case (prefix + "help"):
            let help = require('./commands/textCommands/help.js');
            help.help(message);
            break;
        case (prefix + "ping"):
            let ping = require('./commands/textCommands/ping.js');
            ping.ping(message.channel);
            break;
        case (prefix + "roll"):
            let roll = require('./commands/textCommands/roll.js');
            roll.roll(message);
            break;
        case (prefix + "config"):
            let configCommand = require('./commands/textCommands/config.js');
            configCommand.configCommand(message);
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
        let tunnel = require('./commands/voiceCommands/tunnel.js');
        tunnel.tunnel(client, newUser, userTunnel);
    } else

    // channel "exit" qui kick du serv quand on rentre dedans
    if (newUser.channelId === config['config']['voice channels']['kick channel']['id']) {
        let kick = require('./commands/voiceCommands/kick.js');
        kick.kick(client, newUser);
    } else

    // channel "filet de s??curit?? qui empeche d'en sortir"
    if (oldUser.channelId === config['config']['voice channels']['safety net']['id']) {
        let safetyNet = require('./commands/voiceCommands/safety-net.js');
        safetyNet.safetyNet(client, newUser);
    } else
    
    // channel mystery machine qui tansporte le channel al??atoirement dans le serveur
    if (newUser.channelId === config['config']['voice channels']['mystery machine']['id']) {
        let mysteryMachine = require('./commands/voiceCommands/mystery-machine.js');
        mysteryMachine.mysteryMachine(client, newUser);
    } else

    // quand un mec rentre dans le channel grand baton ca disconnect un des mecs dans le filet de s??curit??
    if (newUser.channelId === config['config']['voice channels']['bong']['id']) {
        let bong = require('./commands/voiceCommands/bong.js');
        bong.bong(newUser);
    }
})
client.login (process.env.BOT_TOKEN);
//@TODO : ajouter un truc pour sauvegarder la config en fonction du serveur
// genre en mode guildID.json dans un dossier config
// et ca charge cette config pour le serveur dans chaque fichier de commande
//
// quand le bot d??tecte un message ou un voiceState il doit charger la config en fonction de message.guildID
// ca peut faire ramer ??? peut ??tre essayer de charger la config qu'une seule fois ?