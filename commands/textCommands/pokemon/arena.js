const {EmbedBuilder} = require("discord.js");
const {getPlayerWithId, getPlayerTeam, healAllPokemons, updateData} = require("./assets");
const fs = require("fs");
const path = require("path");
const {startCombatPVE} = require("./combatPVE");
const {emojis} = require("./utils");
const {healPokemons} = require("./heal");

function loadArenasData() {
    const rawData = fs.readFileSync(path.resolve(__dirname, "../../../json_files/arenas.json"));
    return JSON.parse(rawData);
}

function arenaMain(message) {
    let player = getPlayerWithId(message.author.id);
    let args = message.content.split(" ");

    if (!player) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Vous n'avez pas de compte !");
        msgEmbed.setDescription("Pour vous inscrire utilisez la commande *pokemon start* !");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

        message.channel.send({embeds: [msgEmbed]});
        return;
    }

    if (!getPlayerTeam(player)) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Vous n'avez pas d'équipe !");
        msgEmbed.setDescription("Pour vous créer une équipe utilisez la commande *pokemon team* !");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

        message.channel.send({embeds: [msgEmbed]});
        return;
    }

    if (!args[2]) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Indiquez l'arène à affronter !");
        msgEmbed.setDescription("Voici la liste des arènes : Argenta, Azuria, Céladopole");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

        message.channel.send({embeds: [msgEmbed]});
        return;
    }

    if (!player.hasOwnProperty("arenas")) {
        player["arenas"] = {
            ongoing: -1,
            won: []
        }
    }

    if (checkBeaten(player, args[2])) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Vous avez battu cette arène !");
        msgEmbed.setDescription("Vous ne pouvez pas re-combattre une arène dont vous avez déjà vaincu le champion !");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

        message.channel.send({embeds: [msgEmbed]});
        return;
    }

    let arena = loadArenaData(args[2]);
    if (!arena) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Cette arène n'existe pas !");
        msgEmbed.setDescription("Voici la liste des arènes : Argenta, ...");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

        message.channel.send({embeds: [msgEmbed]});
        return;
    }

    //CHECK SI ON GOING ET DEMANDE S'IL VEUT LANNULER ?

    startArena(player, arena, message);
}

async function startArena(player, arena, message) {
    return new Promise(async (resolve, reject) => {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Vous vous apprêtez à affronter l'arène de " + arena["name"]);
        msgEmbed.setDescription(
            "Mais avant d'affronter le champion vous devez d'abord gagner contre ses dresseurs novices." +
            "\nVous aller affronter " + arena["dresseurs"].length + " dresseurs avant d'affronter le champion " + arena["champion"]["name"]);
        msgEmbed.setColor("#b1ff24");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});
        msgEmbed.addFields({
            name: "Niveau des pokémons conseillé",
            value: arena["lvlConseil"].toString(),
            inline: true
        });
        msgEmbed.addFields({
            name: "Nombre de pokémons conseillé",
            value: arena["nbPokemonConseil"].toString(),
            inline: true
        });
        msgEmbed.addFields({
            name: "Type(s) des pokémons conseillé(s)",
            value: arena["typeConseil"].toString(),
            inline: true
        });
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

        message.channel.send({embeds: [msgEmbed]});

        let msgEmbed1 = new EmbedBuilder();
        msgEmbed1.setTitle("Êtes-vous sûr de vouloir affronter l'arène de " + arena["name"]);
        msgEmbed.setTitle("Vous vous apprêtez à affronter l'arène de " + arena["name"]);
        msgEmbed.setColor("#b1ff24");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});

        let msgSent = await message.channel.send({embeds: [msgEmbed1]});

        await msgSent.react('👍');
        await msgSent.react('👎');
        const filter = (reaction, user) => {
            return emojis.includes(reaction.emoji.name) && !user.bot;
        };

        const collector = msgSent.createReactionCollector(filter, {time: 15000});

        collector.on("collect", (reaction, user) => {
            if (user.id === message.author.id) {
                if (reaction.emoji.name === '👍') {
                    player["arenas"]["ongoing"] = 0;
                    collector.stop();
                    startCombatArena(player, arena, message);
                } else if (reaction.emoji.name === '👎') {
                    let msgEmbed = new EmbedBuilder();
                    msgEmbed.setTitle("Très bien retournez vous entrainer et revenez quand vous serez meilleur !");
                    msgEmbed.setColor("#ffffff");
                    msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});
                    message.channel.send({embeds: [msgEmbed]});
                    collector.stop()
                }
            } else if (!user.bot) {
                let msgEmbed = new EmbedBuilder();
                msgEmbed.setTitle("Vous ne pouvez pas réagir aux messages des autres !");
                msgEmbed.setDescription("<@" + user.id + "> fait plus ça c'est pas bien !");
                msgEmbed.setColor("#ff0000");
                msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                message.channel.send({embeds: [msgEmbed]});
            }
        });
    });
}

