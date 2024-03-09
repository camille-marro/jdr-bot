const { loadPokemonData, emojis } = require("./utils");
const {drawPokemonWithId} = require("./assets");
const {EmbedBuilder} = require("discord.js");

let pokemonData = loadPokemonData();

function checkEvolution(pokemon, message) {
    return new Promise(async (resolve, reject) => {
        if (pokemon["level"] >= pokemon["evolveLvl"]) {
            let pokemonBeforeEvolve = JSON.parse(JSON.stringify(pokemon));

            // demander si on veut faire évoluer le pokémon
            let askCancel = await cancelEvolve(pokemon, message);
            if (askCancel) {
                let msgEmbed = new EmbedBuilder();
                msgEmbed.setTitle("Vous avez décidé d'annuler l'évolution !");
                msgEmbed.setDescription("Votre pokémon ne pourra plus évoluer désormais.");
                msgEmbed.setColor("#942cad");
                msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                message.channel.send({embeds: [msgEmbed]});
                resolve(true);
                return;
            }

            let embedMessage = evolvePokemon(pokemon);
            if (!embedMessage) {
                let msgEmbed = new EmbedBuilder();
                msgEmbed.setTitle("Votre " + pokemon["name"] + " ne peut pas évoluer !");
                msgEmbed.setColor("#ff0000");
                msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande *pokemon help*."});

                message.channel.send({embeds: [msgEmbed]});
                resolve(false)
                return;
            }
            message.channel.send({embeds: [embedMessage]});

            await checkNewCapacities(pokemon, pokemonBeforeEvolve, message);
            resolve(true);
        } else resolve(false);
    });
}

function cancelEvolve(pokemon, message) {
    return new Promise(async (resolve, reject) => {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Oh ! Votre pokémon évolue !");
        msgEmbed.setDescription("Choisissez si vous souhaitez faire évoluer ou non votre pokémon !");
        msgEmbed.setColor("#fff300");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande *pokemon help*."});

        let msgSent = await message.channel.send({embeds: [msgEmbed]});

        await msgSent.react('👍');
        await msgSent.react('👎');

        const filter = (reaction, user) => {
            return emojis.includes(reaction.emoji.name) && !user.bot;
        };

        let collector = msgSent.createReactionCollector(filter, {time: 5000});
        collector.on('collect', (reaction, user) => {
            if (user.id === message.author.id) {
                if (reaction.emoji.name === '👎') {
                    pokemon["evolveLvl"] = -1;
                    collector.stop();
                    resolve(true);
                } else if (reaction.emoji.name === '👍') {
                    collector.stop();
                    resolve(false);
                }
            } else if (!user.bot) {
                let msgEmbed = new EmbedBuilder();
                msgEmbed.setTitle("Vous ne pouvez pas réagir aux messages des autres !");
                msgEmbed.setDescription("<@" + user.id + "> fait plus ça c'est pas bien !");
                msgEmbed.setColor("#ff0000");
                msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                message.channel.send({embeds: [msgEmbed]});
                collector.stop();
            }
        });
    });
}

function checkNewCapacities(pokemon, pokemonBeforeEvolve, message) {
    return new Promise(async () => {
        let pokemonInfos = drawPokemonWithId(pokemon["id"]);

        for (let i = 0; i < pokemonInfos["capacites"].length; i++) {
            if (pokemon["level"] < i) continue;
            if (pokemonInfos["capacites"][i].length > 1) {
                for (let j = 0; j < pokemonInfos["capacites"][i].length; j++) {
                    if (!pokemonHaveCapacity(pokemon, pokemonInfos["capacites"][i][j])) {
                        if (!pokemonCanLearnCapacity(pokemonBeforeEvolve, pokemonInfos["capacites"][i][j])) {
                            await learnNewCapacity(pokemon, pokemonInfos["capacites"][i][j], message);
                        }
                    }
                }
            } else if (pokemonInfos["capacites"][i].length === 1) {
                if (!pokemonHaveCapacity(pokemon, pokemonInfos["capacites"][i][0])) {
                    if (!pokemonCanLearnCapacity(pokemonBeforeEvolve, pokemonInfos["capacites"][i][0])) {
                        await learnNewCapacity(pokemon, pokemonInfos["capacites"][i][0], message);
                    }
                }
            }
        }
    });

}

