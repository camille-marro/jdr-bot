let config = require('../../assets/config');

const play_dl = require('play-dl');
const { createAudioPlayer, createAudioResource , StreamType, demuxProbe, joinVoiceChannel, NoSubscriberBehavior, AudioPlayerStatus, VoiceConnectionStatus, getVoiceConnection } = require('@discordjs/voice');
async function playAudio(message) {
    let msg = message.content;
    let options = msg.split(" ");
    let yt_link = options[1];

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


module.exports = {
    playAudio
}