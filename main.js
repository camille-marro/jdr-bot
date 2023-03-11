const Discord = require('discord.js');
const {Intents} = require("discord.js");
require('dotenv').config();

let config = require('./assets/config.js');
const playAudio = require("./commands/textCommands/play");
let queue = [];
let queueInfos = [];

const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"] });
client.on("ready", function() {
    console.log("Connected to Discord server");
    config.printConfig(config.config);
})

client.on("messageCreate", message => {
    let msg = message.content;
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
        case (prefix + "ub"):
            let ub = require('./commands/textCommands/ub.js');
            ub.ub(message);
            break;
        case (prefix + "play"):
            let playAudio = require("./commands/textCommands/play");
            playAudio.play(message, queue, queueInfos);
            break;
        case (prefix + "queue"):
            let queueCommand = require("./commands/textCommands/queue");
            queueCommand.printQueue(message, queueInfos);
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

    // channel "filet de sécurité qui empeche d'en sortir"
    if (oldUser.channelId === config['config']['voice channels']['safety net']['id']) {
        let safetyNet = require('./commands/voiceCommands/safety-net.js');
        safetyNet.safetyNet(client, newUser);
    } else
    
    // channel mystery machine qui tansporte le channel aléatoirement dans le serveur
    if (newUser.channelId === config['config']['voice channels']['mystery machine']['id']) {
        let mysteryMachine = require('./commands/voiceCommands/mystery-machine.js');
        mysteryMachine.mysteryMachine(client, newUser);
    } else

    // quand un mec rentre dans le channel grand baton ca disconnect un des mecs dans le filet de sécurité
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
// quand le bot détecte un message ou un voiceState il doit charger la config en fonction de message.guildID
// ca peut faire ramer ??? peut être essayer de charger la config qu'une seule fois ?