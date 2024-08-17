let fs = require('fs');
const path = require("path");

const { EmbedBuilder } = require('discord.js');

const log = require('../../../assets/log');

const footer = "Pour plus d'informations utiliser la commande \"help av\"";

/**
 * Actualise data pour sauvegarder les changements
 */
function updateData(players) {
    fs.writeFileSync(path.resolve(__dirname, "../../../json_files/livre hero/players.json"), JSON.stringify(players));
    console.log("|-- data successfully updated");
    log.print("data has been successfully updated", 1);
}

function resetStory(player) {
    player["chapter"] = 1;
    player["page"] = 1;
    player["dead"] = false
    player["personnage"]["money"] = 10;
    player["personnage"]["talent"] = "";
}

function resetPlayer(player) {
    delete player["personnage"];
    player["chapter"] = 1;
    player["page"] = 1;
}

function resetMain(message, player, players) {
    let args = message.content.split(" ");
    if (player == null || !player.hasOwnProperty("personnage")) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Aucun personnage trouvé pour vous !");
        msgEmbed.setDescription("Pour créer un personnage utiliser la commande \"av start\"");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: footer});

        message.channel.send({embeds: [msgEmbed]});
        return;
    }
    if (args[2] === "perso" || args[2] === "personnage") {
        resetPlayer(player);
        updateData(players);

        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Personnage réinitialisé avec succès !");
        msgEmbed.setColor("#2fd7b4");
        msgEmbed.setFooter({text: footer});

        message.channel.send({embeds: [msgEmbed]});
    } else if (args[2] === "story") {
        resetStory(player);
        updateData(players);

        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Histoire réinitialisée avec succès !");
        msgEmbed.setColor("#2fd7b4");
        msgEmbed.setFooter({text: footer});

        message.channel.send({embeds: [msgEmbed]});
    } else {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Veuillez spécifié ce qu'il faut réinitialiser !");
        msgEmbed.setDescription("Vous pouvez réinitialiser l'histoire avec **\"av reset story\"**, ou votre personnage avec **\"av reset perso\"** ou **\"av reset personnage\"**.");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: footer});

        message.channel.send({embeds: [msgEmbed]});
    }
}

module.exports = {
    resetMain
}