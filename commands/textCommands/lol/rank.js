const axios = require('axios');
const path = require("path");

const { EmbedBuilder } = require('discord.js');

const API_KEY = process.env.API_KEY;

async function rank(message, region) {
    let args = message.content.split(" ");

    let summonerName = "";
    let i;
    if (region !== "") i = 2;
    else {
        i = 1;
        region = "euw1";
    }

    for (i; i < args.length; i++) {
        summonerName += (" " + args[i]);
    }

    console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked for lol data about : " + summonerName);

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#d2b915");
    msgEmbed.setTitle("Rank de " + summonerName);
    msgEmbed.setDescription("Affiche le rang lol d'un joueur en fonction de son pseudo sur le jeu");
    msgEmbed.setFooter({text:"Pour plus d'informations utiliser la commande \"rank help\""});

    console.log("|-- fetching data for summoner : " + summonerName + " | from : " + region);
    let dataFound = true;
    let summonerId;
    await axios.get(`https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${API_KEY}`)
        .then((r) => {
            summonerId = r.data.id;
            console.log("|-- Summoner found ! id : " + summonerId);
        })
        .catch((error) => {
            console.log("|-- " + error.response.data.status.message);
            msgEmbed.setColor("#ff0000");
            msgEmbed.addFields({name:"Erreur dans le nom d'invocateur", value: `Ce nom d'invocateur n'existe pas dans la region ${region} !`});
            message.channel.send({embeds: [msgEmbed]});

            dataFound = false;
        });


    if (!dataFound) {
        return;
    }

    console.log("|-- fetching summoner data ...");

    dataFound = true;
    let rankedData;
    await axios.get(`https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${API_KEY}`)
        .catch((error) => {
            console.log("|-- " + error.response.data.status.message);
            dataFound = false;
        })
        .then((r) => {
            console.log("|-- data found !");
            rankedData = r;
        });

    if (!dataFound) {
        return;
    }

    let winS, winF, totalgamesS, winRS, totalgamesF, winRF, tierS, tierF, rankS, rankF, lpS, lpF;

    if (rankedData.data[0].queueType === "RANKED_SOLO_5x5") {
        winS = rankedData.data[0].wins;

        totalgamesS = winS + rankedData.data[0].losses;
        winRS = winS / totalgamesS * 100;

        tierS = rankedData.data[0].tier;
        rankS = rankedData.data[0].rank;

        lpS = rankedData.data[0].leaguePoints;

        // check if flex q
        if (!rankedData.data[1]) {
            msgEmbed.setThumbnail('attachment://' + "emblem-" + rankedData.data[0].tier.toLowerCase() + ".png");

            msgEmbed.addFields({name:"**Rank en SOLO Q**", value: " "});
            msgEmbed.addFields({name: tierS, value: rankS, inline: true});
            msgEmbed.addFields({name:`${winS} / ${totalgamesS}`, value: `${winRS.toPrecision(4)}% wr`, inline: true});
            msgEmbed.addFields({name: "LP", value: lpS.toString(), inline: true});

            message.channel.send({embeds: [msgEmbed], files: [path.resolve(__dirname, "../../../assets/lol/emblems/emblem-" + tierS.toLowerCase() + ".png")]});

            console.log("|-- summoner only plays solo q");
            console.log("|-- summoner data successfully sent");
            return;
        }

        winF = rankedData.data[1].wins;

        totalgamesF = winF + rankedData.data[1].losses;
        winRF = winF / totalgamesF * 100;

        tierF = rankedData.data[1].tier;
        rankF = rankedData.data[1].rank;

        lpF = rankedData.data[1].leaguePoints;
    } else {
        winF = rankedData.data[0].wins;

        totalgamesF = winF + rankedData.data[0].losses;
        winRF = winF / totalgamesF * 100;

        tierF = rankedData.data[0].tier;
        rankF = rankedData.data[0].rank;

        lpF = rankedData.data[0].leaguePoints;

        //check if solo q
        if (!rankedData.data[1]) {
            msgEmbed.setThumbnail('attachment://' + "emblem-" + rankedData.data[0].tier.toLowerCase() + ".png");

            msgEmbed.addFields({name:`**Rank en Flex Q**`, value: " "});
            msgEmbed.addFields({name: tierF, value: rankF, inline: true});
            msgEmbed.addFields({name:`${winF} / ${totalgamesF}`, value: `${winRF.toPrecision(4)}% wr`, inline: true});
            msgEmbed.addFields({name: "LP", value: lpF.toString(), inline: true});

            message.channel.send({embeds: [msgEmbed], files: [path.resolve(__dirname, "../../../assets/lol/emblems/emblem-" + tierS.toLowerCase() + ".png")]});

            console.log("|-- summoner only plays flex q");
            console.log("|-- summoner data successfully sent");
            return;
        }

        winS = rankedData.data[1].wins;

        totalgamesS = winS + rankedData.data[1].losses;
        winRS = winS / totalgamesS * 100;

        tierS = rankedData.data[1].tier;
        rankS = rankedData.data[1].rank;

        lpS = rankedData.data[1].leaguePoints;
    }

    msgEmbed.setThumbnail('attachment://' + "emblem-" + rankedData.data[0].tier.toLowerCase() + ".png");
    msgEmbed.addFields({name:"**Rank en SOLO Q**", value: " "});
    msgEmbed.addFields({name: tierS, value: rankS, inline: true});
    msgEmbed.addFields({name:`${winS} / ${totalgamesS}`, value: `${winRS.toPrecision(4)}% wr`, inline: true});
    msgEmbed.addFields({name: "LP", value: lpS.toString(), inline: true});
    msgEmbed.addFields({name:`**Rank en Flex Q**`, value: " "});
    msgEmbed.addFields({name: tierF, value: rankF, inline: true});
    msgEmbed.addFields({name:`${winF} / ${totalgamesF}`, value: `${winRF.toPrecision(4)}% wr`, inline: true});
    msgEmbed.addFields({name: "LP", value: lpF.toString(), inline: true});

    message.channel.send({embeds: [msgEmbed], files: [path.resolve(__dirname, "../../../assets/lol/emblems/emblem-" + tierS.toLowerCase() + ".png")]});
    console.log("|-- summoner data successfully sent");
}

