const {getPlayerPokemons} = require("./handlePlayer");

async function list(interaction, player)  {
    let pokemons = await getPlayerPokemons(player);
    let finalStr = "";

    for (let pokemon of pokemons) {
        if (pokemon["shiny"]) finalStr += ":sparkles: ";
        finalStr += pokemon["name"] + " (" + pokemon["sex"] + ") - niv : " + pokemon["level"]
        finalStr += "\n";
    }

    interaction.reply({
        content: finalStr,
    });
}

module.exports = {
    list
}