const { PokemonPokedex } = require('../db.js');

async function catchPokemon(player, pokemon) {
    await PokemonPokedex.create({
        IDPlayer: player["ID"],
        IDPokemon: pokemon["ID"],
    });
}

module.exports = { catchPokemon }