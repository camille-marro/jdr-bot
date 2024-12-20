const { Pokemon, PokemonTypes, Types } = require('../db.js');

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

module.exports = { drawPokemon };