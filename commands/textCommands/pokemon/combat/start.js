const {EmbedBuilder} = require("discord.js");
const {emojis, loadPokemonData} = require("../utils");
const {getPlayerTeam} = require("../assets");

let pokemonData = loadPokemonData();

function prepareCombat(player, enemy, type, message) {
    return new Promise(async (resolve, reject) => {
        if (type === "pve") {
            let playerTeam = getPlayerTeam(player);
            // check playerTeam
            let enemyTeam = enemy["pokemons"];
            let combatObject = {
                turn: true,
                escape: false,
                escapeCpt: 0,
                playerTeam: playerTeam,
                enemyTeam: enemyTeam,
                playerPokemonSent: playerTeam[0],
                enemyPokemonSent: enemyTeam[0],
                win: -1
            }

            let result = await startCombatPVE(combatObject, message);
            if (result === 2) {
                message.channel.send("Vous avez gagné bravo !");
            } else if (result === 1) {
                message.channel.send("Vous avez perdu pas de chance !");
            } else {
                message.channel.send("Vous avez fuit comme un caca !");
            }
        }
    });
}

function startCombatPVE(combatObject, message) {
    return new Promise(async (resolve, reject) => {
        let winCondition = checkWinConditions(combatObject);
        if (winCondition >= 0) {
            resolve(true);
            return;
        }

        if (combatObject["turn"]) {
            // player turn
            let res = await playerTurn(combatObject, message);
        } else {
            // enemy turn
            enemyTurn(combatObject, message);
        }
        // continuer l'exécution
    })
}

function playerTurn(combatObject, message) {
    return new Promise(async resolve => {
        let choice = await chooseAction(message);
        // 1 = attack, 2 = fuir, 3 = changer pokemon, 4 = objet
        console.log(choice)
        if (choice === 1) {
            let attack = await chooseAttack(combatObject, message);
            if (!attack) {
                resolve(playerTurn(combatObject, message));
                return;
            }
            let res = useAttack(attack, combatObject["playerPokemonSent"], combatObject["enemyPokemonSent"]);
        }
    });
}

function useAttack(attack, attPokemon, defPokemon) {
    let resPrecision = tryPrecision(attack);
    if (!resPrecision) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("L'attaque de " + attPokemon.name + " a raté !");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});
        return msgEmbed;
    }
    //let dodge = tryDodge(attack, attPokemon, defPokemon);
    let avantageType = getAvantageType(attack["type"], defPokemon["types"]);
    let cc = getCC(attPokemon["level"], attPokemon["stats"][5]);

    let multi = cc * avantageType;

    let puissanceAttaque = attack["puissance"];
    let damage;

    if (attack["category"] === "physique") {
        damage = Math.ceil(((((((attPokemon["level"] * 0.4) + 2) * attPokemon["stats"][1] * puissanceAttaque) / defPokemon["stats"][2]) / 50) + 2) * multi);
    } else if (attack["category"] === "spéciale") {
        damage = Math.ceil(((((((attPokemon["level"] * 0.4) + 2) * attPokemon["stats"][3] * puissanceAttaque) / defPokemon["stats"][4]) / 50) + 2) * multi);
    } else {
        damage = 0;
    }

    damagePokemon(defPokemon, damage);
}

function damagePokemon(pokemon, damage, multi = 1) {
    let damageDone = Math.ceil(damage * multi)
    pokemon["currentHP"] -= damageDone;
    return damageDone;
}

function getCC(level, speed, modif = 1) {
    let damageMulti = ((2*level)+5)/(2*level);
    let rand = Math.floor(Math.random() * 256);
    let chance = (Math.floor(speed/2) * modif);
    if (chance >= 255) chance = 254;

    if (chance > rand) return damageMulti;
    else return 1;
}

