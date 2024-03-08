const {EmbedBuilder} = require('discord.js');

let { getPlayerWithId, getPlayerPokemonsWithName, updateData, parsePokemon, drawPokemon, addExp, getPlayerTeam} = require("./assets");
const { emojis } = require("./utils");

function defi(message) {
    let args = message.content.split(" ");
    let player = getPlayerWithId(message.author.id);

    if (!player) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Vous n'avez pas de compte !");
        msgEmbed.setDescription("Pour vous inscrire utilisez la commande *pokemon start* !");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});

        message.channel.send({embeds: [msgEmbed]});
        return;
    }

    if (!args[2]) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Veuillez choisir un joueur à défier !");
        msgEmbed.setDescription("Pour défier quelqu'un il suffit de le mentionner dans la commande.");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});

        message.channel.send({embeds: [msgEmbed]});
        return;
    }

    let enemyId = args[2].slice(2, args[2].length-1);
    let enemy = getPlayerWithId(enemyId);
    if (!enemy) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Cette personne n'est pas un joueur !");
        msgEmbed.setDescription("Veuillez choisir un joueur actif à défier.");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});

        message.channel.send({embeds: [msgEmbed]});
        return;
    }

    if (player["team"].length === 0) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Vous n'avez aucun pokémon dans votre équipe !");
        msgEmbed.setDescription("Pour ajouter un pokémon à votre équipe utilisez la commande *pokemon team create*.");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});

        message.channel.send({embeds: [msgEmbed]});
        return;
    }

    if (!enemy.hasOwnProperty("team")) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Votre adversaire n'a aucun pokémon dans son équipe !");
        msgEmbed.setDescription("Pour ajouter un pokémon à votre équipe utilisez la commande *pokemon team create*.");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});

        message.channel.send({embeds: [msgEmbed]});
        return;
    }

    if (enemy["team"].length === 0) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Votre adversaire n'a aucun pokémon dans son équipe !");
        msgEmbed.setDescription("Pour ajouter un pokémon à votre équipe utilisez la commande *pokemon team create*.");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});

        message.channel.send({embeds: [msgEmbed]});
        return;
    }

    startCombatPVP(player, enemy, message).then((res, rej) => {

    })
}

function startCombatPVP(player, enemy, message) {
    return new Promise((resolve, reject) => {
        let combatObject = {
            "playerTeamHP": [0, 0, 0, 0, 0, 0],
            "playerPokemonSent": 0,
            "enemyTeamHP": [0, 0, 0, 0, 0, 0],
            "enemyPokemonSent": 0,
            "playerTurn": true
        }

        let playerTeam = getPlayerTeam(player);
        let enemyTeam = getPlayerTeam(enemy);

        for(let i = 0; i < player["team"].length; i++) combatObject["playerTeamHP"][i] = playerTeam[i]["currentHP"];
        for(let i = 0; i < enemy["team"].length; i++) combatObject["enemyTeamHP"][i] = enemyTeam[i]["currentHP"];

        if (checkDefeat("player", combatObject)) {
            let msgEmbed = new EmbedBuilder();
            msgEmbed.setTitle("Vous n'avez aucun pokémon apte au combat dans votre équipe !");
            msgEmbed.setDescription("Pour soigner vos pokémons utilisez la commande *p heal*.");
            msgEmbed.setColor("#ff0000");
            msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});

            message.channel.send({embeds: [msgEmbed]});
            return;
        } else if (checkDefeat("enemy", combatObject)) {
            let msgEmbed = new EmbedBuilder();
            msgEmbed.setTitle("Votre adversaire n'aucun pokémon apte au combat dans son équipe !");
            msgEmbed.setDescription("Pour soigner vos pokémons utilisez la commande *p heal*.");
            msgEmbed.setColor("#ff0000");
            msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});

            message.channel.send({embeds: [msgEmbed]});
            return;
        }

        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle(player["discordName"] + " défi " + enemy["discordName"] + " dans un combat Pokémon !");

        let teamPlayer = getPlayerTeam(player);
        let teamEnemy = getPlayerTeam(enemy);
        let attackerPokemon = teamPlayer[0];
        let defenderPokemon = teamEnemy[0]

        msgEmbed.addFields({name:attackerPokemon["name"], value: getStringHPLeft(combatObject["playerTeamHP"][combatObject["playerPokemonSent"]],attackerPokemon["stats"][0]), inline: true});
        msgEmbed.addFields({name:defenderPokemon["name"], value:getStringHPLeft(combatObject["enemyTeamHP"][combatObject["enemyPokemonSent"]], defenderPokemon["stats"][0]), inline: true});
        msgEmbed.setColor("#0293af");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});

        message.channel.send({embeds: [msgEmbed]});

        combatPVP(player, enemy, combatObject, message).then((res, rej) => {
            if (res) {
                let msgEmbed = new EmbedBuilder();

                msgEmbed.setTitle(player["discordName"] + " a gagné son combat contre " + enemy["discordName"] + " !");
                msgEmbed.setColor("#08ff00");
                msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});
                message.channel.send({embeds: [msgEmbed]});
            } else {
                let msgEmbed = new EmbedBuilder();

                msgEmbed.setTitle(player["discordName"] + " a perdu son combat contre " + enemy["discordName"] + " !");
                msgEmbed.setColor("#f120ab");
                msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});
                message.channel.send({embeds: [msgEmbed]});
            }
        });
    });
}

