const fs = require("fs");
const path = require("path");

function loadPokemonData() {
    const rawData = fs.readFileSync(path.resolve(__dirname, "../../../json_files/pokemon.json"));
    return JSON.parse(rawData);
}

/**
 * Tableau d'émojis trié par ordre pour réagir aux messages
 * @type {string[]}
 */
const emojis = [
    "1️⃣",
    "2️⃣",
    "3️⃣",
    "4️⃣",
    "5️⃣",
    "6️⃣"
]



module.exports = {
    loadPokemonData,
    emojis
};
