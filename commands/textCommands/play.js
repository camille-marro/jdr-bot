const play_dl = require('play-dl');
const { createAudioPlayer, createAudioResource , StreamType, demuxProbe, joinVoiceChannel, NoSubscriberBehavior, AudioPlayerStatus, VoiceConnectionStatus, getVoiceConnection } = require('@discordjs/voice');

const fs = require("fs");
const path = require("path");

let config = require('../../assets/config.js');
const createEmbed = require('../../assets/createEmbed.js');

async function play(message, queue, queueInfos) {
    let msg = message.content;
    let channel = message.member.voice.channel;
    let options = msg.split(" ");

    if (options[1] === "help") {
        sendHelp(message);
    } else {
        let link = options[1];
        let youtubePattern = /^(https?:\/\/)?(www\.)?(youtu\.be\/|youtube\.com\/watch\?v=)[\w-]{11}$/;
        let spotifyPattern = /^https:\/\/open\.spotify\.com\/track\/([a-zA-Z0-9]+)$/;

        let stream;
        let musicTitle;

        if (youtubePattern.test(link)) {
            stream = await play_dl.stream(link, {discordPlayerCompatibility: true}); // on associe le lien au stream pour créer la musique plus tard
            let videosInfos = await play_dl.video_basic_info(ylink);
            musicTitle = videosInfos["video_details"]["title"];
        } else if (spotifyPattern.test(link)) {
            let spotify = await play_dl.spotify(link);
            let query = spotify.name + " ";
            spotify.artists.forEach(artist => query += (artist.name + " "));
            let search = await play_dl.search(query, {limit : 1});
            stream = await play_dl.stream(search[0].url);
            musicTitle = search[0].title;
        } else {
            let query = "";
            for (let i = 1; i < options.length; i++) {
                query += (" " + options[i]);
            }
            let search = await play_dl.search(query, {limit : 1});
            console.log(query);
            stream = await play_dl.stream(search[0].url);
            musicTitle = search[0].title;
        }


        /* On crée le player pour lire et jouer les musiques*/
        let player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play
            }
        });

        /* On vérifie si le bot est connecté à un salon, si oui on récupère cette connexion, sinon on le connecte au salon dans lequel l'utilisateur est*/
        let connection;
        let exist = false;
        if (getVoiceConnection(channel.guildId) === undefined) {
            connection = connect(message);
            console.log("|- the bot just connected to the channel (#" + channel.id + ") named : " + channel.name + ".");
        } else {
            connection = getVoiceConnection(channel.guildId);
            exist = true;
        }

        let resource = createAudioResource(stream.stream, {inputType: stream.type})
        if (exist) {
            addToQueue(resource, musicTitle, queue, queueInfos);
            console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") added a music to the queue.");
            message.channel.send("Ajout de " + musicTitle + " à la queue");
            return;
        } else {
            player.play(resource);
            connection.subscribe(player);
            console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") start a new music : " + musicTitle);
            message.channel.send("Lecture de : " + musicTitle);
        }

        /* Quand le bot arrive en IDLE il joue la prochaine musique si elle existe */
        player.on(AudioPlayerStatus.Idle, () => {
            let nextResource = getNextResource(queue, queueInfos);
            if (nextResource) {
                /* On joue la musique */
                player.play(nextResource);
                connection.subscribe(player);
                console.log("|- the bot strated the next music.");
            } else {
                connection.destroy(); // le mettre en try catch
                console.log("|- the bot left the channel because there was no more music to play.");
            }
        });

        /* ------------------------------------------------------------------ */
        /* Need this part to play audio for more than 1 minute */

        const networkStateChangeHandler = (oldNetworkState, newNetworkState) => {
            const newUdp = Reflect.get(newNetworkState, 'udp');
            clearInterval(newUdp?.keepAliveInterval);
        }

        connection.on('stateChange', (oldState, newState) => {
            const oldNetworking = Reflect.get(oldState, 'networking');
            const newNetworking = Reflect.get(newState, 'networking');

            oldNetworking?.off('stateChange', networkStateChangeHandler);
            newNetworking?.on('stateChange', networkStateChangeHandler);
        });
        /* ------------------------------------------------------------------ */

    }
}

function connect(message) {
    let channel = message.member.voice.channel;
    return (joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guildId,
            adapterCreator: message.guild.voiceAdapterCreator
        })
    )
}

function getNextResource(queue, queueInfos) {
    queueInfos.shift();
    return (queue.shift())
}

function addToQueue(newResource, musicTitle, queue, queueInfos) {
    queue.push(newResource);
    queueInfos.push(musicTitle);
}

function sendHelp(message) {
    let rawJSONEmbed = fs.readFileSync(path.resolve(__dirname, '../../json_files/embed_msg/' + config['config']['lang'] + '.json'));
    let JSONEmbed = JSON.parse(rawJSONEmbed);

    let msgPlayHelpEmbed = createEmbed(JSONEmbed['msgPlayHelpEmbed']['color'], JSONEmbed['msgPlayHelpEmbed']['title'], JSONEmbed['msgPlayHelpEmbed']['thumbnail'], JSONEmbed['msgPlayHelpEmbed']['description'], JSONEmbed['msgPlayHelpEmbed']['field'], []);
    message.channel.send({embeds: [msgPlayHelpEmbed]});
    console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for play command.");
}

function skip (message, queue, queueInfos) {
    let nextResource = getNextResource(queue, queueInfos);

    let connection = getVoiceConnection(message.channel.guildId);
    let player = createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Play
        }
    });

    player.play(nextResource);
    connection.subscribe(player);
    console.log("|- the bot strated the next music.");

    message.channel.send("musique passée, début de la prochaine !");
}

function stop (message) {
    let connection = getVoiceConnection(message.channel.guildId);
    connection.destroy();
    console.log("|- stoping music");
    message.channel.send("ok c'est bon j'arrete");
}

module.exports = {
    play, skip, stop
}