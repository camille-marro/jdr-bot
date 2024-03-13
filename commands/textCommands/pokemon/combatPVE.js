const {EmbedBuilder} = require("discord.js");

const {getPlayerTeam, addExp, comparePokemonUUID, updateData} = require("./assets");
const {emojis} = require("./utils");

function startCombatPVE(player, enemyPokemon, message, titleStr = "Vous croisez un pokémon sauvage !", canEscape = true) {
    return new Promise((resolve) => {
        // console.log("starting a pve combat against " + enemyPokemon.name);
        let team = getPlayerTeam(player);
        // check si un pokémon dans la team

        let combatObject = {
            "playerTurn": true,
            "pokemonsSent": [0],
            "pokemonSent": team[0],
            "fuite": false,
            "fuiteCpt": 0
        }

        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle(titleStr);
        msgEmbed.setColor("#00ce5e");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});
        msgEmbed.addFields({name: enemyPokemon.name, value: "Niveau " + enemyPokemon.level});
        message.channel.send({embeds: [msgEmbed]});

        combatPVE(player, enemyPokemon, team, combatObject, message, canEscape).then(res => {
            // console.log("fin du combat !");
            if (res === "win") {
                let msgEmbed = new EmbedBuilder();
                msgEmbed.setTitle("Victoire ! " + enemyPokemon.name + " ennemi est K.O. !");
                msgEmbed.setColor("#fff300");
                msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});
                message.channel.send({embeds: [msgEmbed]});

                rewardCombat(team, enemyPokemon, combatObject, message).then(rewardResult => {

                    if (rewardResult[0].length > 1) {
                        let i = 0;
                        while (i < rewardResult[0].length) {
                            let msgEmbed = new EmbedBuilder();
                            msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});
                            msgEmbed.setColor("#00ce5e");
                            let pokemon = team[combatObject["pokemonsSent"][i]];
                            let xpWon = Math.ceil(rewardResult[1] / combatObject["pokemonsSent"].length)
                            msgEmbed.setTitle(pokemon.name + " a gagné " + xpWon + " xp");
                            if (rewardResult[0][i] > 0) msgEmbed.addFields({name: "Niveau(x) gagné(s)", value: rewardResult[0][i].toString()});
                            message.channel.send({embeds: [msgEmbed]});
                            i++;
                        }
                        // console.log(rewardResult);
                    } else {
                        let msgEmbed = new EmbedBuilder();
                        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});
                        msgEmbed.setColor("#00ce5e");
                        msgEmbed.setTitle(team[0].name + " a gagné " + rewardResult[1] + " xp");
                        if (rewardResult[0][0] > 0) msgEmbed.addFields({name: "Niveau(x) gagné(s)", value: rewardResult[0][0].toString()});
                        message.channel.send({embeds: [msgEmbed]});
                        // console.log(rewardResult);
                    }
                });
                resolve("win");
            } else if (res === "fuite") {
                let msgEmbed = new EmbedBuilder();
                msgEmbed.setTitle("Vous avez réussi à fuire le combat !");
                msgEmbed.setColor("#ffffff");
                msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});
                message.channel.send({embeds: [msgEmbed]});
                // console.log("Gros looser t'as fuit ...");
                resolve("fuite");
            } else if (res === "defeat") {
                let msgEmbed = new EmbedBuilder();
                msgEmbed.setTitle("Défaite ! " + enemyPokemon.name + " a réussi à mettre K.O. tous vos pokémons");
                msgEmbed.setColor("#ff0000");
                msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});
                message.channel.send({embeds: [msgEmbed]});
                // console.log("Gros looser t'as perdu en 1000 vs 1");
                resolve("defeat");
            }

            updateData();
        });
    });

}