function combatPVP(player, enemy, combatObject, message) {
    return new Promise(async (resolve, reject) => {
        console.log("Debut d'un tour !");
        console.log(combatObject);
        if (checkDefeat("player", combatObject)) {
            resolve(false);
            return;
        } else if (checkDefeat("enemy", combatObject)) {
            resolve(true);
            return;
        }

        if (combatObject["playerTurn"]) {
            let playerTeam = getPlayerTeam(player);
            let pokemon = playerTeam[combatObject["playerPokemonSent"]];
            let msgEmbed = new EmbedBuilder();

            if(combatObject["playerTeamHP"][combatObject["playerPokemonSent"]] <= 0) {
                console.log("pokémon KO !");

                msgEmbed.setTitle(player["discordName"] + " votre " + playerTeam[combatObject["playerPokemonSent"]].name + " est K.O. !");
                msgEmbed.setColor("#b62626");
                msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});
                message.channel.send({embeds: [msgEmbed]});

                await changePokemon(player, true, combatObject, message).then((res, rej) => {
                    if (res) {
                        pokemon = playerTeam[combatObject["playerPokemonSent"]];

                        let msgEmbed = new EmbedBuilder();
                        msgEmbed.setTitle(pokemon["name"] + " vient d'être envoyé au combat !");
                        msgEmbed.setColor("#0aefd0");
                        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                        message.channel.send({embeds: [msgEmbed]});
                    }
                });
                console.log("changed pokémon");
                console.log(combatObject);
            }

            console.log("choose attack");
            msgEmbed.setTitle(player["discordName"] + " choisissez votre attaque !");
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

            if (playerTeam.length > 1) msgEmbed.addFields({name: "Envoyer un autre pokémon", value: emojis[pokemon["capacities"].length]});

            let msgSent = await message.channel.send({embeds: [msgEmbed]});

            for (let i = 0; i < pokemon["capacities"].length + 1; i++) await msgSent.react(emojis[i]);

            const filter = (reaction, user) => {
                return emojis.includes(reaction.emoji.name) && !user.bot;
            };

            const collector = msgSent.createReactionCollector(filter, {time: 15000});

            collector.on("collect", async (reaction, user) => {
                if (user.id.toString() === player["discordId"]) {
                    console.log("attack chosen");
                    if (reaction.emoji.name === emojis[pokemon["capacities"].length]) {
                        console.log("chose to change pokemon");
                        await changePokemon(player, true, combatObject, message).then((res, rej) => {
                            if (res) {
                                pokemon = playerTeam[combatObject["playerPokemonSent"]];
                                combatObject["playerTurn"] = false;

                                let msgEmbed = new EmbedBuilder();
                                msgEmbed.setTitle(pokemon["name"] + " vient d'être envoyé au combat !");
                                msgEmbed.setColor("#0aefd0");
                                msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                                message.channel.send({embeds: [msgEmbed]});
                            }
                        });
                        console.log("pokemon changed");
                        console.log(combatObject);
                        console.log("Fin du tour de jeu !");

                        collector.stop();
                        resolve(combatPVP(player, enemy, combatObject, message));
                        return;
                    }

                    console.log("Attacking !");
                    attackPokemon(player, enemy, "player", combatObject, reaction, message);

                    console.log("Fin du tour de jeu !");
                    collector.stop();
                    resolve(combatPVP(player, enemy, combatObject, message));

                } else if (!user.bot) {
                    let msgEmbed = new EmbedBuilder();
                    msgEmbed.setTitle("Vous ne pouvez pas réagir aux messages des autres !");
                    msgEmbed.setDescription("<@" + user.id + "> fait plus ça c'est pas bien !");
                    msgEmbed.setColor("#ff0000");
                    msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                    message.channel.send({embeds: [msgEmbed]});
                }
            });
        } else {
            let enemyTeam = getPlayerTeam(enemy);
            let pokemon = enemyTeam[combatObject["enemyPokemonSent"]];
            let msgEmbed = new EmbedBuilder();

            if(combatObject["enemyTeamHP"][combatObject["enemyPokemonSent"]] <= 0) {
                // pokémon KO
                msgEmbed.setTitle(enemy["discordName"] + " votre " + enemyTeam[combatObject["enemyPokemonSent"]].name + " est K.O. !");
                msgEmbed.setColor("#b62626");
                msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});
                message.channel.send({embeds: [msgEmbed]});

                await changePokemon(enemy, false, combatObject, message).then((res, rej) => {
                    if (res) {
                        pokemon = enemyTeam[combatObject["enemyPokemonSent"]];

                        let msgEmbed = new EmbedBuilder();
                        msgEmbed.setTitle(pokemon["name"] + " vient d'être envoyé au combat !");
                        msgEmbed.setColor("#0aefd0");
                        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                        message.channel.send({embeds: [msgEmbed]});
                    }
                });
            }

            msgEmbed.setTitle(enemy["discordName"] + " choisissez votre attaque !");
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

            msgEmbed.addFields({name: "Envoyer un autre pokémon", value: emojis[pokemon["capacities"].length]});

            let msgSent = await message.channel.send({embeds: [msgEmbed]});

            for (let i = 0; i < pokemon["capacities"].length + 1; i++) await msgSent.react(emojis[i]);

            const filter = (reaction, user) => {
                return emojis.includes(reaction.emoji.name) && !user.bot;
            };

            const collector = msgSent.createReactionCollector(filter, {time: 15000});

            collector.on("collect", async (reaction, user) => {
                if (user.id.toString() === enemy["discordId"]) {
                    if (reaction.emoji.name === emojis[pokemon["capacities"].length]) {
                        console.log("Joueur veux changer pokémon !");
                        await changePokemon(enemy, false, combatObject, message).then((res, rej) => {
                            if (res) {
                                console.log(enemy);
                                console.log(combatObject);
                                combatObject["playerTurn"] = true;
                                pokemon = enemyTeam[combatObject["playerPokemonSent"]];

                                let msgEmbed = new EmbedBuilder();
                                msgEmbed.setTitle(pokemon["name"] + " vient d'être envoyé au combat !");
                                msgEmbed.setColor("#0aefd0");
                                msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                                message.channel.send({embeds: [msgEmbed]});

                                collector.stop();
                            }
                        });
                        console.log("Joueur a changé pokémon !");
                        console.log("Fin du tour de jeu ! - Enemy");
                        console.log(combatObject)
                        resolve(combatPVP(player, enemy, combatObject, message));
                        return;
                    }

                    console.log("Attaque ! - Enemy");
                    attackPokemon(enemy, player, "enemy", combatObject, reaction, message);


                    console.log("Fin du tour de jeu ! - Enemy");
                    collector.stop();
                    resolve(combatPVP(player, enemy, combatObject, message));

                } else if (!user.bot) {
                    let msgEmbed = new EmbedBuilder();
                    msgEmbed.setTitle("Vous ne pouvez pas réagir aux messages des autres !");
                    msgEmbed.setDescription("<@" + user.id + "> fait plus ça c'est pas bien !");
                    msgEmbed.setColor("#ff0000");
                    msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                    message.channel.send({embeds: [msgEmbed]});
                }
            });
        }
    });
}

