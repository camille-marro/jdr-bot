const play_dl = require('play-dl');
const { createAudioPlayer, createAudioResource , StreamType, demuxProbe, joinVoiceChannel, NoSubscriberBehavior, AudioPlayerStatus, VoiceConnectionStatus, getVoiceConnection } = require('@discordjs/voice');

let config = require('../../assets/config.js');
const createEmbed = require('../../assets/createEmbed.js');
const fs = require("fs");
const path = require("path");

async function playAudio(message) {
    let rawJSONEmbed = fs.readFileSync(path.resolve(__dirname, '../../json_files/embed_msg/' + config['config']['lang'] + '.json'));
    let JSONEmbed = JSON.parse(rawJSONEmbed);

    let msg = message.content;
    let options = msg.split(" ");

    if (options[1] === "help") {
        let msgPlayHelpEmbed = createEmbed(JSONEmbed['msgPlayHelpEmbed']['color'], JSONEmbed['msgPlayHelpEmbed']['title'], JSONEmbed['msgPlayHelpEmbed']['thumbnail'], JSONEmbed['msgPlayHelpEmbed']['description'], JSONEmbed['msgPlayHelpEmbed']['field'], []);
        message.channel.send({embeds: [msgPlayHelpEmbed]});
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for play command.");
    } else {
        let yt_link = options[1];
        // tester si c'est bien un lien vers une video yt

        let stream = await play_dl.stream(yt_link, {discordPlayerCompatibility: true});

        let channel = message.member.voice.channel;

        let player = createAudioPlayer();
        let resource = createAudioResource(stream.stream, {inputType: stream.type});

        let connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guildId,
            adapterCreator: message.guild.voiceAdapterCreator
        });

        player.play(resource);
        connection.subscribe(player);
    }



}


module.exports = {
    playAudio
}