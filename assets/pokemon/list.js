const {PokemonGenerated} = require("../db");

async function getPlayerPokemons(player) {
    let rawPokemons = await PokemonGenerated.findAll({
        where: {
            IDPlayer: player["ID"]
        }
    });

    let pokemons = [];
    for (let pokemon of rawPokemons) {
        pokemons.push(pokemon["dataValues"]);
    }

    return pokemons;
}

module.exports = { getPlayerPokemons }