function attackPokemon(attacker, defender, playing, combatObject, reaction, message) {
    let attackerPokemon;
    let target;
    if (playing === "player") {
        attackerPokemon = attacker["team"][combatObject["playerPokemonSent"]];
        target = 1;
    }
    else {
        attackerPokemon = attacker["team"][combatObject["enemyPokemonSent"]];
        target = 0;
    }

    let defenderPokemon;
    if (playing === "player") defenderPokemon = defender["team"][combatObject["enemyPokemonSent"]];
    else defenderPokemon = defender["team"][combatObject["playerPokemonSent"]];

    let cc = getCC(attackerPokemon["level"], attackerPokemon["stats"][5]);

    let i = 0;
    while (i < 4) {
        if (reaction.emoji.name === emojis[i]) {
            break;
        }
        i++;
    }

    let attack = getPokemonAttack(attackerPokemon, i);

    let avantageType = getMultiAvantageType(attack["type"], defenderPokemon["types"]);
    let multi = cc * avantageType;

    let puissanceAttaque = attack["puissance"];
    let damage;

    if (attack['category'] === "physique") {
        damage = Math.ceil(((((((attackerPokemon["level"] * 0.4) + 2) * attackerPokemon["stats"][1] * puissanceAttaque) / defenderPokemon["stats"][2]) / 50) + 2) * multi);
    } else if (attack['category'] === "statut") {
        damage = 0;
    } else {
        damage = Math.ceil(((((((attackerPokemon["level"] * 0.4) + 2) * attackerPokemon["stats"][3] * puissanceAttaque) / defenderPokemon["stats"][4]) / 50) + 2) * multi);
    }

    damageCombatPokemon(target, combatObject, damage);
    combatObject["playerTurn"] = !combatObject["playerTurn"];

    let msgEmbed = new EmbedBuilder();
    let descriptionStr = attackerPokemon["name"] + " utilise " + attack.name + ".";
    if (cc > 1) {
        descriptionStr += " Coup Critique !";
        msgEmbed.setColor("#fff300");
    } else msgEmbed.setColor("#ff5600");
    if (avantageType === 0) {
        descriptionStr += ` Cela n'affecte pas ${defenderPokemon.name} ... `;
    } else if (avantageType < 1) {
        descriptionStr += " Ce n'est pas très efficace ... ";
    } else if (avantageType > 1) {
        descriptionStr += " C'est super efficace ! ";
    }

    msgEmbed.setTitle(descriptionStr);
    msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});

    if (playing === "player") {
        msgEmbed.addFields({name:attackerPokemon["name"], value: getStringHPLeft(combatObject["playerTeamHP"][combatObject["playerPokemonSent"]],attackerPokemon["stats"][0]), inline: true});
        msgEmbed.addFields({name:defenderPokemon["name"], value:getStringHPLeft(combatObject["enemyTeamHP"][combatObject["enemyPokemonSent"]], defenderPokemon["stats"][0]), inline: true});
    } else {
        msgEmbed.addFields({name:attackerPokemon["name"], value: getStringHPLeft(combatObject["enemyTeamHP"][combatObject["enemyPokemonSent"]],attackerPokemon["stats"][0]), inline: true});
        msgEmbed.addFields({name:defenderPokemon["name"], value:getStringHPLeft(combatObject["playerTeamHP"][combatObject["playerPokemonSent"]], defenderPokemon["stats"][0]), inline: true});
    }

    message.channel.send({embeds: [msgEmbed]});
}

