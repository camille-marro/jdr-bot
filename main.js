const path = require("node:path");
const fs = require("node:fs");

const {Client, Collection, GatewayIntentBits, Events} = require('discord.js');
const { clearImages} = require("./assets/clear_images");
let log = require('./assets/log');

require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ]
});

let config = require('./assets/config.js');

/*
const elochecker = require("./commands/textCommands/lol/elochecker");

client.on("ready", function() {
    // elo checker command each 60 000 ms = 60s = 1m
    let elochecker = require('./commands/textCommands/lol/elochecker');
    let currentLiveGames = [];
    elochecker.execute(currentLiveGames, client);
    const interval = setInterval(() => {
        elochecker.execute(currentLiveGames, client)
            .then((r) => {
                currentLiveGames = r
                console.log("|-- successfully fecthed and sent data");
            });
    }, 60000);
});
*/

client.on("messageCreate", async message => {
    let msg = message.content;
    let prefix = config['config']['prefix'];
    let args = msg.split(" ");

    switch (args[0]) {
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
            let ub = require('./commands/textCommands/lol/ub.js');
            ub.execute(message);
            break;
        case (prefix + "play"):
            let play = require("./commands/textCommands/music/play");
            play.play(message).then(() => "");
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
        case (prefix + "remove"):
            let remove = require("./commands/textCommands/music/remove");
            remove.remove(message);
            break;
        case (prefix + "jdr"):
            let jdr = require("./commands/textCommands/jdr");
            jdr.execute(message);
            break;
        case (prefix + "film"):
            let film = require("./commands/textCommands/movie");
            film.execute(message);
            break;
        case (prefix + "meme"):
            let meme = require("./commands/textCommands/meme");
            meme.execute(message);
            break;
        case (prefix + "rank"):
            let rank = require("./commands/textCommands/lol/rank");
            rank.execute(message).then(() => "");
            break;
        case (prefix + "update"):
            let update = require("./commands/textCommands/lol/udpate");
            update.execute(message);
            break;
        case (prefix + "log"):
            let logs = require("./commands/textCommands/log");
            logs.execute(message);
            break;
        case (prefix + "game"):
            let game = require("./commands/textCommands/game");
            game.execute(message);
            break;
        case (prefix + "p"):
            let pGame = require("./commands/textCommands/pokemon/main");
            pGame.execute(message);
            break;
        case (prefix + "pokemon"):
            let pokemonGame = require("./commands/textCommands/pokemon/main");
            pokemonGame.execute(message);
            break;
        case (prefix + "av"):
            let aventure = require("./commands/textCommands/livre hero/main");
            aventure.execute(message);
            break;
        case (prefix + "imagine"):
            let imagine = require("./commands/textCommands/imagine/main");
            imagine.execute(message);
            break;
    }
});

/*
client.on("voiceStateUpdate", (oldUser, newUser) => {
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

    // channel "filet de sécurité qui empêche d'en sortir"
    if (oldUser.channelId === config['config']['voice channels']['safety net']['id']) {
        let safetyNet = require('./commands/voiceCommands/safety-net.js');
        safetyNet.safetyNet(client, newUser);
    } else

    // channel mystery machine qui transporte le channel aléatoirement dans le serveur
    if (newUser.channelId === config['config']['voice channels']['mystery machine']['id']) {
        let mysteryMachine = require('./commands/voiceCommands/mystery-machine.js');
        mysteryMachine.mysteryMachine(client, newUser);
    } else

    // quand un mec rentre dans le channel grand baton ça disconnect un des mecs dans le filet de sécurité
    if (newUser.channelId === config['config']['voice channels']['bong']['id']) {
        let bong = require('./commands/voiceCommands/bong.js');
        bong.bong(newUser);
    }
});*/


client.on("ready", () => {
    let game = require("./commands/textCommands/game");
    //game.loadOfflineLoots(client);

    //console.log("loading offlines loots");
})

client.login(process.env.BOT_TOKEN)
    .then(r => {
        console.log("|- Connected to Discord server");
        config.printConfig(config.config);
        log.print("Connected to Discord server", 1);
        //clearImages();
        log.print("AI generated images cleared", 1);
    })
    .catch(e => {
        console.log("|- Can't login : verify discord token");
        console.error(e);
        log.print("Can't login : verify discord token", 1, e);
    });

module.exports = {
    client
}