function help(message) {
    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#6e0e91");
    msgEmbed.setTitle("Rank de nom d'invocateur");
    msgEmbed.setDescription("Affiche le rang lol d'un joueur en fonction de son pseudo sur le jeu");
    msgEmbed.setFooter({text:"Pour plus d'informations utiliser la commande \"rank help\""});

    msgEmbed.addFields({name : "Syntaxe de la commande", value: "rank [region:euw1]"});
    msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
    msgEmbed.addFields({name : "region:euw1", value: "Region dans laquelle chercher le nom d'invocateur. Par défaut : euw1", inline: true});
    msgEmbed.addFields({name : "Description de la commande", value: "Permet d'afficher le rang et diverses informations sur un joueur lol en fonction de son nom d'invocateur."});
    msgEmbed.addFields({name : "Valeurs du paramètre region", value: "br1, eun1, euw1, jp1, kr, la1, la2, na1, oc1, tr1, ru, ph2, sg2, th2, tw2, vn2, americas, asia, europe, sea"});
    message.channel.send({embeds: [msgEmbed]});
    console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for rank command.");
}

async function execute(message) {
    const regions = ["br1", "eun1", "euw1", "jp1", "kr", "la1", "la2", "na1", "oc1", "tr1", "ru", "ph2", "sg2", "th2", "tw2", "vn2", "americas", "asia", "europe", "sea"];
    let args = message.content.split(" ");
    if (args[1] === "help") help(message)
    else if (regions.includes(args[1])) await rank(message, args[1]);
    else await rank(message, "");
}

module.exports = {
    execute
}