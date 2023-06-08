const {Client, GatewayIntentBits } = require('discord.js');
const {Player} = require("discord-player");
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ],
});

let player = Player.singleton(client);
let config = require('./assets/config.js');

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
            ping.ping(message);
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
            let play = require("./commands/textCommands/music/play");
            play.play(message);
            break;
        case (prefix + "queue"):
            let queueCommand = require("./commands/textCommands/music/queue");
            queueCommand.queue(message);
            break;
        case (prefix + "skip"):
            let skip = require("./commands/textCommands/music/skip");
            skip.skip(message);
            break;
        case (prefix + "stop"):
            let stop = require("./commands/textCommands/music/stop");
            stop.stop(message);
            break;
        case (prefix + "pause"):
            let pause = require("./commands/textCommands/music/pause");
            pause.pause(message);
            break;
        case (prefix + "resume"):
            let resume = require("./commands/textCommands/music/resume");
            resume.resume(message);
            break;
        case (prefix + "loop"):
            let loop = require("./commands/textCommands/music/loop");
            loop.loop(message);
            break;
        case (prefix + "jdr"):
            let jdr = require("./commands/textCommands/jdr");
            jdr.createPerso(message);
            break;
    }
})

/*
* @TODO :
* resume
* ajout role auto quand un mec join
* */
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