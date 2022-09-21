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

    console.log("|- Loading summoners ...");
    let rawJSONSum = fs.readFileSync(path.resolve(__dirname, '../../json_files/ub_data/summoners.json'));
    let JSONSum = JSON.parse(rawJSONSum);

    if (options[1] === "stuff" || options[1] === "item") {
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

        console.log("|- selected boot : " + boot + "(#" + bootNB + ")");
        console.log("|- selected mythic : " + mythic + "(#" + item1NB + ")");
        console.log("|- selected legendary 1 : " + legendary1 + "(#" + item2NB + ")");
        console.log("|- selected legendary 2 : " + legendary2 + "(#" + item3NB + ")");
        console.log("|- selected legendary 3 : " + legendary3 + "(#" + item4NB + ")");
        console.log("|- selected legendary 4 : " + legendary4 + "(#" + item5NB + ")");

        //message.channel.send("**Mythique  : **" + mythic + "\nBottes : " + boot + "\nAutres items :\n" + legendary1 + "\n" + legendary2 + "\n" + legendary3 + "\n" + legendary4);

        let embedOptions = [];
        embedOptions['!mythic'] = mythic;
        embedOptions['!boots'] = boot;
        embedOptions['!legendary1'] = legendary1;
        embedOptions['!legendary2'] = legendary2;
        embedOptions['!legendary3'] = legendary3;
        embedOptions['!legendary4'] = legendary4;
        let msgUBStuffEmbed = createEmbed(JSONEmbed['msgUBStuffEmbed']['color'], JSONEmbed['msgUBStuffEmbed']['title'], JSONEmbed['msgUBStuffEmbed']['thumbnail'], JSONEmbed['msgUBStuffEmbed']['description'], JSONEmbed['msgUBStuffEmbed']['field'], embedOptions)

        message.channel.send({embeds: [msgUBStuffEmbed]});
        return;
    }

    if (options[1] === "champ" || options[1] === "champion") {
        let champNB = Math.floor(Math.random() * 161);
        message.channel.send("Champion à jouer : " + JSONChampions[champNB]["name"].charAt(0).toUpperCase() + JSONChampions[champNB]["name"].slice(1));
        console.log("|- selected champ : " + JSONChampions[champNB]["name"] + "(#" + champNB + ")");

        let embedOptions = [];
        embedOptions['!image'] = JSONChampions[champNB]["image"];
        embedOptions['!champion'] = JSONChampions[champNB]["name"].charAt(0).toUpperCase() + JSONChampions[champNB]["name"].slice(1);
        let msgUBChampEmbed = createEmbed(JSONEmbed['msgUBChampEmbed']['color'], JSONEmbed['msgUBChampEmbed']['title'], JSONEmbed['msgUBChampEmbed']['thumbnail'], JSONEmbed['msgUBChampEmbed']['description'], JSONEmbed['msgUBChampEmbed']['field'], embedOptions)
        message.channel.send({embeds: [msgUBChampEmbed]});

        return;
    }


    let champNB = Math.floor(Math.random() * 161);

    let strStart = "";
    let summoners1NB = Math.floor(Math.random() * 8);
    let summoners2NB = Math.floor(Math.random() * 8);
    if (options[1] === "support") {
        let starterNB = Math.floor(Math.random() * 4);
        strStart = JSONStarters["support"][starterNB]["name"];
        console.log("|- selected starter : " + JSONStarters["support"][starterNB]["name"] + "(#" + starterNB + ")");
        
        while (JSONChampions[champNB]["lane"].indexOf("support") == -1) {
            champNB = Math.floor(Math.random() * 161);
        }
        console.log("|- selected champ : " + JSONChampions[champNB]["name"] + "(#" + champNB + ")");
    }
    else if (options[1] === "jungle") {
        let starterNB = Math.floor(Math.random() * 2);
        strStart = JSONStarters["jungle"][starterNB]["name"];
        console.log("|- selected starter : " + JSONStarters["jungle"][starterNB]["name"] + "(#" + starterNB + ")");
        
        summoners1NB = 8;
        
        while (JSONChampions[champNB]["lane"].indexOf("jungle") == -1) {
            champNB = Math.floor(Math.random() * 161);
        }
        console.log("|- selected champ : " + JSONChampions[champNB]["name"] + "(#" + champNB + ")");
    } else if (options[1] === "mid") {
        let starterNB = Math.floor(Math.random() * 5);
        strStart = JSONStarters["lane"][starterNB]["name"];
        console.log("|- selected starter : " + JSONStarters["lane"][starterNB]["name"] + "(#" + starterNB + ")");
        
        while (JSONChampions[champNB]["lane"].indexOf("mid") == -1) {
            champNB = Math.floor(Math.random() * 161);
        }
        console.log("|- selected champ : " + JSONChampions[champNB]["name"] + "(#" + champNB + ")");
    } else if (options[1] === "top") {
        let starterNB = Math.floor(Math.random() * 5);
        strStart = JSONStarters["lane"][starterNB]["name"];
        console.log("|- selected starter : " + JSONStarters["lane"][starterNB]["name"] + "(#" + starterNB + ")");
        
        while (JSONChampions[champNB]["lane"].indexOf("top") == -1) {
            champNB = Math.floor(Math.random() * 161);
        }
        console.log("|- selected champ : " + JSONChampions[champNB]["name"] + "(#" + champNB + ")");
    } else if (options[1] === "adc") {
        let starterNB = Math.floor(Math.random() * 5);
        strStart = JSONStarters["lane"][starterNB]["name"];
        console.log("|- selected starter : " + JSONStarters["lane"][starterNB]["name"] + "(#" + starterNB + ")");
        
        while (JSONChampions[champNB]["lane"].indexOf("adc") == -1) {
            champNB = Math.floor(Math.random() * 161);
        }
        console.log("|- selected champ : " + JSONChampions[champNB]["name"] + "(#" + champNB + ")");
    } else {
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
    console.log("|- selected summoner 1: " + JSONSum[summoners1NB]["name"] + "(#" + summoners1NB + ")");
    console.log("|- selected summoner 2: " + JSONSum[summoners2NB]["name"] + "(#" + summoners2NB + ")");

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

    let maxSpellNB = Math.floor(Math.random() * 3);
    let maxSpell;
    switch (maxSpellNB) {
        case (0):
            maxSpell = "A";
            console.log("|- selected second max spell : A (#" + maxSpellNB + ")");
            break;
        case (1):
            maxSpell = "Z";
            console.log("|- selected second max spell : Z (#" + maxSpellNB + ")");
            break;
        case (2):
            maxSpell = "E";
            console.log("|- selected second max spell : E (#" + maxSpellNB + ")");
            break;
    }

    let embedOptions = [];
    embedOptions['!champion'] = JSONChampions[champNB]["name"].charAt(0).toUpperCase() + JSONChampions[champNB]["name"].slice(1);
    embedOptions['!image'] = JSONChampions[champNB]["image"];
    embedOptions['!starter'] = strStart;
    embedOptions['!mythic'] = mythic;
    embedOptions['!boots'] = boot;
    embedOptions['!legendary1'] = legendary1;
    embedOptions['!legendary2'] = legendary2;
    embedOptions['!legendary3'] = legendary3;
    embedOptions['!legendary4'] = legendary4;
    embedOptions['!mainRune'] = majRune;
    embedOptions['!minRune1'] = minRune1;
    embedOptions['!minRune2'] = minRune2;
    embedOptions['!minRune3'] = minRune3;
    embedOptions['!secMinRune1'] = secMinRune1;
    embedOptions['!secMinRune2'] = secMinRune2;
    embedOptions['!summoner1'] = JSONSum[summoners1NB]["name"];
    embedOptions['!summoner2'] = JSONSum[summoners2NB]["name"];
    embedOptions['!maxSpell'] = maxSpell;
    let msgUBEmbed = createEmbed(JSONEmbed['msgUBEmbed']['color'], JSONEmbed['msgUBEmbed']['title'], JSONEmbed['msgUBEmbed']['thumbnail'], JSONEmbed['msgUBEmbed']['description'], JSONEmbed['msgUBEmbed']['field'], embedOptions)

    message.channel.send({embeds: [msgUBEmbed]});

}

module.exports = {
    ub
}