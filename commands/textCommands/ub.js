const fs = require("fs");
const path = require("path");

function ub (message) {
    message.channel.send("LANCEMENT D'UNE PARTIE D'ULTIMATE BRAVERY");
    console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") has launched an ultimate bravery game.");

    console.log("|- Loading champions ...");
    let rawJSONChampions = fs.readFileSync(path.resolve(__dirname, '../../json_files/ub_data/champions.json'));
    let JSONChampions = JSON.parse(rawJSONChampions);

    console.log("|- Loading items ...");
    let rawJSONStarters = fs.readFileSync(path.resolve(__dirname, '../../json_files/ub_data/starters.json'));
    let JSONStarters = JSON.parse(rawJSONStarters);
    let rawJSONItems = fs.readFileSync(path.resolve(__dirname, '../../json_files/ub_data/items.json'));
    let JSONItems = JSON.parse(rawJSONItems);

    let champNB = Math.floor(Math.random() * 161);
    message.channel.send("Vous devez jouer : " + JSONChampions[champNB]["name"].charAt(0).toUpperCase() + JSONChampions[champNB]["name"].slice(1));
}

module.exports = {
    ub
}