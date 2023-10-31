let fs = require('fs');
const path = require("path");
const { useQueue, usePlayer} = require('discord-player');
const { EmbedBuilder } = require('discord.js');

let log = require('../../../assets/log');

let playlistData;

try {
    console.log("|-- Loading playlist data from playlist.json ...");
    const rawData = fs.readFileSync(path.resolve(__dirname, "../../../json_files/playlist.json"));
    playlistData = JSON.parse(rawData);
} catch (err) {
    console.log("|-- no file named meme.json found");
    playlistData = false;
}

function updateData() {
    fs.writeFileSync(path.resolve(__dirname, "../../../json_files/playlist.json"), JSON.stringify(playlistData));
    console.log("|-- data successfully updated");
    log.print("jdrData has been successfully updated", 1);
}

function createPlaylist(message) {
    let args = message.content.split(" ");
    let msgEmbed = new EmbedBuilder();

    log.print("Tried to create a new playlist", message.author, message.content);

    //check si playlist data
    if(!playlistData) {
        log.print("Error : no data found for playlist.json", 1);
        msgEmbed.setTitle("Erreur !");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setDescription("Aucunes données trouvées, la commande est inutilisable");
        msgEmbed.setFooter({text:"Pour plus d'informations utiliser la commande \"playlist help\""});

        message.channel.send({embeds: [msgEmbed]});
        log.print("Error message sent", 1);
        return;
    }

    let playlistExist = false;
    playlistData.forEach((playlist) => {
        if(playlist["idDiscord"] === message.author.id) playlistExist = true;
    });

    if (playlistExist) {
        log.print("Error : playlist already exists", 1);
        msgEmbed.setTitle("Erreur !");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setDescription("Vous avez déjà une playlist associée !");
        msgEmbed.setFooter({text:"Pour plus d'informations utiliser la commande \"playlist help\""});

        message.channel.send({embeds: [msgEmbed]});
        log.print("Error message sent", 1);
        return;
    }

    let playlistName = "";
    if (!args[2] || args[2] === "") {
        playlistName = "Ma playlist"
    } else {
        for(let i = 2; i < args.length; i++) playlistName += args[i] + " ";
        playlistName = playlistName.slice(0, -1);
    }

    let newPlaylist = {
        "idDiscord": message.author.id,
        "name": playlistName,
        "tracks": [],
        "random": false
    };

    msgEmbed.setTitle("Playlist créée avec succès !");
    msgEmbed.setColor("#08ff00");
    msgEmbed.setDescription("Nom de votre playlist : **" + playlistName + "**\nPour ajouter des nouvelles musiques dans votre playlist utilisez la commande \"playlist add\".");
    msgEmbed.setFooter({text:"Pour plus d'informations utiliser la commande \"playlist help\""});

    message.channel.send({embeds: [msgEmbed]});

    playlistData.push(newPlaylist);
    log.print("New playlist successfully created", 1);
    updateData();
}

function execute(message) {
    let args = message.content.split(" ");
    if (args[1] === "create") createPlaylist(message);
}

module.exports = {
    execute
}