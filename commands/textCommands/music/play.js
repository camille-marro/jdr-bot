const { useMasterPlayer } = require('discord-player');
const { EmbedBuilder } = require('discord.js');

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

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#23bb95");
    msgEmbed.setTitle("Lecture de sons");
    msgEmbed.setDescription("Permet la lecture de son");

    if (args[1] === "help") {
        msgEmbed.setColor("#6e0e91");
        msgEmbed.addFields({name : "Syntaxe de la commande", value: "play [lien/mots clés"});
        msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
        msgEmbed.addFields({name : "lien/mot clés", value: "Lien de la vidéo ou de la recherche Youtube à jouer", inline: true});
        msgEmbed.addFields({name : "Description de la commande", value: "Permet de lire un son ou de l'ajouter à la queue"});
        message.channel.send({embeds: [msgEmbed]});
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for play command.");
        return;
    }

    if (url._data.playlist) {
        msgEmbed.addFields({ name:"Playlist ajoutée à la queue", value: url._data.playlist.title, inline: true});
        msgEmbed.addFields({ name:"Auteur(s)", value: url._data.playlist.author, inline: true});
        console.log("|-- playlist found ! Playlist added to the queue : " + url._data.playlist.title + " - " + url._data.playlist.author + ".");
    } else {
        msgEmbed.addFields({ name:"Musique ajoutée à la queue", value: url._data.tracks[0].title, inline: true});
        msgEmbed.addFields({ name:"Auteur(s)", value: url._data.tracks[0].author, inline: true});
        console.log("|-- track found ! Track added to the queue : " + url._data.tracks[0].title + " - " + url._data.tracks[0].author + ".");
    }

    message.channel.send({embeds: [msgEmbed]});
}

module.exports = {
    play
}


