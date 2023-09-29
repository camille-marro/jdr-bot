let fs = require('fs');
const path = require("path");
const axios = require('axios');

const { EmbedBuilder } = require('discord.js');

const API_KEY = process.env.API_KEY;
let lolData;

try {
    console.log("|-- Loading elo data from lol.json ...");
    const rawData = fs.readFileSync(path.resolve(__dirname, "../../../json_files/lol.json"));
    if (rawData.length === 0) {
        console.log("|-- no data found, cancelling command");
        return;
    } else {
        console.log("|-- data found ! fetching data ...");
        lolData = JSON.parse(rawData);
        console.log("|-- elo data successfully fetched");
    }
} catch (err) {
    // le fichier n'existe pas il faut donc le créer
    // creation fichier
    console.log("|-- no file named lol.json found, cancelling command");
    //fs.writeFileSync(path.resolve(__dirname, "../../json_files/lol.json"), [].toString());
}

function rankToInt(rankText) {
    let args = rankText.split(" ");
    let tier = args[0];
    let rank = args[1];

    switch (tier) {
        case ("IRON"):
            tier = 10;
            break;
        case "BRONZE":
            tier = 20;
            break;
        case "SILVER":
            tier = 30;
            break;
        case "GOLD":
            tier = 40;
            break;
        case "PLATINUM":
            tier = 50;
            break;
        case "EMERALD":
            tier = 60;
            return;
        case "DIAMOND":
            tier = 70;
            break;
        case "MASTER":
            tier = 80;
            break;
        case "GRANDMASTER":
            tier = 90;
            break;
        case "CHALLENGER":
            tier = 100;
            break;
    }

    switch (rank) {
        case "I":
            rank = 4;
            break;
        case "II":
            rank = 3;
            break;
        case "III":
            rank = 2;
            break;
        case "IV":
            rank = 1;
            break;
    }

    return rank+tier;
}

function intToRank(rankInt) {
    let tier = Math.floor(rankInt/10) * 10;
    let rank = rankInt % 10;

    switch (tier) {
        case 10:
            tier = "IRON";
            break;
        case 20:
            tier = "BRONZE";
            break;
        case 30:
            tier = "SILVER";
            break;
        case 40:
            tier = "GOLD";
            break;
        case 50:
            tier = "PLATINUM";
            break;
        case 60:
            tier = "EMERALD";
            break;
        case 70:
            tier = "DIAMOND";
            break;
        case 80:
            tier = "MASTER";
            break;
        case 90:
            tier = "GRANDMASTER";
            break;
        case 100:
            tier = "CHALLENGER";
            break;
    }

    switch (rank) {
        case 4:
            rank = "I";
            break;
        case 3:
            rank = "II";
            break;
        case 2:
            rank = "III";
            break;
        case 1:
            rank = "IV";
            break;
    }

    return (tier + " " + rank);
}