function learnNewCapacity(pokemon, newCapacity, message) {
    return new Promise(async (resolve, reject) => {
        if (pokemon["capacities"].length + 1 <= 4) {
            pokemon["capacities"].push(newCapacity);
            let msgEmbed = new EmbedBuilder();
            msgEmbed.setTitle("Votre " + pokemon["name"] + " vient d'apprendre une nouvelle capacité !");
            msgEmbed.setDescription(pokemon["name"] + " a appris : " + newCapacity.name);
            msgEmbed.setColor("#e0d850");
            msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});

            message.channel.send({embeds: [msgEmbed]});
            resolve(true);
            return;
        }

        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Oh votre " + pokemon["name"] + " peut apprendre une nouvelle compétence !");
        msgEmbed.setColor("#e0d850");
        msgEmbed.setDescription("Sélectionner la compétence à remplacer par " + newCapacity.name + "!");
        msgEmbed.addFields({
            name: newCapacity.name + " (" + newCapacity.type + ")",
            value: "Attaque " + newCapacity.category + ", avec une puissance de " + newCapacity.puissance + " et une précision de " + newCapacity.precision + " %"
        });
        msgEmbed.addFields({name: "Capacité à oublier :", value: " "});
        for (let i = 0; i < pokemon["capacities"].length; i++) {
            msgEmbed.addFields({
                name: pokemon["capacities"][i].name + " (" + pokemon["capacities"][i].type + ")  " + emojis[i],
                value: "Attaque " + pokemon["capacities"][i].category + ", avec une puissance de " + pokemon["capacities"][i].puissance + " et une précision de " + pokemon["capacities"][i].precision + " %",
                inline: true
            });
            if (i % 2 === 1) msgEmbed.addFields({name: " ", value: " "});
        }
        msgEmbed.addFields({name: "Ne pas apprendre cette capacité : ❌", value: " "});

        let msgSent = await message.channel.send({embeds: [msgEmbed]});
        for (let i = 0; i < pokemon["capacities"].length; i++) {
            await msgSent.react(emojis[i]);
        }
        await msgSent.react('❌');

        const filter = (reaction, user) => {
            return emojis.includes(reaction.emoji.name) && !user.bot;
        };

        let collector = msgSent.createReactionCollector(filter, {time: 15000});

        collector.on('collect', (reaction, user) => {
            if (user.id === message.author.id) {
                if (reaction.emoji.name === '❌') {
                    let msgEmbed = new EmbedBuilder();
                    msgEmbed.setTitle("Très bien, la capacité " + newCapacity.name + " sera oubliée pour toujours !");
                    msgEmbed.setColor("#ffffff");
                    msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                    message.channel.send({embeds: [msgEmbed]});
                    resolve(false);
                } else {
                    for (let i = 0; i < pokemon["capacities"].length; i++) {
                        if (reaction.emoji.name === emojis[i]) {
                            let msgEmbed = new EmbedBuilder();
                            msgEmbed.setTitle("La capacité " + pokemon["capacities"][i]["name"] + " sera oublié pour toujours !");
                            msgEmbed.setDescription(pokemon.name + " vient d'apprendre " + newCapacity.name + " !");
                            msgEmbed.setColor("#29a827");
                            msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                            message.channel.send({embeds: [msgEmbed]});

                            pokemon["capacities"][i] = newCapacity;
                            resolve(true);
                            return;
                        }
                    }

                    let msgEmbed = new EmbedBuilder();
                    msgEmbed.setTitle("Une erreur est survenue ! Contactez Camille le boss :)");
                    msgEmbed.setColor("#ff0000");
                    msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                    message.channel.send({embeds: [msgEmbed]});
                    resolve(false);
                }
            } else if (!user.bot) {
                let msgEmbed = new EmbedBuilder();
                msgEmbed.setTitle("Vous ne pouvez pas réagir aux messages des autres !");
                msgEmbed.setDescription("<@" + user.id + "> fait plus ça c'est pas bien !");
                msgEmbed.setColor("#ff0000");
                msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                message.channel.send({embeds: [msgEmbed]});
                resolve(false);
            }
        });
    })
}

function pokemonCanLearnCapacity(pokemon, capacity) {
    console.log(pokemon.name + " will try to learn : " + capacity.name);
    let pokemonInfos = drawPokemonWithId(pokemon["id"]);

    let i = 0;
    while(i < pokemonInfos["capacites"].length) {
        if (pokemonInfos["capacites"][i].length > 1) {
            let j = 0;
            while (j < pokemonInfos["capacites"][i].length) {
                if (pokemonInfos["capacites"][i][j].name === capacity.name) return true;
                j++;
            }
        } else if (pokemonInfos["capacites"][i].length === 1) {
            if (pokemonInfos["capacites"][i].name === capacity.name) return true;
        }
        i++;
    }
    return false;
}

function pokemonHaveCapacity(pokemon, capacity) {
    console.log(capacity);
    console.log(pokemon);
    pokemon["capacities"].forEach(pokemonCapacity => {
        if (pokemonCapacity.name === capacity.name) return true;
    });

    return false;
}

function evolvePokemon(pokemon) {
    let pokemonInfo = drawPokemonWithId(pokemon['id']);
    let evolutionPokemon;

    if (Array.isArray(pokemonInfo["evolve"])) {
        if (Array.isArray(pokemonInfo["evolveLvl"])) {
            let i = 0, evolveFound = false;
            while (i < pokemonInfo["evolveLvl"].length) {
                if (pokemonInfo["evolveLvl"] !== -1) {
                    evolutionPokemon = drawPokemonWithId(pokemonInfo["evolve"][i]);
                    evolveFound = true;
                    break;
                }
                i++;
            }
            if (!evolveFound) return false;
        } else if (pokemonInfo["evolveLvl"] === -1) return false;
    } else evolutionPokemon = drawPokemonWithId(pokemonInfo["evolve"]);

    let diffSize = parseFloat(Math.abs(pokemonInfo["size"] - evolutionPokemon["size"]).toFixed(2));
    let diffWeight = parseFloat(Math.abs(pokemonInfo["weight"] - evolutionPokemon["weight"]).toFixed(2));

    pokemon['size'] += diffSize;
    pokemon['weight'] += diffWeight;
    pokemon['name'] = evolutionPokemon['name'];
    pokemon['types'] = evolutionPokemon['types'];
    pokemon['id'] = evolutionPokemon['id'];
    pokemon['evolveLvl'] = evolutionPokemon['evolveLvl'];

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setTitle("Félicitations votre " + pokemonInfo["name"] + " a évolué en " + pokemon["name"] + " !");
    msgEmbed.setDescription("Grâce à sa nouvelle évolution votre pokémon a gagné en poids et en taille et a peut être des nouveaux types !");
    msgEmbed.setColor("#08ff00");
    msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande *pokemon help*."});

    return msgEmbed;
}

module.exports = {
    checkEvolution
}