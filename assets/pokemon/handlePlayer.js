const { PokemonPlayers, PokemonGenerated } = require('../db.js');

async function getPlayer(id) {
    let player = await PokemonPlayers.findAll({
        where: {
            IDDiscord: id,
        }
    });

    if (player.length === 0) return false;
    else return player[0]["dataValues"];
}

async function createPlayer(id) {
    await PokemonPlayers.create({
        IDDiscord: id,
        lastExplore: 0
    });
}

async function setTimeExplore(player) {
    let timeStamp = new Date().getTime();
    // timeStamp += 3600000; // 3600000 = 1 heure // à mettre que pour le local

    await PokemonPlayers.update(
        { lastExplore: timeStamp},
        {
            where: {
                ID: player["ID"],
            }
        }
    );
}

async function getPlayerPokemons(player) {
    let rawPokemons = await PokemonGenerated.findAll({
        where: {
            IDPlayer: player["ID"]
        },
        order: ['name', 'level']
    });

    let pokemons = [];
    for (let pokemon of rawPokemons) {
        pokemons.push(pokemon["dataValues"]);
    }

    return pokemons;
}

module.exports = {
    getPlayer, createPlayer, setTimeExplore, getPlayerPokemons
}