function getAvantageType(typeAtt, typesDefs) {
    let multi = 1;
    typesDefs.forEach(typeDef => {
        switch(typeAtt) {
            case "Acier":
                switch(typeDef) {
                    case "Acier":
                        multi = multi*0.5
                        break;
                    case "Eau":
                        multi = multi*0.5
                        break;
                    case "Électrik":
                        multi = multi*0.5
                        break;
                    case "Fée":
                        multi = multi*2
                        break;
                    case "Feu":
                        multi = multi*0.5
                        break;
                    case "Glace":
                        multi = multi*2
                        break;
                    case "Roche":
                        multi = multi*2
                        break;
                    default:
                        break;
                }
                break;
            case "Combat":
                switch(typeDef) {
                    case "Acier":
                        multi = multi*2
                        break;
                    case "Fée":
                        multi = multi*0.5
                        break;
                    case "Glace":
                        multi = multi*2
                        break;
                    case "Insecte":
                        multi = multi*0.5
                        break;
                    case "Normal":
                        multi = multi*2
                        break;
                    case "Poison":
                        multi = multi*0.5
                        break;
                    case "Psy":
                        multi = multi*0.5
                        break;
                    case "Roche":
                        multi = multi*2
                        break;
                    case "Spectre":
                        multi = 0
                        break;
                    case "Ténèbres":
                        multi = multi*2
                        break;
                    case "Vol":
                        multi = multi*0.5
                        break;
                    default:
                        break;
                }
                break;
            case "Dragon":
                switch(typeDef) {
                    case "Acier":
                        multi = multi*0.5
                        break;
                    case "Dragon":
                        multi = multi*2
                        break;
                    case "Fée":
                        multi = 0
                        break;
                    default:
                        break;
                }
                break;
            case "Eau":
                switch(typeDef) {
                    case "Dragon":
                        multi = multi*0.5
                        break;
                    case "Eau":
                        multi = multi*0.5
                        break;
                    case "Feu":
                        multi = multi*2
                        break;
                    case "Plante":
                        multi = multi*0.5
                        break;
                    case "Roche":
                        multi = multi*2
                        break;
                    case "Sol":
                        multi = multi*2
                        break;
                    default:
                        break;
                }
                break;
            case "Électrik":
                switch(typeDef) {
                    case "Dragon":
                        multi = multi*0.5
                        break;
                    case "Eau":
                        multi = multi*2
                        break;
                    case "Électrik":
                        multi = multi*0.5
                        break;
                    case "Plante":
                        multi = multi*0.5
                        break;
                    case "Sol":
                        multi = 0
                        break;
                    case "Vol":
                        multi = multi*2
                        break;
                    default:
                        break;
                }
                break;
            case "Fée":
                switch(typeDef) {
                    case "Acier":
                        multi = multi*0.5
                        break;
                    case "Combat":
                        multi = multi*2
                        break;
                    case "Dragon":
                        multi = multi*2
                        break;
                    case "Feu":
                        multi = multi*0.5
                        break;
                    case "Poison":
                        multi = multi*0.5
                        break;
                    case "Ténèbres":
                        multi = multi*0.5
                        break;
                    default:
                        break;
                }
                break;
            case "Feu":
                switch(typeDef) {
                    case "Acier":
                        multi = multi*2
                        break;
                    case "Dragon":
                        multi = multi*0.5
                        break;
                    case "Eau":
                        multi = multi*0.5
                        break;
                    case "Feu":
                        multi = multi*0.5
                        break;
                    case "Glace":
                        multi = multi*2
                        break;
                    case "Insecte":
                        multi = multi*2
                        break;
                    case "Plante":
                        multi = multi*2
                        break;
                    case "Roche":
                        multi = multi*0.5
                        break;
                    default:
                        break;
                }
                break;
            case "Glace":
                switch(typeDef) {
                    case "Acier":
                        multi = multi*0.5
                        break;
                    case "Dragon":
                        multi = multi*2
                        break;
                    case "Eau":
                        multi = multi*0.5
                        break;
                    case "Feu":
                        multi = multi*0.5
                        break;
                    case "Glace":
                        multi = multi*0.5
                        break;
                    case "Plante":
                        multi = multi*2
                        break;
                    case "Sol":
                        multi = multi*2
                        break;
                    case "Vol":
                        multi = multi*2
                        break;
                    default:
                        break;
                }
                break;
            case "Insecte":
                switch(typeDef) {
                    case "Acier":
                        multi = multi*0.5
                        break;
                    case "Combat":
                        multi = multi*0.5
                        break;
                    case "Fée":
                        multi = multi*0.5
                        break;
                    case "Feu":
                        multi = multi*0.5
                        break;
                    case "Plante":
                        multi = multi*2
                        break;
                    case "Poison":
                        multi = multi*0.5
                        break;
                    case "Psy":
                        multi = multi*2
                        break;
                    case "Spectre":
                        multi = multi*0.5
                        break;
                    case "Ténèbres":
                        multi = multi*2
                        break;
                    case "Vol":
                        multi = multi*0.5
                        break;
                    default:
                        break;
                }
                break;
            case "Normal":
                switch(typeDef) {
                    case "Acier":
                        multi = multi*0.5
                        break;
                    case "Roche":
                        multi = multi*0.5
                        break;
                    case "Spectre":
                        multi = 0
                        break;
                    default:
                        break;
                }
                break;
            case "Plante":
                switch(typeDef) {
                    case "Acier":
                        multi = multi*0.5
                        break;
                    case "Dragon":
                        multi = multi*0.5
                        break;
                    case "Eau":
                        multi = multi*2
                        break;
                    case "Feu":
                        multi = multi*0.5
                        break;
                    case "Insecte":
                        multi = multi*0.5
                        break;
                    case "Plante":
                        multi = multi*0.5
                        break;
                    case "Poison":
                        multi = multi*0.5
                        break;
                    case "Roche":
                        multi = multi*2
                        break;
                    case "Sol":
                        multi = multi*2
                        break;
                    case "Vol":
                        multi = multi*0.5
                        break;
                    default:
                        break;
                }
                break;
            case "Poison":
                switch(typeDef) {
                    case "Acier":
                        multi = 0
                        break;
                    case "Fée":
                        multi = multi*2
                        break;
                    case "Plante":
                        multi = multi*2
                        break;
                    case "Poison":
                        multi = multi*0.5
                        break;
                    case "Roche":
                        multi = multi*0.5
                        break;
                    case "Sol":
                        multi = multi*0.5
                        break;
                    case "Spectre":
                        multi = multi*0.5
                        break;
                    default:
                        break;
                }
                break;
            case "Psy":
                switch(typeDef) {
                    case "Acier":
                        multi = multi*0.5
                        break;
                    case "Combat":
                        multi = multi*2
                        break;
                    case "Poison":
                        multi = multi*2
                        break;
                    case "Psy":
                        multi = multi*0.5
                        break;
                    case "Ténèbres":
                        multi = 0
                        break;
                    default:
                        break;
                }
                break;
            case "Roche":
                switch(typeDef) {
                    case "Acier":
                        multi = multi*0.5
                        break;
                    case "Combat":
                        multi = multi*0.5
                        break;
                    case "Feu":
                        multi = multi*2
                        break;
                    case "Glace":
                        multi = multi*2
                        break;
                    case "Insecte":
                        multi = multi*2
                        break;
                    case "Sol":
                        multi = multi*0.5
                        break;
                    case "Vol":
                        multi = multi*2
                        break;
                    default:
                        break;
                }
                break;
            case "Sol":
                switch(typeDef) {
                    case "Acier":
                        multi = multi*2
                        break;
                    case "Électrik":
                        multi = multi*2
                        break;
                    case "Feu":
                        multi = multi*2
                        break;
                    case "Insecte":
                        multi = multi*0.5
                        break;
                    case "Plante":
                        multi = multi*0.5
                        break;
                    case "Poison":
                        multi = multi*2
                        break;
                    case "Roche":
                        multi = multi*2
                        break;
                    case "Vol":
                        multi = 0
                        break;
                    default:
                        break;
                }
                break;
            case "Spectre":
                switch(typeDef) {
                    case "Normal":
                        multi = 0
                        break;
                    case "Psy":
                        multi = multi*2
                        break;
                    case "Spectre":
                        multi = multi*2
                        break;
                    case "Ténèbres":
                        multi = multi*0.5
                        break;
                    default:
                        break;
                }
                break;
            case "Ténèbres":
                switch(typeDef) {
                    case "Combat":
                        multi = multi*0.5
                        break;
                    case "Fée":
                        multi = multi*0.5
                        break;
                    case "Psy":
                        multi = multi*2
                        break;
                    case "Spectre":
                        multi = multi*2
                        break;
                    case "Ténèbres":
                        multi = multi*0.5
                        break;
                    default:
                        break;
                }
                break;
            case "Vol":
                switch(typeDef) {
                    case "Acier":
                        multi = multi*0.5
                        break;
                    case "Combat":
                        multi = multi*2
                        break;
                    case "Électrik":
                        multi = multi*0.5
                        break;
                    case "Insecte":
                        multi = multi*2
                        break;
                    case "Plante":
                        multi = multi*2
                        break;
                    case "Roche":
                        multi = multi*0.5
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }
    });

    return multi;

}

function tryDodge(attack, attPokemon, defPokemon, multi = 1) {
    let chanceDodge = (attPokemon["stats"][5]/2) + (defPokemon["stats"][5]/4) + ((30 * attack["precision"])/256);
    let rand = Math.floor(Math.random() * 100);
    return chanceDodge >= rand;
}

function tryPrecision(attack, multi = 1) {
    let rand = Math.floor(Math.random() * 100);
    return Math.floor(attack["precision"] * multi) >= rand;
}

function chooseAttack(combatObject, message) {
    return new Promise(async resolve => {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setColor("#ffffff");
        msgEmbed.setTitle("Quelle attaque souhaitez-vous utiliser ?");
        let pokemon = combatObject["playerPokemonSent"];
        let cpt = 0;
        pokemon["capacities"].forEach(capacity => {
            msgEmbed.addFields({
                name: capacity.name + "(" + capacity.type + ")",
                value: "Attaque " + capacity.category + "\nPuissance : " + capacity.puissance + "\nPrécision : " + capacity.precision + " %",
                inline: true
            });
            cpt++;
            if (cpt % 2 === 0) msgEmbed.addFields({name: " ", value: " "});
        });

        let msgSent = await message.channel.send({embeds: [msgEmbed]});

        for (let i = 0; i < cpt; i++) await msgSent.react(emojis[i]);
        await msgSent.react('❌');

        const filter = (reaction, user) => {
            return emojis.includes(reaction.emoji.name) && !user.bot;
        };

        let collector = msgSent.createReactionCollector(filter, {time: 15000});

        collector.on('collect', (reaction, user) => {
            if (user.id === message.author.id) {
                let i = 0;
                while (i < cpt) {
                    if (reaction.emoji.name === emojis[i]) {
                        resolve(pokemon["capacities"][i]);
                        collector.stop();
                        return;
                    }
                    i++;
                }
                if (reaction.emoji.name === "❌") {
                    resolve(false);
                    collector.stop();
                }
            } else if (!user.bot) {
                let msgEmbed = new EmbedBuilder();
                msgEmbed.setTitle("Vous ne pouvez pas réagir aux messages des autres !");
                msgEmbed.setDescription("<@" + user.id + "> fait plus ça c'est pas bien !");
                msgEmbed.setColor("#ff0000");
                msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                message.channel.send({embeds: [msgEmbed]});
            }
        });
    })
}

function chooseAction(message) {
    return new Promise(async resolve => {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Quelle action souhaitez-vous faire ?");
        msgEmbed.setColor("#ffffff");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});
        msgEmbed.addFields({name: "Attaquer", value: ":crossed_swords:", inline: true});
        msgEmbed.addFields({name: "Fuir", value: ":person_running:", inline: true});
        msgEmbed.addFields({name: "Changer de pokémon", value: ":arrows_counterclockwise:", inline: true});
        msgEmbed.addFields({name: "Utiliser un objet", value: "(pas dispo)"});

        let msgSent = await message.channel.send({embeds: [msgEmbed]});

        await msgSent.react('⚔️');
        await msgSent.react('🏃');
        await msgSent.react('🔄');

        const filter = (reaction, user) => {
            return emojis.includes(reaction.emoji.name) && !user.bot;
        };

        let collector = msgSent.createReactionCollector(filter, {time: 15000});

        collector.on('collect', (reaction, user) => {
            if (user.id === message.author.id) {
                if (reaction.emoji.name === "⚔️") resolve(1);
                else if (reaction.emoji.name === "🏃") resolve(2);
                else if (reaction.emoji.name === "🔄") resolve(3);

                collector.stop();
            } else if (!user.bot) {
                let msgEmbed = new EmbedBuilder();
                msgEmbed.setTitle("Vous ne pouvez pas réagir aux messages des autres !");
                msgEmbed.setDescription("<@" + user.id + "> fait plus ça c'est pas bien !");
                msgEmbed.setColor("#ff0000");
                msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                message.channel.send({embeds: [msgEmbed]});
            }
        });
    });
}

function checkWinConditions(combatObject) {
    if (combatObject["escape"]) return 0;
    let playerPokemonTeamHP = 0
    combatObject["playerTeam"].forEach(pokemon => {
       if (pokemon["currentHP"] <= 0) pokemon["currentHP"] = 0;
       playerPokemonTeamHP += pokemon["currentHP"];
    });
    if (playerPokemonTeamHP === 0) return 1;
    let enemyPokemonTeamHP = 0;
    combatObject["enemyTeam"].forEach(pokemon => {
        if (pokemon["currentHP"] <= 0) pokemon["currentHP"] = 0;
        enemyPokemonTeamHP += pokemon["currentHP"];
    })
    if (enemyPokemonTeamHP === 0) return 2;
    return -1;
}

module.exports = {
    prepareCombat
}