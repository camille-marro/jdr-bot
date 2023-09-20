const fs = require('fs');
const path = require("path");
const os = require("os");

const { EmbedBuilder } = require('discord.js');

const log = require('../../../assets/log');

function execute (message) {
    let args = message.content.split(" ");

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#c94d2f");
    msgEmbed.setTitle("Mise à jour de la clé API Riot Games");

    let new_api_key = args[1];

    console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to update lol api key to : " + new_api_key + ".");
    log.print("trie to update lol api key to " + new_api_key, message.author, message.content);

    const regex = /^RGAPI-[A-Za-z0-9]{8}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{12}$/;
    if (!regex.test(new_api_key)) {
        msgEmbed.setColor("#ff0000");
        msgEmbed.setDescription("Erreur la clé donnée ne correspond pas au format des clés habituelles !");
        msgEmbed.addFields({name: "Valeur donnée", value: new_api_key, inline: true});
        msgEmbed.addFields({name: "Exemple de clé : ", value: "RGAPI-7874f537-ae07-4b9f-9af6-d7bd3bf36ac1", inline: true});
        message.channel.send({embeds: [msgEmbed]});

        console.log("|-- update impossible, new api key is not conform");
        log.print("error : new api key is not conform", 1, message.content);
        return;
    }

   let env_vars = fs.readFileSync(path.resolve(__dirname, "../../../.env"), "utf-8").split(os.EOL);

    const target = env_vars.indexOf(env_vars.find((line) => {
        return line.match("API_KEY");
    }));

    env_vars.splice(target, 1, `API_KEY="${new_api_key}"`);

    fs.writeFileSync(path.resolve(__dirname, "../../../.env"), env_vars.join(os.EOL));

    console.log("|-- api key successfully updated");
    log.print("api key successfully updated", 1);

    msgEmbed.setDescription("Mise à jour effectuée avec succès !");
    message.channel.send({embeds: [msgEmbed]});
}

module.exports = {
    execute
}