let fs = require('fs');
const path = require("path");

let log = require('../../assets/log');

function printLog(length, message) {
    if (length === undefined) length = 20;
    const logs = fs.readFileSync(path.resolve(__dirname, "../../logs.txt")).toString();

    let msgToSend = "", i = 0;
    logs.split(/\r?\n/).forEach(line => {
        if (i < length) {
            msgToSend += line + "\n";
        }
        i++;
    });
    message.channel.send(msgToSend);
}

function execute(message) {
    let args = message.content.split(" ");

    if (args[1] === "print") {
        printLog(args[2], message);
    } else {

    }
}

module.exports = {
    execute
}