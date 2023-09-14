let fs = require('fs');

function print(text, user, content) {
    // si user = 1 --> système
    let date = new Date();
    let prefix = "[" + date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + "][" + date.getHours() + "h " + date.getMinutes() + ":" + date.getSeconds() + "]" + " - ";
    if (user === 1) {
        prefix += "[@system]";
    } else {
        prefix += "[@" + user.id + " - " + user.username + "]";
    }

    let commande = "[COMMAND] = " + content;

    let finalStr = prefix + "\n" + text + "\n" + commande + "\n";
    if (content === undefined) finalStr = prefix + "\n" + text + "\n";
    fs.appendFileSync("logs.txt", finalStr);
}

module.exports = {
    print,
}