let fs = require('fs');
let config = require('../../assets/config.js');
const createEmbed = require('../../assets/createEmbed.js');

function mysteryMachine (client, newUser) {
    let channel = client.channels.cache.find(channel => channel.id === config['config']['voice channels']['mystery machine']['id'])//.setPosition(Math.floor(Math.random()*client.channels.cache.filter(channels => channels.guildId === '370599964033679371'.length)));
    let pos = channel.rawPosition;
    let nbVocalChannels = client.channels.cache.filter(channels => channels.guildId === '370599964033679371' && channels.type === 'GUILD_VOICE').size;
    let newPos = Math.floor(Math.random()*nbVocalChannels);
    let channelText = client.channels.cache.find(channel => channel.name === 'conseil-du-sucre');

    console.log("|- " + newUser.member.user.username + "(#" + newUser.member.user.id + ") entered the mystery machine.");

    channel.setPosition(newPos)
        .then(() => {
            console.log("|-- moved mystery machine from #" + pos + " to #" + newPos + ".");
            channelText.send(':red_car: VROUM VOURM :red_car:, <@' + newUser.member.user.id + "> a prit la mystery machine pour aller découvrir le monde    !");
        })
        .catch(() => {
            console.log("|-- mystery machine didn't move.");
        })
}

module.exports = {
    mysteryMachine
}