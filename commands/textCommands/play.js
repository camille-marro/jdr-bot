const play_dl = require('play-dl');
const { createAudioPlayer, createAudioResource , StreamType, demuxProbe, joinVoiceChannel, NoSubscriberBehavior, AudioPlayerStatus, VoiceConnectionStatus, getVoiceConnection } = require('@discordjs/voice');
const { OpusEncoder } = require('@discordjs/opus');

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
        /* On vérifie si le lien est dans le bon format */
        let yt_link = options[1];
        let pattern = /^https:\/\/www\.youtube\.com\/watch\?v=[a-zA-Z0-9_-]{11}$/;
        if (!pattern.test(yt_link)) {
            console.log("ce n'est pas un lien vers une vidéo yt, lien donné : " + yt_link);
            return;
        }
        let stream = await play_dl.stream(yt_link, {discordPlayerCompatibility: true}); // on associe le lien au stream pour créer la musique plus tard
        let videosInfos = await play_dl.video_basic_info(yt_link);
        let musicTitle = videosInfos["video_details"]["title"];

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
        } else {
            connection = getVoiceConnection(channel.guildId);
            exist = true;
        }

        let resource = createAudioResource(stream.stream, {inputType: stream.type})
        if (exist) {
            addToQueue(resource, musicTitle, queue, queueInfos);
            return;
        } else {
            player.play(resource);
            connection.subscribe(player);
        }

        /* Quand le bot arrive en IDLE il joue la prochaine musique si elle existe */
        player.on(AudioPlayerStatus.Idle, () => {
            let nextResource = getNextResource(queue, queueInfos);
            if (nextResource) {
                /* On joue la musique */
                player.play(nextResource);
                connection.subscribe(player);
            } else {
                connection.destroy();
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

module.exports = {
    play
}