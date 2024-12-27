const {PokemonGenerated} = require("../db");

async function train(interaction, player) {
    // check si pokemon
    let pokemonName  = interaction.options.getString('pokemon');
    pokemonName = pokemonName.charAt(0).toUpperCase() + pokemonName.substring(1).toLowerCase();

    let playerPokemons = await PokemonGenerated.findAll({
        where: {
            IDPlayer: player.ID,
            name: pokemonName
        }
    });

    if (playerPokemons.length > 1) // choose pokemon
    {}

    // check training

    console.log(playerPokemons.length)

    interaction.reply("caca")
}

module.exports = {
    train
}