function combatPVE(player, enemyPokemon, playerTeam, combatObject, message, canEscape = true) {
    // console.log("Starting a turn !");
    // console.log(combatObject);
    return new Promise(async (resolve, reject) => {
        // console.log("Checking win or lose conditions");
        if (enemyPokemon["currentHP"] <= 0) {
            // console.log("enemy pokemon dead, ending turn ...");
            resolve("win");
            return;
        } else if (checkPlayerLose(playerTeam)) {
            // console.log("player lose, ending turn ...");
            resolve("defeat");
            return;
        } else if (combatObject["fuite"]) {
            // console.log("player escape, ending turn");
            resolve("fuite");
            return;
        }
        // console.log("no win/lose condition, continuing");

        let attackResult, titleStr;
        if (combatObject["playerTurn"]) {
            // console.log("player turn !");
            let attack = await chooseAttack(combatObject, message);
            if (attack === "fuite") {
                if (!canEscape) {
                    let msgEmbed = new EmbedBuilder();
                    msgEmbed.setTitle("Vous ne pouvez pas vous enfuir !");
                    msgEmbed.setDescription("Il est impossible de s'enfuir pendant ce combat !");
                    msgEmbed.setColor("#ff0000");
                    msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                    message.channel.send({embeds: [msgEmbed]});
                    resolve(combatPVE(player, enemyPokemon, playerTeam, combatObject, message));
                }
                if(tryEscape(combatObject, enemyPokemon)) {
                    combatObject["fuite"] = true;
                } else {
                    combatObject["fuiteCpt"]++;
                }
                combatObject["playerTurn"] = !combatObject["playerTurn"];
                // console.log("ending player turn.");
                resolve(combatPVE(player, enemyPokemon, playerTeam, combatObject, message));
                return;
            } else if (attack === "changePokemon") {
                let changePokemonRes = await changePokemon(playerTeam, combatObject, message);
                if (changePokemonRes) combatObject["playerTurn"] = !combatObject["playerTurn"];
                // console.log("ending player turn.");
                resolve(combatPVE(player, enemyPokemon, playerTeam, combatObject, message));
                return;
            } else if (!attack) {
                // console.log("aled ?");
                resolve(false);
                return;
            }
            attackResult = attackPokemon(combatObject["pokemonSent"], enemyPokemon, attack);
            titleStr = combatObject["pokemonSent"].name + " utilise " + attack.name + ".";
        } else {
            // console.log("wild pokemon turn !");
            let attack = enemyPokemon["capacities"][Math.floor(Math.random() * enemyPokemon["capacities"].length)];

            // console.log("wild pokemon use : " + attack.name);
            // console.log(attack);
            attackResult = attackPokemon(enemyPokemon, combatObject["pokemonSent"], attack);
            titleStr = enemyPokemon.name + " utilise " + attack.name + ".";
        }

        let msgEmbed = new EmbedBuilder();
        if (attackResult["cc"]) {
            // console.log("Coup critique !");
            titleStr += " Coup Critique !"
            msgEmbed.setColor("#fff300");
        } else msgEmbed.setColor("#ff5600");

        if (attackResult["avantageType"] === 0) {
            if (combatObject["playerTurn"]) titleStr += ` Cela n'affecte pas ${enemyPokemon.name} ... `;
            else titleStr += ` Cela n'affecte pas ${combatObject["pokemonSent"].name} ... `;
            // console.log("Immunité !");
        } else if (attackResult["avantageType"] < 1) {
            // console.log("Ce n'est pas très efficace ...");
            titleStr += " Ce n'est pas très efficace ... ";
        } else if (attackResult["avantageType"] > 1) {
            // console.log("C'est très efficace");
            titleStr += " C'est super efficace ! ";
        }

        msgEmbed.setTitle(titleStr);
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});

        msgEmbed.addFields({name:combatObject["pokemonSent"]["name"], value: getStringHPLeft(combatObject["pokemonSent"]["currentHP"],combatObject["pokemonSent"]["stats"][0]), inline: true});
        msgEmbed.addFields({name:enemyPokemon["name"], value:getStringHPLeft(enemyPokemon["currentHP"], enemyPokemon["stats"][0]), inline: true});

        message.channel.send({embeds: [msgEmbed]});
        // console.log("damage : " + attackResult["damage"]);
        // console.log("ending turn !");
        combatObject["playerTurn"] = !combatObject["playerTurn"];
        resolve(combatPVE(player, enemyPokemon, playerTeam, combatObject, message));
    });
}

