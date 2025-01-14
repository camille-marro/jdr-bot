const {PokemonPlayers, PokemonGenerated} = require("../db");

async function getPlayer(id) {
    let player = await PokemonPlayers.findOne({
        where: {
            IDDiscord: id
        }
    });

    if (player.length === 0) return null;
    else return player;
}

async function createPlayer(id) {
    let player  = await PokemonPlayers.create({
        IDDiscord: id,
        lastExplore: 0,
        lastTraining: 0,
        trainingLeft: 0
    });

    console.log(player);
}

function canExplore(player) {
    let timeStamp = new Date().getTime();

    return !(((timeStamp - player["lastExplore"]) / (1000 * 60 * 60)) < 1)
}

function setTimeExplore(player) {
    player.lastExplore = new Date().getTime();
    player.update();
}

async function getPlayerPokemons(player){
    return await PokemonGenerated.findAll({
        where: {
            IDPlayer: player.ID
        }
    });
}

module.exports = {
    getPlayer, createPlayer, canExplore, setTimeExplore, getPlayerPokemons
}