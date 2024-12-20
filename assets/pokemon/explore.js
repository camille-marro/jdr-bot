const { drawPokemon } = require('./drawPokemon.js');
const {EmbedBuilder} = require("discord.js");

async function exploreGrass(player) {
    let timeStamp = new Date().getTime();

    if (((timeStamp - player["lastExplore"]) / (1000 * 60 * 60)) < 1) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Vous ne pouvez explorer les hautes herbes qu'une fois par heure");
        msgEmbed.setDescription("Votre prochaine exploration sera disponible dans : " + getWaitingTime(player));
        msgEmbed.setColor("#ff0000");

        return [false, msgEmbed];
    }

    let pokemons = await drawPokemon(3);

    return [true, pokemons];

}

function getWaitingTime(player) {
    let diff = new Date().getTime() - player["lastExplore"];

    let finalDiff = 3600000 - diff //3600000 === 1 heure

    const seconds = Math.floor(finalDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    return `${hours % 24} heure(s), ${minutes % 60} minute(s) et ${seconds % 60} seconde(s)`;
}

module.exports = {
    exploreGrass
};