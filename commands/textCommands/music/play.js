const { useMasterPlayer } = require('discord-player');

async function play(message) {
    const player = useMasterPlayer();
    await player.extractors.loadDefault();

    let msg = message.content;
    let args = msg.split(" ");

    let query = "";
    for (let i = 1; i < args.length; i++) {
        query += (" " + args[i]);
    }

    console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to play this music : " + query);

    let voiceChannel = message.member.voice.channel;

    let url = await player.search(query);
    await player.play(voiceChannel, url, {leaveOnEmpty: true});

    if (url._data.playlist) {
        message.channel.send("La playlist : " + url._data.playlist.title + " - " + url._data.playlist.author + " a été ajouté à la queue.");
        console.log("|-- playlist found ! Playlist added to the queue.");
    } else {
        message.channel.send("La musique : " + url._data.tracks[0].title + " - " + url._data.tracks[0].author + " a été ajouté à la queue.")
        console.log("|-- track found ! Track added to the queue.");
    }
}

module.exports = {
    play
}


