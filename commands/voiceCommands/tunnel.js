let fs = require('fs');
let config = require('../../assets/config.js');
const createEmbed = require('../../assets/createEmbed.js');

function tunnel (client, newUser, userTunnel) {
    console.log ("|- " + newUser.member.user.username + "(#" + newUser.member.user.id + ") entered in a secret tunnel.");
    let listTunnel = [];
    let tunnelSorties = client.channels.cache.filter(channel => channel.name === config['config']['voice channels']['secret tunnel']['S']['name']);
    tunnelSorties.forEach((value, key) => {
        if (value.id !== userTunnel.id) {
            listTunnel.push(value);
        }
    });
    newUser.setChannel(listTunnel[Math.floor(Math.random()*listTunnel.length)])
        .then (() => {
            console.log ("|-- " + newUser.member.user.username + "(#" + newUser.member.user.id + ") get moved to an other secret tunnel.");
        })
        .catch(() => {
            console.log ("|-- " + newUser.member.user.username + "(#" + newUser.member.user.id + ") didn't get moved.");
        });
}

module.exports = {
    tunnel
}