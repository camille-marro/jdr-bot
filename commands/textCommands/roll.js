let fs = require('fs');
let config = require('../../assets/config.js');
const createEmbed = require('../../assets/createEmbed.js');
const path = require("path");

function roll (message) {
    let rawJSONEmbed = fs.readFileSync(path.resolve(__dirname, '../../json_files/embed_msg/' + config['config']['lang'] + '.json'));let JSONEmbed = JSON.parse(rawJSONEmbed);

    let msg = message.content;
    let msgSyntaxErrorEmbed = createEmbed(JSONEmbed['msgSyntaxErrorEmbed']['color'], JSONEmbed['msgSyntaxErrorEmbed']['title'], JSONEmbed['msgSyntaxErrorEmbed']['description'], JSONEmbed['msgSyntaxErrorEmbed']['field'], []);
    let options = msg.split(" ");

    if (options[1] === "help") {
        let msgRollHelpEmbed = createEmbed(JSONEmbed['msgRollHelpEmbed']['color'], JSONEmbed['msgRollHelpEmbed']['title'], JSONEmbed['msgRollHelpEmbed']['description'], JSONEmbed['msgRollHelpEmbed']['field'], []);
        message.channel.send({embeds: [msgRollHelpEmbed]});
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for roll command.");
        return;
    }

    if (options.length === 1) {
        message.channel.send({embeds: [msgSyntaxErrorEmbed]});
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to roll dices.");
        console.log("|-- syntax error");
        console.log("|-- " + message.content);
        return;
    }

    //check si options[1] contient un d avant de faire ça :
    if (!options[1].includes("d")) {
        message.channel.send({embeds: [msgSyntaxErrorEmbed]});
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to roll dices.");
        console.log("|-- " + "syntax error");
        console.log("|-- " + message.content);
        return;
    }
    let values = options[1].split("d");

    if (values[0] === '' || values[1] === '') {
        message.channel.send({embeds: [msgSyntaxErrorEmbed]});
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to roll dices.");
        console.log("|-- " + "syntax error");
        console.log("|-- " + message.content);
        return;
    }

    //check si values[0] et values[1] sont au bon format c'est à dire des chiffres
    let checkFormat = /^[0-9]+$/gm;
    let checkFormat2 = /^[0-9]+$/gm;
    let check = checkFormat.test(values[0]);
    let check2 = checkFormat2.test(values[1]);

    if (!check || !check2) {
        message.channel.send({embeds: [msgSyntaxErrorEmbed]});
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to roll dices.");
        console.log("|-- " + "syntax error");
        console.log("|-- " + message.content);
        return;
    }

    let list = [];
    let sum = 0;

    for (let i = 0; i < values[0]; i++) {
        let number = Math.floor(Math.random() * parseInt(values[1])) + 1;
        list.push(number);
        sum += number;
    }

    let strMain = 'Rolling ' + values[0] + ' dice(s) ' + values[1];
    let strSum = 'Sum : ' + sum;
    let strRollsList = list.toString();

    let average = 0;
    for (let i = 0; i < list.length; i++) {
        average += list[i];
    }

    average = average / list.length;
    let embedOptions = [];
    embedOptions['!strMain'] = strMain;
    embedOptions['!strSum'] = strSum;
    embedOptions['!strRollsList'] = strRollsList;
    embedOptions['!average'] = average.toString();
    let msgRolledDiceEmbed = createEmbed(JSONEmbed['msgRolledDiceEmbed']['color'], JSONEmbed['msgRolledDiceEmbed']['title'], JSONEmbed['msgRolledDiceEmbed']['description'], JSONEmbed['msgRolledDiceEmbed']['field'], embedOptions)

    message.channel.send({embeds: [msgRolledDiceEmbed]});
    console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") rolled dices (" + values[0] + "d" + values[1] + ").");
}
module.exports = {
    roll
}