function getStringHPLeft(currentHP, maxHP) {
    let percent = (currentHP/maxHP)*100;
    let nbSquare = Math.floor(percent / 10);

    let finalStr = "";

    for (let i = 0; i < 10; i++) {
        if (i > nbSquare) finalStr += ":black_large_square: ";
        else if (i > 1 && i <= 4) finalStr += ":orange_square: ";
        else if (i > 4) finalStr += ":green_square: ";
        else finalStr += ":red_square: ";
    }

    finalStr += "\n" + currentHP + " / " + maxHP;

    return finalStr;
}

/**
 * Inflige des dégâts selon la cible du combat PVE
 * @param {Number}target - Si 0 la cilbe est le pokémon allié sinon c'est le pokémon ennemi
 * @param {Object}combatObject - Objet de combat pour garder les informations du combat en cours
 * @param {Number}damage - Dégâts à infliger
 */
function damageCombatPokemon(target, combatObject, damage) {
    if (target === 0) {
        combatObject["playerTeamHP"][combatObject["playerPokemonSent"]] -= damage;
    } else {
        combatObject["enemyTeamHP"][combatObject["enemyPokemonSent"]] -= damage;
    }
}

/**
 * Récupère le multiplicateur d'attaque en fonction du type de l'attaque et du ou des types du défenseur
 * @param {String}typeAtt - Type de l'attaque
 * @param {String[]}typesDefs - Tableau du ou des types du défenseur
 * @returns {number} - Renvoie le multiplicateur
 */
