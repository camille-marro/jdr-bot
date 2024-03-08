let { getPlayerWithId, drawPokemonWithName} = require("./assets");

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
        let pokemon;
        if (pokemonName[pokemonName.length-1] === 'S') {
            pokemon = drawPokemonWithName(pokemonName.slice(0, pokemonName.length - 2));
        } else pokemon = drawPokemonWithName(pokemonName);

        pokemon["types"].forEach(type => {
            msgPokemon += parseTypeEmoji(type);
        });
        msgPokemon += " - "
        if (pokemonName.endsWith("_S")) {
            pokemonName = pokemonName.slice(0, pokemonName.length-2);
            msgPokemon += pokemonName + ":sparkles: (x" + pokemonsCounted[pokemonName + "_S"] + ")\n";
        } else {
            msgPokemon += pokemonName + " (x" + pokemonsCounted[pokemonName] + ")\n";
        }
    });

    message.channel.send(msgPokemon);
}

function parseTypeEmoji(type) {
    if (type === "Acier") return "<:Acier:1215135697128657018>";
    else if (type === "Combat") return "<:Combat:1215135651192766504>";
    else if (type === "Dragon") return "<:Dragon:1215135626215563304>";
    else if (type === "Eau") return "<:Eau:1215135602828382248>";
    else if (type === "Électrik") return "<:lectrik:1215135549195816980>";
    else if (type === "Fée") return "<:Fe:1215135530346352640>";
    else if (type === "Feu") return "<:Feu:1215135505130323978>";
    else if (type === "Glace") return "<:Glace:1215135472775335946>";
    else if (type === "Insecte") return "<:Insecte:1215135448733581412>";
    else if (type === "Normal") return "<:Normal:1215135420086485002>";
    else if (type === "Plante") return "<:Plante:1215135393578618880>";
    else if (type === "Poison") return "<:Poison:1215135368849002556>";
    else if (type === "Psy") return "<:Psy:1215135346296361041>";
    else if (type === "Roche") return "<:Roche:1215135325907583076>";
    else if (type === "Sol") return "<:Sol:1215135303426379787>";
    else if (type === "Spectre") return "<:Spectre:1215135276347953163>";
    else if (type === "Ténèbres") return "<:Tnbres:1215135203022872626>";
    else if (type === "Vol") return "<:Vol:1215135178301767711>";
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