async function execute(currentLiveGames, client) {
    console.log("|- fetching lol data for elo checking")

    let elocheckerData = lolData['elochecker'];
    // check si gain lp etc toutes les 24 h pour l'instant
    let newEntry = false;
    for (let data of elocheckerData) {
        if (data.hasOwnProperty("discord data")) {
            //discord data existe
            const rawDate = new Date();
            let date = rawDate.getDate() + ((rawDate.getMonth()+1)*100);
            if (data["discord data"]['date'] < date) {
                newEntry = true;
                console.log("|-- refreshing data ...");
                let query = await axios.get(`https://euw1.api.riotgames.com/lol/summoner/v4/summoners/${data['summoner data']['id']}?api_key=${API_KEY}`)
                    .then(r => {
                        // r.data == response body
                        data['summoner data'] = r.data;
                        return true;
                    })
                    .catch(e => {
                        if (e.response.data.status.message === "Forbidden") console.log("|-- /!\\API KEY DEPRACTED !");
                        return false;
                    });

                if (!query) continue;
                query = await axios.get(`https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${data['summoner data']['id']}?api_key=${API_KEY}`)
                    .then(r => {
                        data['league data'] = r.data;
                        return true;
                    })
                    .catch(e => {
                        if (e.response.data.status.message === "Forbidden") console.log("|-- /!\\API KEY DEPRACTED !");
                        return false;
                    });
                if (!query) continue;

                query = await axios.get(`https://euw1.api.riotgames.com/tft/league/v1/entries/by-summoner/${data['summoner data']['id']}?api_key=${API_KEY}`)
                    .then(r => {
                        data['tft data'] = r.data;
                        return true;
                    })
                    .catch(e => {
                        if (e.response.data.status.message === "Forbidden") console.log("|-- /!\\API KEY DEPRACTED !");
                        return false;
                    });
                if (!query) continue;

                // maj des discord data
                // maj des ranks et des lp de lol
                let oldRankSolo = data['discord data']['rank solo'];
                let oldRankFlex = data['discord data']['rank flex'];
                let oldLPSolo = data['discord data']['lp solo'];
                let oldLPFlex = data['discord data']['lp flex'];

                let oldNbGameSolo = data['discord data']['nbGame solo'];
                let oldNbGameFlex = data['discord data']['nbGame flex'];

                data['league data'].forEach(ranked => {
                    if (ranked['queueType'] === "RANKED_SOLO_5x5") {
                        data['discord data']['rank solo'] = rankToInt(ranked['tier'] + " " + ranked['rank']);
                        data['discord data']['lp solo'] = ranked['leaguePoints'];
                        data['discord data']['nbGame solo'] = ranked['wins'] + ranked['losses'];
                    } else if (ranked['queueType'] === "RANKED_FLEX_SR") {
                        data['discord data']['rank flex'] = rankToInt(ranked['tier'] + " " + ranked['rank']);
                        data['discord data']['lp flex'] = ranked['leaguePoints'];
                        data['discord data']['nbGame flex'] = ranked['wins'] + ranked['losses'];
                    }
                });

                let msgEmbed = new EmbedBuilder();
                msgEmbed.setColor("#36a969");
                msgEmbed.setTitle(`Rank sur LOL - ${data['summoner data']['name']}`);
                msgEmbed.setDescription("Affiche les changements de rank des utilisateurs");
                msgEmbed.setFooter({text: "Les changements sont mis à jour toutes les 24 heures ou plus si le bot n'a pas été connecté depuis plus longtemps"});

                let lpDiffSolo;
                let lpDiffFlex;

                if (data['discord data']['rank solo'] === 0) {
                    if (data['discord data']['rank flex'] === 0) {
                        msgEmbed.addFields({name:"Aucune ranked trouvée", value:"Ce joueur n'a aucune partie en ranked, ni solo q, ni flex q"});

                        let channel = client.channels.cache.find(channel => channel.name === 'game-lols');
                        channel.send({embeds: [msgEmbed]});

                        data['discord data']['date'] = date;
                        continue;
                    }

                    if (oldRankFlex === data['discord data']['rank flex']) {
                        lpDiffFlex = data['discord data']['lp flex'] - oldLPFlex;
                    } else if (oldRankFlex < data['discord data']['rank flex']) {
                        lpDiffFlex = ((100 - oldLPFlex) + data['discord data']['lp flex']);
                    } else {
                        lpDiffFlex = -(oldLPFlex + (100-data['discord data']['lp flex']));
                    }

                    msgEmbed.addFields({name: "Ancien rank - FLEX Q", value:`${intToRank(oldRankFlex)} (${oldLPFlex})`, inline: true});
                    msgEmbed.addFields({name: "Nouveau rank - FLEX Q", value:`${intToRank(data['discord data']['rank flex'])} (${data['discord data']['lp flex']})`, inline: true});
                    if (lpDiffFlex > 0) {
                        msgEmbed.addFields({name: "Gain de LP", value:("+" + lpDiffFlex + " LP")});
                        msgEmbed.addFields({name: " ", value:" "});
                    } else if (lpDiffFlex < 0 ){
                        msgEmbed.addFields({name: "Perte de LP", value:(lpDiffFlex + " LP")});
                        msgEmbed.addFields({name: " ", value:" "});
                    } else {
                        msgEmbed.addFields({name: "Aucune nouvelle partie", value:" "});
                        msgEmbed.addFields({name: " ", value:" "});
                    }

                    let nbGame = data['discord data']['nbGame flex'] - oldNbGameFlex;
                    msgEmbed.addFields({name:"Nombre de partie(s) jouée(s)", value: `            ${nbGame}`, inline: true});

                    let channel = client.channels.cache.find(channel => channel.name === 'game-lols');
                    channel.send({embeds: [msgEmbed]});

                    data['discord data']['date'] = date;
                    continue;
                } else if (data['discord data']['rank flex'] === 0) {
                    if (data['discord data']['rank solo'] === 0) {
                        msgEmbed.addFields({name:"Aucune ranked trouvée", value:"Ce joueur n'a aucune partie en ranked, ni solo q, ni flex q"});

                        let channel = client.channels.cache.find(channel => channel.name === 'game-lols');
                        channel.send({embeds: [msgEmbed]});

                        data['discord data']['date'] = date;
                        continue;
                    }

                    if (oldRankSolo === data['discord data']['rank solo']) {
                        lpDiffSolo = data['discord data']['lp solo'] - oldLPSolo;
                    } else if (oldRankSolo > data['discord data']['rank solo']) {
                        lpDiffSolo = -(oldLPSolo + (100-data['discord data']['lp solo']));
                    } else {
                        lpDiffSolo = ((100 - oldLPSolo) + data['discord data']['lp solo']);
                    }

                    msgEmbed.addFields({name: "Ancien rank - SOLO Q", value:`${intToRank(oldRankSolo)} (${oldLPSolo})`, inline: true});
                    msgEmbed.addFields({name: "Nouveau rank - SOLO Q", value:`${intToRank(data['discord data']['rank solo'])} (${data['discord data']['lp solo']})`, inline: true});
                    if (lpDiffSolo > 0) {
                        msgEmbed.addFields({name: "Gain de LP", value:("+" + lpDiffSolo + " LP")});
                        msgEmbed.addFields({name: " ", value:" "});
                    } else if (lpDiffSolo < 0 ){
                        msgEmbed.addFields({name: "Perte de LP", value:(lpDiffSolo + " LP")});
                        msgEmbed.addFields({name: " ", value:" "});
                    } else {
                        msgEmbed.addFields({name: "Aucune nouvelle partie", value:" "});
                        msgEmbed.addFields({name: " ", value:" "});
                    }

                    let nbGame = data['discord data']['nbGame solo'] - oldNbGameSolo;
                    msgEmbed.addFields({name:"Nombre de partie(s) jouée(s)", value: `            ${nbGame}`, inline: true});

                    let channel = client.channels.cache.find(channel => channel.name === 'game-lols');
                    channel.send({embeds: [msgEmbed]});

                    data['discord data']['date'] = date;
                    continue;
                }

                if (oldRankSolo === data['discord data']['rank solo']) {
                    lpDiffSolo = data['discord data']['lp solo'] - oldLPSolo;
                } else if (oldRankSolo > data['discord data']['rank solo']) {
                    lpDiffSolo = -(oldLPSolo + (100-data['discord data']['lp solo']));
                } else {
                    lpDiffSolo = ((100 - oldLPSolo) + data['discord data']['lp solo']);
                }

                if (oldRankFlex === data['discord data']['rank flex']) {
                    lpDiffFlex = data['discord data']['lp flex'] - oldLPFlex;
                } else if (oldRankFlex < data['discord data']['rank flex']) {
                    lpDiffFlex = ((100 - oldLPFlex) + data['discord data']['lp flex']);
                } else {
                    lpDiffFlex = -(oldLPFlex + (100 - data['discord data']['lp flex']));
                }

                //envoyer message
                msgEmbed.addFields({name: "Ancien rank - SOLO Q", value:`${intToRank(oldRankSolo)} (${oldLPSolo})`, inline: true});
                msgEmbed.addFields({name: "Nouveau rank - SOLO Q", value:`${intToRank(data['discord data']['rank solo'])} (${data['discord data']['lp solo']})`, inline: true});
                if (lpDiffSolo > 0) {
                    msgEmbed.addFields({name: " ", value:" "});
                    msgEmbed.addFields({name: "Gain de LP", value:("+" + lpDiffSolo + " LP"), inline: true});
                    let nbGame = data['discord data']['nbGame solo'] - oldNbGameSolo;
                    msgEmbed.addFields({name:"Nombre de partie(s) jouée(s)", value: `            ${nbGame}`, inline: true});
                    msgEmbed.addFields({name: " ", value:" "});
                } else if (lpDiffSolo < 0 ){
                    msgEmbed.addFields({name: " ", value:" "});
                    msgEmbed.addFields({name: "Perte de LP", value:(lpDiffSolo + " LP"), inline: true});
                    let nbGame = data['discord data']['nbGame solo'] - oldNbGameSolo;
                    msgEmbed.addFields({name:"Nombre de partie(s) jouée(s)", value: `            ${nbGame}`, inline: true});
                    msgEmbed.addFields({name: " ", value:" "});
                } else {
                    msgEmbed.addFields({name: " ", value:" "});
                    msgEmbed.addFields({name: "Aucune nouvelle partie", value:" "});
                }

                msgEmbed.addFields({name: "Ancien rank - FLEX Q", value:`${intToRank(oldRankFlex)} (${oldLPFlex})`, inline: true});
                msgEmbed.addFields({name: "Nouveau rank - FLEX Q", value:`${intToRank(data['discord data']['rank flex'])} (${data['discord data']['lp flex']})`, inline: true});
                if (lpDiffFlex > 0) {
                    msgEmbed.addFields({name: "Gain de LP", value:("+" + lpDiffFlex + " LP")});
                    msgEmbed.addFields({name: " ", value:" "});
                    let nbGameFlex = data['discord data']['nbGame flex'] - oldNbGameFlex;
                    msgEmbed.addFields({name:"Nombre de partie(s) jouée(s)", value: `            ${nbGameFlex}`, inline: true});
                } else if (lpDiffFlex < 0 ){
                    msgEmbed.addFields({name: "Perte de LP", value:(lpDiffFlex + " LP")});
                    let nbGameFlex = data['discord data']['nbGame flex'] - oldNbGameFlex;
                    msgEmbed.addFields({name:"Nombre de partie(s) jouée(s)", value: `            ${nbGameFlex}`, inline: true});
                    msgEmbed.addFields({name: " ", value:" "});
                } else {
                    msgEmbed.addFields({name: "Aucune nouvelle partie", value:" "});
                    msgEmbed.addFields({name: " ", value:" "});
                }

                let channel = client.channels.cache.find(channel => channel.name === 'game-lols');
                channel.send({embeds: [msgEmbed]});

                console.log("|-- data refreshed and message sent")

                data['discord data']['date'] = date;
            }

        } else {
            console.log("|-- can't refresh data : can't find discord data");
        }


    }

    // maj du fichier lol.json si nouvelle entrée
    if (newEntry) {
        let newLolData = JSON.stringify(lolData);
        fs.writeFileSync(path.resolve(__dirname, "../../../json_files/lol.json"), newLolData);
        console.log("|-- lol.json file successfully updated");
    } else {
        console.log("|-- can't refresh data : last refresh was closer than 1 day long");
    }

    // check les parties en cours
    let liveGames = [];
    let knownIds = [];
    let knownParticipant = [];
    let nbInGame = 0;

    // check si live game pour chaque joueur
    for (let summoner of elocheckerData) {
        let summonerId = summoner['summoner data']['id'];
        knownIds.push(summonerId);
        knownParticipant.push({[summonerId]: [summoner['summoner data'], summoner['league data']]});
        let liveGame = await axios.get(`https://euw1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summonerId}?api_key=${API_KEY}`)
        //let liveGame = await axios.get(`https://euw1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/Mx8KGuEeLRIeEeK46p-UqAbgACC5cml8GSJREx37nh61BaE?api_key=${API_KEY}`)
            .then((r) => {
                //console.log("|-- Data found, summoner in a game");
                nbInGame++;
                return r.data;
            })
            .catch((e) => {
                //console.log("|-- " + e.response.data.status.message + ", summoner not in a game");
                if (e.response.data.status.message === "Forbidden") console.log("|-- /!\\API KEY DEPRACTED !");
                return false;
            });
        if (!liveGame) continue;
        // ajouter game dans livegames
        liveGames.push(liveGame);
    }
    console.log("|-- found " + nbInGame + " summoner(s) in game");

    // si liveGames dans currentLiveGames enlever de liveGames
    let filteredLiveGames = liveGames.filter(liveGame => !currentLiveGames.some(liveGame2 => liveGame.gameId === liveGame2.gameId));

    // on retire les doublons
    filteredLiveGames = filteredLiveGames.filter((liveGame, index) => {
        let firstIndex = filteredLiveGames.findIndex((element) => element.gameId === liveGame.gameId);
        return index === firstIndex;
    });

    console.log("|-- found " + filteredLiveGames.length + " new game(s)");

    // on ajoute les nouvelles aux parties déjà analysées
    filteredLiveGames.forEach(liveGame => {
        currentLiveGames.push(liveGame);
        let participants = [];

        liveGame['participants'].forEach(participant => {
            if (knownIds.includes(participant.summonerId)) {
                participants.push(participant);
                // essayer d'ajouter elo + wr --> recup data from elocheckerData
            }
        });

        let channel = client.channels.cache.find(channel => channel.name === 'game-lols');

        // envoie msg live game

        let msgEmbed = new EmbedBuilder();
        msgEmbed.setColor("#36a969");
        msgEmbed.setTitle("Live game");
        msgEmbed.setDescription("Affiche les utilisateurs qui sont en partie actuellement");
        msgEmbed.setFooter({text:"Commande automatique, seuls certains utilisateurs sont détectés par cette commande"});

        let gameType = " ";
        switch (liveGame['gameType']) {
            case ("CUSTOM_GAME") :
                gameType = "Partie personnalisée";
                break;
            case ("MATCHED_GAME"):
                gameType = "Ranked";
                break;
            case ("TUTORIAL_GAME"):
                gameType = "Tuto";
                break;
        }

        msgEmbed.addFields({name: "Joueur(s) dans la game", value: " ", inline: true});
        msgEmbed.addFields({name: "                      ", value: "                      ", inline: true});
        msgEmbed.addFields({name: gameType, value: liveGame['gameMode'], inline: true});

        participants.forEach(participant => {
            let champions = lolData['champions']['data'];
            let championName;
            for (const championKey in champions) {
                if (parseInt(champions[championKey]['key']) === participant['championId']) championName = champions[championKey]['name'];
            }
            msgEmbed.addFields({name:participant['summonerName'], value:championName, inline: true});
        });

        channel.send({embeds: [msgEmbed]});
    });


    // pour chaque game on va essayer de trouver qui joue

    return currentLiveGames;
}

module.exports = {
    execute
}