function changePokemon(playerTeam, combatObject, message) {
    // console.log("Changement du pokémon !");
    return new Promise(async (resolve, reject) => {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Choisissez le pokémon à envoyer au combat");
        msgEmbed.setColor("#285eb2");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});

        for (let i = 0; i < playerTeam.length; i++) {
            let pokemon = playerTeam[i];

            let name;
            if (pokemon["shiny"]) name = pokemon.name + ":sparkles: (lvl:" + pokemon.level + ")";
            else name = pokemon.name + " (lvl:" + pokemon.level + ")";

            let value;
            if (pokemon["currentHP"] > 0) value = pokemon["currentHP"] + "/" + pokemon["stats"][0] + " HP";
            else value = "K.O.";

            msgEmbed.addFields({name: name, value: value, inline: true});
        }

        msgEmbed.addFields({name: "Annuler", value: emojis[playerTeam.length]});

        let msgSent = await message.channel.send({embeds: [msgEmbed]});

        for (let i = 0; i < playerTeam.length + 1; i++) {
            await msgSent.react(emojis[i]);
        }

        const filter = (reaction, user) => {
            return emojis.includes(reaction.emoji.name) && !user.bot;
        };

        let collector = msgSent.createReactionCollector(filter, {time: 15000});

        collector.on('collect', (reaction, user) => {
            if (user.id === message.author.id) {
                let i = 0;
                while (i <= playerTeam.length) {
                    if (reaction.emoji.name === emojis[i]) {
                        if (i === playerTeam.length) {
                            // console.log("Annulation du changement de pokémon");
                            collector.stop();
                            resolve(false);
                            return;
                        }
                        if (playerTeam[i]["currentHP"] <= 0) {
                            // console.log("Le pokémon est KO on refait");
                            let msgEmbed = new EmbedBuilder();
                            msgEmbed.setTitle("Vous ne pouvez pas envoyer un pokémon K.O. au combat !");
                            msgEmbed.setColor("#ff0000");
                            msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                            message.channel.send({embeds: [msgEmbed]});
                            collector.stop();
                            resolve(changePokemon(playerTeam, combatObject, message));
                            return;
                        } else if (comparePokemonUUID(combatObject["pokemonSent"], playerTeam[i])) {
                            // console.log("Le pokémon est déjà au combat on refait !");
                            let msgEmbed = new EmbedBuilder();
                            msgEmbed.setTitle("Ce pokémon est déjà en combat !");
                            msgEmbed.setColor("#ff0000");
                            msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                            message.channel.send({embeds: [msgEmbed]});
                            collector.stop();
                            resolve(changePokemon(playerTeam, combatObject, message));
                            return;
                        } else {
                            // console.log("On envoie le pokemon " + playerTeam[i].name);
                            combatObject["pokemonSent"] = playerTeam[i];
                            if (!combatObject["pokemonsSent"].includes(i)) combatObject["pokemonsSent"].push(i);
                            collector.stop();
                            resolve(true);
                            return;
                        }
                    }
                    i++;
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
    });
}

function rewardCombat(playerTeam, enemyPokemon, combatObject, message, multi = 1) {
    return new Promise(async (resolve, reject) => {
        let xpToAdd = Math.ceil(enemyPokemon["level"] * 3 * multi);
        let xpPerPokemon = Math.ceil(xpToAdd / combatObject["pokemonsSent"].length);

        let lvlUpPokemons = [];

        for (const index of combatObject["pokemonsSent"]) {
            let pokemon = playerTeam[index];
            let lvlUp = await addExp(pokemon, xpPerPokemon, message);
            lvlUpPokemons.push(lvlUp);
        }

        resolve([lvlUpPokemons, xpToAdd]);
    });
}

function getStringHPLeft(currentHP, maxHP) {
    let percent = (currentHP/maxHP)*100;
    let nbSquare = Math.floor(percent / 10);

    let finalStr = "";

    for (let i = 0; i < 10; i++) {
        if (currentHP === 0) finalStr += ":black_large_square: ";
        else if (i > nbSquare) finalStr += ":black_large_square: ";
        else if (i > 1 && i <= 4) finalStr += ":orange_square: ";
        else if (i > 4) finalStr += ":green_square: ";
        else finalStr += ":red_square: ";
    }

    finalStr += "\n" + currentHP + " / " + maxHP;

    return finalStr;
}

function attackPokemon(pokemon, enemyPokemon, attack) {
    let avantageType = getAvantageType(attack["type"], enemyPokemon["types"]);
    let cc = getCC(pokemon["level"], pokemon["stats"][5]);

    let multi = cc * avantageType;

    let puissanceAttaque = attack["puissance"];
    let damage;

    if (attack["category"] === "physique") {
        damage = Math.ceil(((((((pokemon["level"] * 0.4) + 2) * pokemon["stats"][1] * puissanceAttaque) / enemyPokemon["stats"][2]) / 50) + 2) * multi);
    } else if (attack["category"] === "spéciale") {
        damage = Math.ceil(((((((pokemon["level"] * 0.4) + 2) * pokemon["stats"][3] * puissanceAttaque) / enemyPokemon["stats"][4]) / 50) + 2) * multi);
    } else {
        damage = 0;
    }

    enemyPokemon["currentHP"] -= damage;
    return {
        "cc": cc > 1,
        "avantageType": avantageType,
        "damage": damage
    }
}

function tryEscape(combatObject, enemyPokemon, multi = 1) {
    // console.log("trying to escape");
    let playerPokemon = combatObject["pokemonSent"];
    let A = playerPokemon["stats"][5]*32;
    let B = Math.floor(enemyPokemon["stats"][5]/4)%255;
    let chance = (Math.floor(A/B)+30)*multi;

    if (chance > 255) {
        // console.log("fuite réussie !")
        return true
    }

    let rand = Math.floor(Math.random() * 256);

    // console.log("fuite : " + rand <= chance);
    return rand <= chance;
}

function chooseAttack(combatObject, message) {
    // console.log("choosing attack");
    return new Promise(async (resolve, reject) => {
        let pokemon = combatObject["pokemonSent"];

        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Choisissez votre attaque !");
        msgEmbed.setColor("#0823a8");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});

        for (let i = 0; i < pokemon["capacities"].length; i++) {
            msgEmbed.addFields({
                name: pokemon["capacities"][i]["name"] + " (" + pokemon["capacities"][i]["type"] + ")",
                value: emojis[i],
                inline: true
            });
            if ((i % 2) === 1) msgEmbed.addFields({name: " ", value: " "});
        }

        msgEmbed.addFields({name: "Fuite", value: emojis[pokemon["capacities"].length], inline: true});
        msgEmbed.addFields({name: "Changer de pokémon", value: emojis[pokemon["capacities"].length+1], inline: true});

        let msgSent = await message.channel.send({embeds: [msgEmbed]});

        for (let i = 0; i <= (pokemon["capacities"].length + 1); i++) await msgSent.react(emojis[i]);

        const filter = (reaction, user) => {
            return emojis.includes(reaction.emoji.name) && !user.bot;
        };

        const collector = msgSent.createReactionCollector(filter, {time: 15000});

        collector.on("collect", (reaction, user) => {
            if (user.id === message.author.id) {
                if (reaction.emoji.name === emojis[pokemon["capacities"].length]) {
                    // console.log("escape selected !");
                    resolve("fuite");
                    collector.stop();
                    return;
                } else if (reaction.emoji.name === emojis[pokemon["capacities"].length+1]) {
                    // console.log("change pokemon selected !");
                    resolve("changePokemon");
                    collector.stop();
                    return;
                }

                let i = 0;
                while (i < 4) {
                    if (reaction.emoji.name === emojis[i]) {
                        // console.log(pokemon["capacities"][i].name + " selected");
                        resolve(pokemon["capacities"][i]);
                        collector.stop();
                        return;
                    }
                    i++;
                }

                // console.log("unknown emoji");
                resolve(false);
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

function checkPlayerLose(playerTeam) {
    let sum = 0;
    playerTeam.forEach(pokemon => {
        if (pokemon["currentHP"] < 0) pokemon["currentHP"] = 0;
        sum += pokemon["currentHP"];
    });

    return sum <= 0;
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

function getCC(level, speed, modif = 1) {
    let damageMulti = ((2*level)+5)/(2*level);
    let rand = Math.floor(Math.random() * 256);
    let chance = (Math.floor(speed/2) * modif);
    if (chance >= 255) chance = 254;

    if (chance > rand) return damageMulti;
    else return 1;
}

module.exports = {
    startCombatPVE
}