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

    console.log("|- Loading runes ...");
    let rawJSONRunes = fs.readFileSync(path.resolve(__dirname, '../../json_files/ub_data/runes.json'));
    let JSONRunes = JSON.parse(rawJSONRunes);

    if (options[1] === "stuff") {
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

        let boot = JSONItems["boots"][bootNB]["name"];
        let mythic = JSONItems["mythics"][item1NB]["name"];
        let legendary1 = JSONItems["legendaries"][item2NB]["name"];
        let legendary2 = JSONItems["legendaries"][item3NB]["name"];
        let legendary3 = JSONItems["legendaries"][item4NB]["name"];
        let legendary4 = JSONItems["legendaries"][item5NB]["name"];

        console.log("|- selected boot : " + JSONItems["boots"][bootNB]["name"] + "(#" + bootNB + ")");
        console.log("|- selected mythic : " + JSONItems["mythics"][item1NB]["name"] + "(#" + item1NB + ")");
        console.log("|- selected legendary 1 : " + JSONItems["legendaries"][item2NB]["name"] + "(#" + item2NB + ")");
        console.log("|- selected legendary 2 : " + JSONItems["legendaries"][item3NB]["name"] + "(#" + item3NB + ")");
        console.log("|- selected legendary 3 : " + JSONItems["legendaries"][item4NB]["name"] + "(#" + item4NB + ")");
        console.log("|- selected legendary 4 : " + JSONItems["legendaries"][item5NB]["name"] + "(#" + item5NB + ")");

        message.channel.send("Stuff :\n" + mythic + "\n" + boot + "\n" + legendary1 + "\n" + legendary2 + "\n" + legendary3 + "\n" + legendary4);
        return;
    }

    //console.log(JSONRunes);
    //console.log(JSONRunes[4]["subs-2"][2]["name"]);

    let champNB = Math.floor(Math.random() * 161);
    console.log("|- selected champ : " + JSONChampions[champNB]["name"] + "(#" + champNB + ")");

    let strStart = "";
    if (options[1] === "support") {
        message.channel.send("Rôle support !");
        let starterNB = Math.floor(Math.random() * 4);
        strStart = JSONStarters["support"][starterNB]["name"];
        console.log("|- selected starter : " + JSONStarters["support"][starterNB]["name"] + "(#" + starterNB + ")");
    }
    else if (options[1] === "jungle") {
        message.channel.send("Rôle jungle !");
        let starterNB = Math.floor(Math.random() * 2);
        strStart = JSONStarters["jungle"][starterNB]["name"];
        console.log("|- selected starter : " + JSONStarters["jungle"][starterNB]["name"] + "(#" + starterNB + ")");
    }
    else {
        message.channel.send("Rôle top, mid, adc !");
        let starterNB = Math.floor(Math.random() * 5);
        strStart = JSONStarters["lane"][starterNB]["name"];
        console.log("|- selected starter : " + JSONStarters["lane"][starterNB]["name"] + "(#" + starterNB + ")");
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

    let boot = JSONItems["boots"][bootNB]["name"];
    let mythic = JSONItems["mythics"][item1NB]["name"];
    let legendary1 = JSONItems["legendaries"][item2NB]["name"];
    let legendary2 = JSONItems["legendaries"][item3NB]["name"];
    let legendary3 = JSONItems["legendaries"][item4NB]["name"];
    let legendary4 = JSONItems["legendaries"][item5NB]["name"];

    console.log("|- selected boot : " + JSONItems["boots"][bootNB]["name"] + "(#" + bootNB + ")");
    console.log("|- selected mythic : " + JSONItems["mythics"][item1NB]["name"] + "(#" + item1NB + ")");
    console.log("|- selected legendary 1 : " + JSONItems["legendaries"][item2NB]["name"] + "(#" + item2NB + ")");
    console.log("|- selected legendary 2 : " + JSONItems["legendaries"][item3NB]["name"] + "(#" + item3NB + ")");
    console.log("|- selected legendary 3 : " + JSONItems["legendaries"][item4NB]["name"] + "(#" + item4NB + ")");
    console.log("|- selected legendary 4 : " + JSONItems["legendaries"][item5NB]["name"] + "(#" + item5NB + ")");

    let majCatNB = Math.floor(Math.random() * 5);
    let majRuneNB = Math.floor(Math.random() * JSONRunes[majCatNB]["main"].length);
    let majRune = JSONRunes[majCatNB]["main"][majRuneNB]["name"];
    console.log("|- selected main rune: " + JSONRunes[majCatNB]["main"][majRuneNB]["name"] + "(#" + majRuneNB + ")");

    let minRune1NB = Math.floor(Math.random() * JSONRunes[majCatNB]["subs-1"].length);
    let minRune2NB = Math.floor(Math.random() * JSONRunes[majCatNB]["subs-2"].length);
    let minRune3NB = Math.floor(Math.random() * JSONRunes[majCatNB]["subs-3"].length);

    let minRune1 = JSONRunes[majCatNB]["subs-1"][minRune1NB]["name"];
    let minRune2 = JSONRunes[majCatNB]["subs-2"][minRune2NB]["name"];
    let minRune3 = JSONRunes[majCatNB]["subs-3"][minRune3NB]["name"];
    console.log("|- selected sub rune 1 : " + JSONRunes[majCatNB]["subs-1"][minRune1NB]["name"] + "(#" + minRune1NB + ")");
    console.log("|- selected sub rune 2 : " + JSONRunes[majCatNB]["subs-2"][minRune2NB]["name"] + "(#" + minRune2NB + ")");
    console.log("|- selected sub rune 3 : " + JSONRunes[majCatNB]["subs-3"][minRune3NB]["name"] + "(#" + minRune3NB + ")");

    let secMinRuneCat1 = Math.floor(Math.random() * 3); // nb ligne 1 du deuxieme arbre
    let secMinRuneCat2 = Math.floor(Math.random() * 3); // nb ligne 2 du deuxieme arbre
    while (secMinRuneCat1 == secMinRuneCat2) secMinRuneCat1 = Math.floor(Math.random() * 3);
    
    let secMajRuneNB = majCatNB; // nb couleur du deuxieme arbre
    while (secMajRuneNB == majCatNB) secMajRuneNB = Math.floor(Math.random() * 5);

    let secMinRune1;
    let secMinRune2;
    let secMinRune1NB = 0;
    let secMinRune2NB = 0;

    switch (secMinRuneCat1) {
    case (0):
        secMinRune1NB = Math.floor(Math.random() * JSONRunes[secMajRuneNB]["subs-1"].length);
        secMinRune1 = JSONRunes[secMajRuneNB]["subs-1"][secMinRune1NB]["name"];
        console.log("|- selected second sub rune 1 : " + secMinRune1 + "(#" + secMinRune1NB + ")");
        break;
    case (1):
        secMinRune1NB = Math.floor(Math.random() * JSONRunes[secMajRuneNB]["subs-2"].length);
        secMinRune1 = JSONRunes[secMajRuneNB]["subs-2"][secMinRune1NB]["name"];
        console.log("|- selected second sub rune 1 : " + secMinRune1 + "(#" + secMinRune1NB + ")");
        break;
    case (2):
        secMinRune1NB = Math.floor(Math.random() * JSONRunes[secMajRuneNB]["subs-3"].length);
        secMinRune1 = JSONRunes[secMajRuneNB]["subs-3"][secMinRune1NB]["name"];
        console.log("|- selected second sub rune 1 : " + secMinRune1 + "(#" + secMinRune1NB + ")");
        break;
    }

    switch (secMinRuneCat2) {
        case (0):
            secMinRune2NB = Math.floor(Math.random() * JSONRunes[secMajRuneNB]["subs-1"].length);
            secMinRune2 = JSONRunes[secMajRuneNB]["subs-1"][secMinRune2NB]["name"];
            console.log("|- selected second sub rune 2 : " + secMinRune2 + "(#" + secMinRune2NB + ")");
            break;
        case (1):
            secMinRune2NB = Math.floor(Math.random() * JSONRunes[secMajRuneNB]["subs-2"].length);
            secMinRune2 = JSONRunes[secMajRuneNB]["subs-2"][secMinRune2NB]["name"];
            console.log("|- selected second sub rune 2 : " + secMinRune2 + "(#" + secMinRune2NB + ")");
            break;
        case (2):
            secMinRune2NB = Math.floor(Math.random() * JSONRunes[secMajRuneNB]["subs-3"].length);
            secMinRune2 = JSONRunes[secMajRuneNB]["subs-3"][secMinRune2NB]["name"];
            console.log("|- selected second sub rune 2 : " + secMinRune2 + "(#" + secMinRune2NB + ")");
            break;
    }
    
    message.channel.send("Vous devez jouer : " + JSONChampions[champNB]["name"].charAt(0).toUpperCase() + JSONChampions[champNB]["name"].slice(1) + "\n" + "Votre premier item sera : " + strStart + "\n\n Bottes : " + boot + "\n Mythique : " + mythic + "\n\n" + legendary1 + "\n" + legendary2 + "\n" + legendary3 + "\n" + legendary4 + "\n\nVotre rune principale est : " + majRune + "\n\nVos autres runes seront : \n" + minRune1 + "\n" + minRune2 + "\n" + minRune3 + "\n\nLe deuxième arbre sera :\n" + secMinRune1 + "\n" + secMinRune2);
}

module.exports = {
    ub
}