function getMultiAvantageType(typeAtt, typesDefs) {
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

function getPokemonAttack(pokemon, index) {
    return pokemon["capacities"][index];
}

/**
 * Fonction pour déterminer la puissance d'un coup critique et s'il a lieu ou non
 * @param {Number}level - Niveau du pokémon
 * @param {Number}speed - Vitesse du pokémon
 * @param {Number}modif=1 - Modificateur de chance
 * @returns {number} - Modificateur de dégâts du coup critique
 */
function getCC(level, speed, modif = 1) {
    let damageMulti = ((2*level)+5)/(2*level);
    let rand = Math.floor(Math.random() * 256);
    let chance = (Math.floor(speed/2) * modif);
    if (chance >= 255) chance = 254;

    if (chance > rand) return damageMulti;
    else return 1;
}

function changePokemon(player, isPlayer, combatObject, message) {
    return new Promise(async (resolve, reject) => {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Choisissez le pokémon à envoyer au combat");
        msgEmbed.setColor("#285eb2");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});

        let playerTeam = getPlayerTeam(player)
        for (let i = 0; i < playerTeam.length; i++) {

            let pokemon = playerTeam[i];
            let name;
            let value;
            if (pokemon["shiny"]) name = pokemon.name + ":sparkles: (lvl:" + pokemon.level + ")";
            else name = pokemon.name + " (lvl:" + pokemon.level + ")";

            if (isPlayer) {
                if (combatObject["playerTeamHP"][i] > 0) value = combatObject["playerTeamHP"][i] + "/" + pokemon["stats"][0] + " HP";
                else value = "K.O.";
            } else {
                if (combatObject["enemyTeamHP"][i] > 0) value = combatObject["enemyTeamHP"][i] + "/" + pokemon["stats"][0] + " HP";
                else value = "K.O.";
            }

            msgEmbed.addFields({name: name, value: value, inline: true});
        }

        msgEmbed.addFields({name: "Annuler", value: emojis[playerTeam.length]});

        let msgSent = await message.channel.send({embeds: [msgEmbed]});

        for (let i = 0; i < playerTeam.length; i++) {
            await msgSent.react(emojis[i]);
        }

        await  msgSent.react(emojis[playerTeam.length]);

        const filter = (reaction, user) => {
            return emojis.includes(reaction.emoji.name) && !user.bot;
        };

        let collector = msgSent.createReactionCollector(filter, {time: 15000});

        collector.on('collect', (reaction, user) => {
            if (user.id.toString() === player["discordId"]) {
                let i = 0;
                while (i <= player["team"].length) {
                    if (reaction.emoji.name === emojis[i]) {
                        if (i === player["team"].length) {
                            resolve(true);
                            return;
                        } else if (isPlayer) {
                            if (combatObject["playerTeamHP"][i] <= 0) {
                                let msgEmbed = new EmbedBuilder();
                                msgEmbed.setTitle("Vous ne pouvez pas envoyer un pokémon K.O. au combat !");
                                msgEmbed.setColor("#ff0000");
                                msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                                message.channel.send({embeds: [msgEmbed]});
                                collector.stop();
                                resolve(changePokemon(player, isPlayer, combatObject, message));
                                return;
                            } else if (combatObject["playerPokemonSent"] === i) {
                                let msgEmbed = new EmbedBuilder();
                                msgEmbed.setTitle("Ce pokémon est déjà en combat !");
                                msgEmbed.setColor("#ff0000");
                                msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                                message.channel.send({embeds: [msgEmbed]});
                                collector.stop();
                                resolve(changePokemon(player, isPlayer, combatObject, message));
                                return;
                            } else {
                                combatObject["playerPokemonSent"] = i;
                                resolve(true);
                                return;
                            }
                        } else {
                            if (combatObject["enemyTeamHP"][i] <= 0) {
                                let msgEmbed = new EmbedBuilder();
                                msgEmbed.setTitle("Vous ne pouvez pas envoyer un pokémon K.O. au combat !");
                                msgEmbed.setColor("#ff0000");
                                msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                                message.channel.send({embeds: [msgEmbed]});
                                collector.stop();
                                resolve(changePokemon(player, isPlayer, combatObject, message));
                                return;
                            } else if (combatObject["enemyPokemonSent"] === i) {
                                let msgEmbed = new EmbedBuilder();
                                msgEmbed.setTitle("Ce pokémon est déjà en combat !");
                                msgEmbed.setColor("#ff0000");
                                msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

                                message.channel.send({embeds: [msgEmbed]});
                                collector.stop();
                                resolve(changePokemon(player, isPlayer, combatObject, message));
                                return;
                            } else {
                                combatObject["enemyPokemonSent"] = i;
                                resolve(true);
                                return;
                            }
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

function checkDefeat(player, combatObject) {
    if (player === "player") {
        let sum = 0;
        for(let i = 0; i < combatObject["playerTeamHP"].length; i++) {
            if (combatObject["playerTeamHP"][i] <= 0) combatObject["playerTeamHP"][i] = 0;
            sum += combatObject["playerTeamHP"][i];
        }
        return sum === 0;
    } else if (player === "enemy") {
        let sum = 0;
        for(let i = 0; i < combatObject["enemyTeamHP"].length; i++) {
            if (combatObject["enemyTeamHP"][i] <= 0) combatObject["enemyTeamHP"][i] = 0;
            sum += combatObject["enemyTeamHP"][i];
        }
        return sum === 0;
    } else return -1;
}

module.exports = {
    defi
}