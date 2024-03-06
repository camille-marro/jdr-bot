let { getPlayerWithId } = require("./assets");

/**
 * Affiche la liste des pokémons possédés par le joueur
 * @param {Object}message
 */
function printPokemons(message) {
    let args = message.content.split(" ");

    let player;
    if (args[2]) {
        player = getPlayerWithId(args[2].slice(2, args[2].length-1));
        if (!player) {
            message.channel.send("Aucun joueur avec cet id trouvé !");
            return;
        }
    } else {
        player = getPlayerWithId(message.author.id);
        if (!player) {
            message.channel.send("Vous n'êtes pas inscrit dans le jeu !");
            return;
        }
    }


    let pokemonsCounted = countPokemons(player["pokemons"], true);
    let msgPokemon = "Voici la liste de vos pokémons :\n";

    let pokemonsSortedName = Object.keys(pokemonsCounted);
    pokemonsSortedName.forEach(pokemonName => {
        if (pokemonName.endsWith("_S")) {
            pokemonName = pokemonName.slice(0, pokemonName.length-2);
            msgPokemon += pokemonName + ":sparkles: (x" + pokemonsCounted[pokemonName + "_S"] + ")\n";
        } else {
            msgPokemon += pokemonName + " (x" + pokemonsCounted[pokemonName] + ")\n";
        }
    });

    message.channel.send(msgPokemon);
}

/**
 * Renvoie une liste du nombre d'occurrences de chaque pokémon
 * @param {Object[]}pokemons - Liste des pokémons à compter
 * @param {Boolean}[sort=false] - Effectue un tri par ordre alphabétique des clés
 * @returns {[{String:Number}]} - Liste du nombre d'occurrences sous la forme : {"nom_pokemon" : nb_occurrences}
 */
function countPokemons(pokemons, sort = false) {
    let pokemonsCount = {};
    pokemons.forEach(pokemon => {
        if (pokemonsCount.hasOwnProperty(pokemon.name)) {
            if (pokemon["shiny"]) {
                if (pokemonsCount.hasOwnProperty(pokemon.name + "_S")) pokemonsCount[pokemon.name + "_S"]++;
                else pokemonsCount[pokemon.name + "_S"] = 1;
            } else pokemonsCount[pokemon.name]++;
        } else {
            if (pokemon["shiny"]) pokemonsCount[pokemon.name + "_S"] = 1
            else pokemonsCount[pokemon.name] = 1;
        }
    });

    if (sort) pokemonsCount = sortPokemonsCount(pokemonsCount);

    return pokemonsCount;
}

/**
 * Trie une liste utilisée par pokemonCount() par ordre alphabétique des clés
 * @param {[{String:Number}]}pokemonsCount - Tableau du nombre d'occurrences de chaque pokémon
 * @returns {[{String:Number}]} - Renvoie une liste ordonnée par ordre alphabétique des clés
 */
function sortPokemonsCount(pokemonsCount) {
    let keys = Object.keys(pokemonsCount);
    keys.sort((a, b) => a.localeCompare(b, 'fr', {ignorePunctuation: true}));

    let pokemonsCountSort = {};
    keys.forEach(key => {
        pokemonsCountSort[key] = pokemonsCount[key];
    });

    return pokemonsCountSort;
}

module.exports = {
    printPokemons
}