async function startCombatArena(player, arena, message, test = "") {
    if (test === "win" || test === "defeat") {
        console.log("fini ?");
        return;
    }
    let enemyObj = selectEnemy(player, arena);
    let title;
    if (enemyObj[0]) title = "champion de l'arène : " + enemyObj[1]["name"];
    else title = "dresseur de l'arène " + enemyObj[1]["name"];
    let enemy = enemyObj[1];

    let i = 0;
    while (i < enemy["pokemons"].length) {
        let msgEmbed = new EmbedBuilder();
        if (i === 0) {
            msgEmbed.setTitle("Début du combat contre le " + title);
            msgEmbed.setDescription(enemy["name"] + " va envoyer " + enemy["pokemons"][i]["name"]);
        } else msgEmbed.setTitle(enemy["name"] + " va envoyer " + enemy["pokemons"][i]["name"]);
        msgEmbed.setColor("#b1ff24");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

        message.channel.send({embeds: [msgEmbed]});

        let result = await startCombatPVE(player, enemy["pokemons"][i], message, "Combat contre " + enemy["name"], false);

        console.log(result);
        if (result === "defeat") {
            msgEmbed.setTitle("Défaite ! Malheureusement " + enemy["name"] + " est bien trop fort !");
            msgEmbed.setDescription("Vous pouvez retenter de battre l'arène plus tard une fois que vos pokémons seront devenus plus fort !\n" +
                "À cause de la défaite " + enemy["name"] + " a eu pitié de vous et à soigner tous vos pokémons ...");
            message.channel.send({embeds: [msgEmbed]});

            healAllPokemons(player);
            return "defeat";
        }
        i++;
    }

    let getResult = goToNextEnemy(player, arena);
    console.log("get Resulst : " + getResult);
    if (getResult) {
        // arena gagnée
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Bravo vous avez vaincu l'arène de " + arena["name"] + " en battant " + arena["champion"]["name"] + " !");
        if (player["arenas"]["won"].length === 0) msgEmbed.setDescription("Vous venez d'obtenir votre premier badge : le badge " + arena["badge"] + " !");
        else msgEmbed.setDescription("Vous venez d'obtenir votre " + player["arenas"]["won"].length + " ème badge : le badge " + arena["badge"] + " !");
        msgEmbed.setColor("#b1ff24");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

        message.channel.send({embeds: [msgEmbed]});
        player["arenas"]["won"].push(arena["name"]);
        player["arenas"]["ongoing"] = -1;
        updateData();
        return "win";
    } else {
        return await startCombatArena(player, arena, message);
    }
}

function goToNextEnemy(player, arena) {
    if (player["arenas"]["ongoing"] === -1) {
        return false;
    }

    player["arenas"]["ongoing"]++;
    if (player["arenas"]["ongoing"] >= arena["dresseurs"].length) {
        player["arenas"]["ongoing"] = -1;
        return true;
    }
    return false;
}

function selectEnemy(player, arena) {
    if (player["arenas"]["ongoing"] >= 0) return [false, arena["dresseurs"][player["arenas"]["ongoing"]]];
    else return [true, arena["champion"]];
}

function loadArenaData(arenaName) {
    let arenas = loadArenasData();
    let i = 0;
    while (i < arenas.length) {
        if(arenas[i]["name"].toLowerCase() === arenaName.toLowerCase()) return arenas[i];
        i++;
    }
    return false;
}

function checkBeaten(player, arenaName) {
    let i = 0;
    while (i < player["arenas"]["won"].length) {
        if (player["arenas"]["won"][i].toLowerCase() === arenaName.toLowerCase()) return true;
        i++;
    }
    return false;
}

module.exports = {
    arenaMain
}