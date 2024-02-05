const fs = require("fs");
const path = require("path");

const log = require('../../../assets/log');
const {EmbedBuilder} = require("discord.js");

let champions;
let starters;
let items;
let runes;
let summoners;

try {
    console.log("|-- Loading lol data from ub_data ...");
    let lolData = fs.readFileSync(path.resolve(__dirname, "../../../json_files/ub_data/champions.json"));
    champions = JSON.parse(lolData);
    lolData = fs.readFileSync(path.resolve(__dirname, "../../../json_files/ub_data/items.json"));
    items = JSON.parse(lolData);
    lolData = fs.readFileSync(path.resolve(__dirname, "../../../json_files/ub_data/runes.json"));
    runes = JSON.parse(lolData);
    lolData = fs.readFileSync(path.resolve(__dirname, "../../../json_files/ub_data/starters.json"));
    starters = JSON.parse(lolData);
    lolData = fs.readFileSync(path.resolve(__dirname, "../../../json_files/ub_data/summoners.json"));
    summoners = JSON.parse(lolData);
} catch (err) {
    console.log("|-- no files found");
}

function full_ub(message) {
    log.print("tried to use ub command", message.author, message.content);

    let args = message.content.split(" ");

    let champion, lane;

    if (args[1] === "top") {
        lane = "top";
        champion = selectChampionWithLane(lane);
    } else if (args[1] === "jungle" || args[1] === "jgl") {
        lane = "jungle";
        champion = selectChampionWithLane(lane);
    } else if (args[1] === "mid") {
        lane = "mid";
        champion = selectChampionWithLane(lane);
    } else if (args[1] === "adc") {
        lane = "adc";
        champion = selectChampionWithLane(lane);
    } else if (args[1] === "support" || args[1] === "sup" || args[1] === "supp") {
        lane = "support";
        champion = selectChampionWithLane(lane);
    } else {
        champion = selectChampion();
        lane = chooseLane(champion);
    }

    let boots = chooseBoots();
    let mythic = chooseMythic();
    let legendaries = chooseLegendaries(4);
    let starter = chooseStarter(lane);
    let summoners = chooseSummoners(lane);
    let runes = chooseRunes();

    console.log(legendaries);
    let randSortAMax = Math.floor(Math.random() * 2);
    let sortAMax;
    if (randSortAMax === 0) sortAMax = "A";
    else if (randSortAMax === 1) sortAMax = "Z";
    else sortAMax = "E";

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#00efa7");
    msgEmbed.setTitle(champion["name"].charAt(0).toUpperCase() + champion["name"].slice(1));
    msgEmbed.setThumbnail(champion["image"]);
    msgEmbed.setDescription("Vous devez jouer " + champion["name"] + " en " + lane + " et maxer votre : " + sortAMax);
    msgEmbed.addFields({name: "Premier Item", value: starter["name"], inline: true})
    msgEmbed.addFields({name: "Bottes", value: boots["name"], inline: true});
    msgEmbed.addFields({name: "Mythique", value: mythic["name"], inline: true});
    msgEmbed.addFields({name: "Summoner 1", value:summoners[0]["name"], inline: true});
    msgEmbed.addFields({name: "Summoner 2", value:summoners[1]["name"], inline: true});
    msgEmbed.addFields({name: " ", value:" ", inline: false});
    msgEmbed.addFields({name: "Legendaire 1", value:legendaries[0]["name"], inline: true});
    msgEmbed.addFields({name: "Legendaire 2", value:legendaries[1]["name"], inline: true});
    msgEmbed.addFields({name: "Legendaire 3", value:legendaries[2]["name"], inline: true});
    msgEmbed.addFields({name: "Legendaire 4", value:legendaries[3]["name"], inline: false});
    msgEmbed.addFields({name: " ", value:" ", inline: false});
    msgEmbed.addFields({name: "Rune Principale", value:runes[0]["name"], inline: false});
    msgEmbed.addFields({name: "Rune mineure 1", value:runes[1]["name"], inline: true});
    msgEmbed.addFields({name: "Rune mineure 2", value:runes[2]["name"], inline: true});
    msgEmbed.addFields({name: "Rune mineure 3", value:runes[3]["name"], inline: true});
    msgEmbed.addFields({name: " ", value:" ", inline: false});
    msgEmbed.addFields({name: "Deuxième arbre", value:" ", inline: true});
    msgEmbed.addFields({name: "Rune secondaire 1", value:runes[4]["name"], inline: true});
    msgEmbed.addFields({name: "Rune secondaire 2", value:runes[5]["name"], inline: true});

    message.channel.send({embeds: [msgEmbed]});
    log.print("sending success message !", 1);
}

