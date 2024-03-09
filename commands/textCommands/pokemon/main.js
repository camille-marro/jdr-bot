let fs = require('fs');
const path = require("path");

const {EmbedBuilder} = require('discord.js');

const log = require('../../../assets/log');
const { loadPokemonData, emojis } = require('./utils');
const {getPlayerWithId, refreshTeam} = require("./assets");

let { exploreGrass } = require('./explore');
let { printPokemons } = require('./list');
let { train } = require('./train');
let { infosPokemon } = require('./infosPokemon');
let { pveMain } = require('./trainPVE');
let { healPokemons } = require('./heal');
let { teamManager } = require('./team');
let { releasePokemonMain } = require('./release');
let { help } = require('./help')
let { playerStart } = require('./start');
let { admin } = require('./admin');
let { defi } = require('./defi');
let { test } = require('./test');

let pokemonData;

try {
    console.log("|-- Loading pokemon data...");
    pokemonData = loadPokemonData();
} catch (err) {
    console.log("|-- no file named pokemon.json found");
    pokemonData = false;
}

function execute(message) {
    let args = message.content.split(" ");
    if (args[1] === "test") {
        test(message);
    } else if (args[1] === "explore") {
        exploreGrass(message).then(r => {});
    }/* else if (args[1] === "scrap" && message.author.id.toString() === "198381114602160128") {
        scarpPokemons().then(r => {});
    } /*/ else if (args[1] === "liste" || args[1] === "list" || args[1] === "inv") {
        printPokemons(message);
    } else if (args[1] === "start") {
        playerStart(message).then(r => {});
    } else if (args[1] === "train") {
        train(message).then(r => {});
    } else if (args[1] === "info") {
        infosPokemon(message).then(r => {});
    } else if (args[1] === "trainPVE" || args[1] === "trainpve") {
        pveMain(message);
    } else if (args[1] === "heal") {
        healPokemons(message);
    } else if (args[1] === "team") {
        teamManager(message);
    } else if (args[1] === "release") {
        releasePokemonMain(message);
    } else if (args[1] === "defi") {
        defi(message);
    } else if (args[1] === "admin") {
        admin(message);
    } else if (args[1] === "help") {
        help(message);
    }
}

module.exports = {
    execute
}