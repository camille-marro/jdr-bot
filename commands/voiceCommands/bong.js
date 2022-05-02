let fs = require('fs');
let config = require('../../assets/config.js');
const createEmbed = require('../../assets/createEmbed.js');

function bong (newUser) {
    let users =  newUser.guild.channels.cache.find(channel => channel.id === config['config']['voice channels']['safety net']['id']).members
    let rand = Math.floor(Math.random()*users.size);
    let i = 0;
    users.forEach((value,key) => {
        if (i == rand) {
            console.log("|- " + newUser.member.user.username + "(#" + newUser.member.user.id + ") tried to help someone in the safety net.");
            value.voice.disconnect()
                .then(() => {
                    console.log("|-- " + newUser.member.user.username + "(#" + newUser.member.user.id + ") helped " + value.user.username + "(#" + value.user.id + ").");
                })
                .catch(() => {
                    console.log("|-- " + newUser.member.user.username + "(#" + newUser.member.user.id + ") cannot help " + value.user.username + "(#" + value.user.id + ").");
                })
        }
        i++;
    });
}

module.exports = {
    bong
}