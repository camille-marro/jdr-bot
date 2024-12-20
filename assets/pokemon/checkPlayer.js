const { PokemonPlayers } = require('../db.js');

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
    timeStamp += 3600000; // 3600000 = 1 heure

    await PokemonPlayers.update(
        { lastExplore: timeStamp},
        {
            where: {
                ID: player["ID"],
            }
        }
    );
}

module.exports = {
    getPlayer, createPlayer, setTimeExplore
}