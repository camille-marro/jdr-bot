let fs = require('fs');
let config = require('../../assets/config.js');
const createEmbed = require('../../assets/createEmbed.js');

function kick(client, newUser) {
    console.log(newUser);
    console.log("|- " + newUser.member.user.username + "(#" + newUser.member.user.id + ") entered in the devil channel.")
    let channel = client.channels.cache.find(channel => channel.name === 'conseil-du-sucre');
    channel.send('@here : <@' + newUser.member.user.id + "> est allé dans le salon du démon. AHAHAHAH CETTE SALE MERDE");
    newUser.member.kick({reason: 'PAS DE PO :('})
        .then (() => {
            console.log ("|-- " + newUser.member.user.username + "(#" + newUser.member.user.id + ") get kicked.");
        })
        .catch(() => {
            channel.send('<@' + newUser.member.user.id + "> est un sombre fils de pute, les analyses sont formelles.");
            console.log ("|-- " + newUser.member.user.username + "(#" + newUser.member.user.id + ") didn't get kicked.");
        });
}

module.exports = {
    kick
}