function chooseRunes() {
    let firstIndex = Math.floor(Math.random() * runes.length);
    let secondIndex= Math.floor(Math.random() * runes.length);
    while (firstIndex === secondIndex) {
        secondIndex= Math.floor(Math.random() * runes.length);
    }

    let mainRunes = runes[firstIndex]["main"][Math.floor(Math.random() * runes[firstIndex]["main"].length)];
    let subs1 = runes[firstIndex]["subs-1"][Math.floor(Math.random() * runes[firstIndex]["subs-1"].length)];
    let subs2 = runes[firstIndex]["subs-2"][Math.floor(Math.random() * runes[firstIndex]["subs-2"].length)];
    let subs3 = runes[firstIndex]["subs-3"][Math.floor(Math.random() * runes[firstIndex]["subs-3"].length)];

    let randSub = Math.floor(Math.random() * 2);
    let secondSub1, secondSub2;
    if (randSub === 0) {
        let randSub2 = Math.floor(Math.random());
        if (randSub2 === 0) {
            secondSub1 = runes[secondIndex]["subs-1"][Math.floor(Math.random() * runes[secondIndex]["subs-1"].length)]
            secondSub2 = runes[secondIndex]["subs-2"][Math.floor(Math.random() * runes[secondIndex]["subs-2"].length)]
        } else {
            secondSub1 = runes[secondIndex]["subs-1"][Math.floor(Math.random() * runes[secondIndex]["subs-1"].length)];
            secondSub2 = runes[secondIndex]["subs-3"][Math.floor(Math.random() * runes[secondIndex]["subs-3"].length)]
        }
    } else if (randSub === 1) {
        let randSub2 = Math.floor(Math.random());
        if (randSub2 === 0) {
            secondSub1 = runes[secondIndex]["subs-2"][Math.floor(Math.random() * runes[secondIndex]["subs-2"].length)]
            secondSub2 = runes[secondIndex]["subs-1"][Math.floor(Math.random() * runes[secondIndex]["subs-1"].length)]
        } else {
            secondSub1 = runes[secondIndex]["subs-2"][Math.floor(Math.random() * runes[secondIndex]["subs-2"].length)];
            secondSub2 = runes[secondIndex]["subs-3"][Math.floor(Math.random() * runes[secondIndex]["subs-3"].length)]
        }
    } else {
        let randSub2 = Math.floor(Math.random());
        if (randSub2 === 0) {
            secondSub1 = runes[secondIndex]["subs-3"][Math.floor(Math.random() * runes[secondIndex]["subs-3"].length)]
            secondSub2 = runes[secondIndex]["subs-1"][Math.floor(Math.random() * runes[secondIndex]["subs-1"].length)]
        } else {
            secondSub1 = runes[secondIndex]["subs-3"][Math.floor(Math.random() * runes[secondIndex]["subs-3"].length)];
            secondSub2 = runes[secondIndex]["subs-2"][Math.floor(Math.random() * runes[secondIndex]["subs-2"].length)]
        }
    }

    return [mainRunes, subs1, subs2, subs3, secondSub1, secondSub2];
}

function chooseSummoners(lane) {
    let firstIndex = Math.floor(Math.random() * summoners.length);
    if (lane === "jungle") firstIndex = 8;
    let secondIndex= Math.floor(Math.random() * summoners.length);
    while (firstIndex === secondIndex) {
        secondIndex= Math.floor(Math.random() * summoners.length);
    }
    return [summoners[firstIndex], summoners[secondIndex]];
}

function chooseStarter(lane) {
    if (lane === "jungle") {
        return starters["jungle"][Math.floor(Math.random() * starters["jungle"].length)];
    } else if (lane === "support") {
        return starters["support"][Math.floor(Math.random() * starters["support"].length)];
    } else {
        return starters["lane"][Math.floor(Math.random() * starters["lane"].length)];
    }
}

function chooseLegendaries(number) {
    let legendaries = [];
    let indexDones = [];
    let index;
    for (let i = 0; i < number; i++) {
        index = Math.floor(Math.random() * items["legendaries"].length);
        while (indexDones.includes(index)) {
            index = Math.floor(Math.random() * items["legendaries"].length);
            console.log("DOUBLE !!!");
        }
        console.log(index);
        indexDones.push(index);
        legendaries.push(items["legendaries"][index]);
    }
    return legendaries;
}

function chooseMythic() {
    return (items["mythics"][Math.floor(Math.random() * items["mythics"].length)]);
}

function chooseBoots() {
    return (items["boots"][Math.floor(Math.random() * items["boots"].length)]);
}

function chooseLane(champion) {
    let lanes = champion["lane"].split(" ");
    return (lanes[Math.floor(Math.random() * lanes.length)]);
}

function selectChampion() {
    return (champions[Math.floor(Math.random() * champions.length)]);
}

function selectChampionWithLane(lane) {
    while (true) {
        let champion = champions[Math.floor(Math.random() * champions.length)];
        if (champion["lane"].includes(lane)) return champion;
    }
}

function ub_champion(message) {
    log.print("tried to use ub command", message.author, message.content);
    let champion = selectChampion();

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#00efa7");
    msgEmbed.setTitle(champion["name"].charAt(0).toUpperCase() + champion["name"].slice(1));
    msgEmbed.setThumbnail(champion["image"]);
    message.channel.send({embeds: [msgEmbed]});

    log.print("Sending success message", 1);
}

function ub_stuff(message) {
    log.print("tried to use ub command", message.author, message.content);

    let mythic = chooseMythic();
    let boots = chooseBoots();
    let legendaries = chooseLegendaries(4);

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#00efa7");
    msgEmbed.setTitle("Mythique : " + mythic["name"]);
    msgEmbed.addFields({name: "Bottes", value:boots["name"], inline: true});
    msgEmbed.addFields({name: "Legendaire 1", value:legendaries[0]["name"], inline: true});
    msgEmbed.addFields({name: "Legendaire 2", value:legendaries[1]["name"], inline: true});
    msgEmbed.addFields({name: "Legendaire 3", value:legendaries[2]["name"], inline: true});
    msgEmbed.addFields({name: "Legendaire 2", value:legendaries[3]["name"], inline: true});

    message.channel.send({embeds: [msgEmbed]});
    log.print("Sending success message", 1);
}

function execute(message) {
    let args = message.content.split(" ");
    if (args[1] === "champ" || args[1] === "champion" || args[1] === "champions") {
        ub_champion(message);
    } else if (args[1] === "item" || args[1] === "items" || args[1] === "stuff") {
        ub_stuff(message);
    } else {
        full_ub(message);
    }
}

module.exports = {
    execute
}