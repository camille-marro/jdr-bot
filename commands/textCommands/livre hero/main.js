let fs = require('fs');
const path = require("path");

const log = require('../../../assets/log');

const { EmbedBuilder } = require('discord.js');
const { startNewGame } = require('./createPlayer');
const { displayPage } = require("./displayPage");
const { resetMain } = require('./reset');
const {help} = require("./help");

const footer = "Pour plus d'informations utiliser la commande \"help av\"";

let players;
try {
    console.log("|-- Loading data from players.json ...");
    const rawData = fs.readFileSync(path.resolve(__dirname, "../../../json_files/livre hero/players.json"));
    players = JSON.parse(rawData);
} catch (err) {
    console.log("|-- no file named players.json found");
    players = false;
}

/**
 * Charge l'objet du joueur contenu dans data
 * @param {Object}author - Objet Discord de l'auteur du message
 * @returns {null|Object} - Renvoie un objet correspond au joueur s'il est trouvé. Renvoie null sinon
 */
function loadPlayer(author) {
    let i = 0
    while (i < players.length) {
        if (players[i]["discordId"] === author.id.toString()) return players[i];
        i++;
    }
    return null
}

function execute(message) {
    let player = loadPlayer(message.author);
    let args = message.content.split(" ");
    if (args[1] === "start") {
        startNewGame(message, player, players).then();
    } else if (args[1] === "continue") {
        displayPage(player, message, players).then();
    } else if (args[1] === "reset") {
        resetMain(message, player, players);
    } else if (args[1] === "help") {
        help(message);
    }
}

module.exports = {
    execute
}