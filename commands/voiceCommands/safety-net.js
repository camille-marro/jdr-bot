let fs = require('fs');
let config = require('../../assets/config.js');
const createEmbed = require('../../assets/createEmbed.js');

function safetyNet (client, newUser) {
    newUser.setChannel(client.channels.cache.find(channel => channel.id === config['config']['voice channels']['safety net']['id']))
        .then (() => {
            console.log ("|- " + newUser.member.user.username + "(#" + newUser.member.user.id + ") is back in the safety net.");
        })
        .catch(() => {
            console.log ("|- " + newUser.member.user.username + "(#" + newUser.member.user.id + ") disconnected.");
        });
}

module.exports = {
    safetyNet
}

/*
@TODO : check pas juste un event mais que quand un mec déco
genre la quand tu fais un stream il spam le console log back in safety net
 */