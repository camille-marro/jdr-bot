const fs = require("fs");
const path = require("path");
let config = require('../../assets/config.js');
const createEmbed = require('../../assets/createEmbed.js');

function ub (message) {
    let msg = message.content;
    let options = msg.split(" ");

    let rawJSONEmbed = fs.readFileSync(path.resolve(__dirname, '../../json_files/embed_msg/' + config['config']['lang'] + '.json'));
    let JSONEmbed = JSON.parse(rawJSONEmbed);

    if (options[1] === "help") {
        let msgRollUBEmbed = createEmbed(JSONEmbed['msgRollUBEmbed']['color'], JSONEmbed['msgRollUBEmbed']['title'], JSONEmbed['msgRollUBEmbed']['thumbnail'], JSONEmbed['msgRollUBEmbed']['description'], JSONEmbed['msgRollUBEmbed']['field'], []);
        message.channel.send({embeds: [msgRollUBEmbed]});
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for an UB game.");
        return;
    }

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

    let strStart = "";
    if (options[1] === "support") {
        message.channel.send("Rôle support !");
        let starterNB = Math.floor(Math.random() * 4);
        strStart = JSONStarters["support"][starterNB]["name"];
    }
    else if (options[1] === "jungle") {
        message.channel.send("Rôle jungle !");
        let starterNB = Math.floor(Math.random() * 2);
        strStart = JSONStarters["jungle"][starterNB]["name"];
    }
    else {
        message.channel.send("Rôle top, mid, adc !");
        let starterNB = Math.floor(Math.random() * 5);
        strStart = JSONStarters["lane"][starterNB]["name"];
    }

    let item1NB = Math.floor(Math.random() * 25);
    let item2NB = Math.floor(Math.random() * 62);
    let item3NB = Math.floor(Math.random() * 62);
    let item4NB = Math.floor(Math.random() * 62);
    let item5NB = Math.floor(Math.random() * 62);
    let bootNB = Math.floor(Math.random() * 7);

    while (item2NB == item3NB || item2NB == item4NB || item2NB == item5NB || item3NB == item4NB || item3NB == item5NB || item4NB == item5NB) {
        item2NB = Math.floor(Math.random() * 62);
        item3NB = Math.floor(Math.random() * 62);
        item4NB = Math.floor(Math.random() * 62);
        item5NB = Math.floor(Math.random() * 62);
    }

    console.log(item2NB + " " + item3NB + " " + item4NB + " " + item5NB);
    let boot = JSONItems["boots"][bootNB]["name"];
    let mythic = JSONItems["mythics"][item1NB]["name"];
    let legendary1 = JSONItems["legendaries"][item2NB]["name"];
    let legendary2 = JSONItems["legendaries"][item3NB]["name"];
    let legendary3 = JSONItems["legendaries"][item4NB]["name"];
    let legendary4 = JSONItems["legendaries"][item5NB]["name"];

    console.log(legendary1 + " " + legendary2 + " " + legendary3 + " " + legendary4);

    message.channel.send("Vous devez jouer : " + JSONChampions[champNB]["name"].charAt(0).toUpperCase() + JSONChampions[champNB]["name"].slice(1) + "\n" + "Votre premier item sera : " + strStart + "\n\n Bottes : " + boot + "\n Mythique : " + mythic + "\n\n" + legendary1 + "\n" + legendary2 + "\n" + legendary3 + "\n" + legendary4);
}

module.exports = {
    ub
}