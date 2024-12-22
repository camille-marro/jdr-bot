const { PokemonGenerated, PokemonCapacities, Pokemon, PokemonTypes, Types} = require("../db");
const {Op} = require("sequelize");

async function catchPokemon(player, pokemon, types) {
    let randSize = Math.random() * (1.99 - 0.01) + 0.01;
    let randWeight = Math.random() * (1.99 - 0.01) + 0.01;

    let randShiny = Math.floor(Math.random() * (8192 - 1 + 1)) + 1;

    let IV1 = Math.floor(Math.random() * (31 - 1 + 1)) + 1;
    let IV2 = Math.floor(Math.random() * (31 - 1 + 1)) + 1;
    let IV3 = Math.floor(Math.random() * (31 - 1 + 1)) + 1;
    let IV4 = Math.floor(Math.random() * (31 - 1 + 1)) + 1;
    let IV5 = Math.floor(Math.random() * (31 - 1 + 1)) + 1;
    let IV6 = Math.floor(Math.random() * (31 - 1 + 1)) + 1;

    let size = pokemon["size"]*randSize;
    let weight = pokemon["weight"]*randWeight;

    let shiny = (randShiny === 1);

    let type1 = types[0]["name"];
    let type2 = "/"
    if (types.length > 1) type2 = types[1]["name"];

    let sex;
    if (pokemon["sex"] != null) {
        if (pokemon["sex"] <= (Math.floor(Math.random() * (1000 - 1 + 1)) + 1)) sex = "M";
        else sex = "F";
    } else sex = "/";

    await PokemonGenerated.create({
        IDPokemon: pokemon["ID"],
        IDPlayer: player["ID"],
        name: pokemon["name"],
        sex: sex,
        size: size,
        weight: weight,
        level: 1,
        xp: 0,
        type1: type1,
        type2: type2,
        currentHp: pokemon["hp"],
        maxHp: pokemon["hp"],
        attack: pokemon["attack"],
        defense: pokemon["defense"],
        speAttack: pokemon["speAttack"],
        speDefense: pokemon["speDefense"],
        speed: pokemon["speed"],
        IVHp: IV1,
        IVAttack: IV2,
        IVDefense: IV3,
        IVSpeAttack: IV4,
        IVSpeDefense: IV5,
        IVSpeed: IV6,
        shiny: shiny
    });
}

async function getCompsAtLevel(pokemonID, level) {
    let rawCapacities = PokemonCapacities.findAll({
        where: {
            pokemonID: pokemonID,
            level: {[Op.lte]: level}
        }
    });

    let capacities = [];
    for (let capacity of rawCapacities) {
        capacities.push(capacity["dataValues"]);
    }

    return capacities;
}

async function drawPokemon(nb) {
    let pokemons = [];
    for (let i = 0; i < nb; i++) {
        let randInt = Math.floor(Math.random() * 151);
        let pokemon = await Pokemon.findOne({
            where: {
                ID: randInt
            }
        });

        let typesID = await PokemonTypes.findAll({
            where: {
                pokemonID: pokemon["dataValues"]["ID"]
            }
        });

        let types = [];
        for (let typeID of typesID) {
            let type = await Types.findOne({
                where: {
                    ID: typeID["dataValues"]["typeID"]
                }
            });

            types.push(type["dataValues"]);
        }

        pokemons.push({pokemon: pokemon["dataValues"], types: types});
    }

    return pokemons;
}

module.exports = { catchPokemon, drawPokemon }