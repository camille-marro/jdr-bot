const {EmbedBuilder} = require('discord.js');

let { getPlayerWithId, getPlayerPokemonsWithName, updateData, parsePokemon, drawPokemon, addExp } = require("./assets");
const { emojis } = require("./utils");

/**
 * Fonction principale pour la commande de combat en PVE
 * @param message
 */
function trainPVE(message) {
    let args = message.content.split(" ");
    let player = getPlayerWithId(message.author.id);

    if (!player) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Vous n'avez pas de compte !");
        msgEmbed.setDescription("Pour vous inscrire utilisez la commande *pokemon start* !");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande pokemon help."});

        message.channel.send({embeds: [msgEmbed]});
        return;
    }

    if (!args[2]) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Veuillez saisir une difficulté !");
        msgEmbed.setDescription("Les difficultés sont : facile/esay, medium, hard/difficile");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande *pokemon help*."});

        message.channel.send({embeds: [msgEmbed]});
        return;
    }

    if (!args[3]) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Veuillez saisir un nom de pokémon à envoyer au combat !");
        msgEmbed.setDescription("La commande s'utilise comme ceci : pokemon trainPVE difficulté nom_du_pokemon.");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande *pokemon help*."});

        message.channel.send({embeds: [msgEmbed]});
        return;
    }

    let difficulty;
    if (args[2] === "facile" || args[2] === "easy") difficulty = 1;
    else if (args[2] === "medium") difficulty = 2;
    else difficulty = 3;

    let pokemons = getPlayerPokemonsWithName(player, args[3]);
    if (!pokemons) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Vous n'avez aucun pokémon de ce nom !");
        msgEmbed.setDescription("Vérifier qu'il n'y aucune faute de syntaxe ou que vous possédez bien ce pokémon.");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande *pokemon help*."});

        message.channel.send({embeds: [msgEmbed]});
    } else if (pokemons.length > 1) {
        choosePokemonPVE(pokemons, message).then(pokemon => {
            pveDrawEnemyPokemon(pokemon, difficulty).then( enemyPokemon => {
                startCombatPVE(pokemon, enemyPokemon, difficulty, message).then(r => {});
            });
        });
    } else {
        pveDrawEnemyPokemon(pokemons[0], difficulty).then( enemyPokemon => {
            startCombatPVE(pokemons[0], enemyPokemon, difficulty, message).then(r => {});
        })
    }
}

/**
 * Fonction pour choisir le pokémon à envoyer au combat quand plusieurs sont trouvés
 * @param {Object[]}pokemons - Liste des pokémons à sélectionner
 * @param message
 * @returns {Promise<unknown>}
 */
function choosePokemonPVE(pokemons, message) {
    return new Promise(async (resolve, reject) => {
        let msgEmbed = createEmbedInfoPokemons(pokemons);
        let msgSent = await message.channel.send({embeds: [msgEmbed]});

        for (let i = 0; i < pokemons.length; i++) {
            await msgSent.react(emojis[i]);
        }

        const filter = (reaction, user) => {
            return emojis.includes(reaction.emoji.name) && !user.bot;
        };

        let collector = msgSent.createReactionCollector(filter, {time: 15000});

        collector.on('collect', (reaction, user) => {
            if (user.id === message.author.id) {
                let i = 0;
                while (i < pokemons.length) {
                    if (reaction.emoji.name === emojis[i]) {
                        collector.stop();
                        resolve(pokemons[i]);
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
                collector.stop();
            }
        });
    })
}

async function pveDrawEnemyPokemon(pokemon, difficulty) {
    return new Promise(async (resolve, reject) => {
        let enemyPokemon = parsePokemon(drawPokemon());
        let level = 0;
        let xpToAdd = 0;
        if (difficulty === 1) {
            let rand = Math.floor(Math.random() * 3);
            level = (rand - 3) + pokemon['level'];
            if (level <= 0) level = 1;
            if (level > 100) level = 100;
            for (let i = 0; i < level; i++) xpToAdd += Math.pow(i, 2);
        } else if (difficulty === 2) {
            let rand = Math.floor(Math.random() * 6);
            level = (rand - 2) + pokemon['level'];
            if (level <= 0) level = 1;
            if (level > 100) level = 100;
            for (let i = 0; i < level; i++) xpToAdd += Math.pow(i, 2);
        } else {
            let rand = Math.floor(Math.random() * 10);
            level = rand + pokemon['level'];
            if (level <= 0) level = 1;
            if (level > 100) level = 100;
            for (let i = 0; i < level; i++) xpToAdd += Math.pow(i, 2);
        }

        await addExp(enemyPokemon, xpToAdd);
        resolve(enemyPokemon);
    });
}

/**
 * Début de la fonction récursive pour le combat en PVE
 * @param myPokemon - Pokémon allié a envoyé au combat
 * @param enemyPokemon - Pokémon ennemi à combattre
 * @param {number}difficulty - Difficulté du combat
 * @param message
 * @returns {Promise<void>}
 */
async function startCombatPVE(myPokemon, enemyPokemon, difficulty, message) {
    if (myPokemon["currentHP"] <= 0) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Votre : " + myPokemon["name"] + " est K.O. !");
        msgEmbed.setDescription("Vous ne pouvez pas combattre avec un pokémon déjà K.O.");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});
        msgEmbed.setColor("#ff0000");

        message.channel.send({embeds: [msgEmbed]});
        return;
    }

    let combatObject = {
        "myPokemonHP": myPokemon["currentHP"],
        "enemyPokemonHP": enemyPokemon["stats"][0],
        "myTurn": true,
        "fuite": false,
        "fuiteCpt": 0
    }

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setTitle("Vous entrez dans un combat contre : " + enemyPokemon["name"] + " !");
    msgEmbed.setDescription("Le " + enemyPokemon["name"] + " est de niveau " + enemyPokemon["level"] + " et possède " + enemyPokemon["stats"][0] + " PV.\nBonne chance pour votre combat :)");
    msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});
    msgEmbed.setColor("#ff5600");

    message.channel.send({embeds: [msgEmbed]});

    combatPVE(myPokemon, enemyPokemon, combatObject, message).then(async (res, rej) => {
        let msgEmbed = new EmbedBuilder();
        if (res) {
            let xpWon = Math.ceil(enemyPokemon.level * 2 * 1.5 * difficulty);
            await addExp(myPokemon, xpWon, message).then(lvlUp => {
                msgEmbed.setTitle("Victoire !");
                msgEmbed.setDescription("Bravo vous avez gagné votre combat contre " + enemyPokemon.name + " (lvl:" + enemyPokemon.level + ") !");
                msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});
                msgEmbed.setColor("#08ff00");
                msgEmbed.addFields({name: "Expérience gagnée", value: xpWon.toString(), inline: true});
                if (lvlUp > 0) msgEmbed.addFields({name: "Niveau(x) gagné(s)", value: lvlUp.toString(), inline: true});
            });
        } else {
            msgEmbed.setTitle("Défaite !");
            msgEmbed.setDescription("Pas de chance vous avez perdu votre combat contre " + enemyPokemon.name + " (lvl:" + enemyPokemon.level + ") !");
            msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});
            msgEmbed.setColor("#ce1369");
        }
        if (combatObject["myPokemonHP"] < 0) combatObject["myPokemonHP"] = 0;
        myPokemon["currentHP"] = combatObject["myPokemonHP"];

        message.channel.send({embeds: [msgEmbed]});

        updateData();
    });
}

/**
 * Fonction récursive pour le combat en PVE
 * @param {Object}myPokemon - Pokémon allié à envoyer au combat
 * @param {Object}enemyPokemon - Pokémon ennemi à affronter
 * @param {Object}combatObject - Objet de combat pour garder les informations du combat en cours
 * @param message
 * @returns {Promise<unknown>}
 */
async function combatPVE(myPokemon, enemyPokemon, combatObject, message) {
    return new Promise(async (resolve, reject) => {
        if (combatObject["myPokemonHP"] <= 0) {
            resolve(false);
            return;
        } else if (combatObject["enemyPokemonHP"] <= 0) {
            resolve(true);
            return;
        } else if (combatObject["fuite"]) {
            resolve(false);
            return;
        }

        if (!combatObject["myTurn"]) {
            let cc = getCC(enemyPokemon["level"], enemyPokemon["stats"][5]);
            let attack = chooseRandomAttack(enemyPokemon);
            let avantageType = getMultiAvantageType(attack["type"], myPokemon["types"]);

            let multi = cc * avantageType;

            let puissanceAttaque = attack["puissance"];
            let enemyDamage;

            if (attack["category"] === "physique") {
                enemyDamage = Math.ceil(((((((enemyPokemon["level"] * 0.4) + 2) * enemyPokemon["stats"][1] * puissanceAttaque) / myPokemon["stats"][2]) / 50) + 2) * multi);
            } else if (attack["category"] === "statut") {
                enemyDamage = 0;
            } else {
                enemyDamage = Math.ceil(((((((enemyPokemon["level"] * 0.4) + 2) * enemyPokemon["stats"][3] * puissanceAttaque) / myPokemon["stats"][4]) / 50) + 2) * multi);
            }

            damageCombatPokemon(0, combatObject, enemyDamage);

            let msgEmbed = new EmbedBuilder();
            let descriptionStr = "";
            if (cc > 1) {
                descriptionStr += "Coup Critique ! ";
                msgEmbed.setColor("#fff300");
            } else msgEmbed.setColor("#b62626");
            if (avantageType === 0) {
                descriptionStr += `${attack.name} n'affecte pas ${myPokemon.name} ... `;
            } else if (avantageType < 1) {
                descriptionStr += `${attack.name} n'est pas très efficace ... `;
            } else if (avantageType > 1) {
                descriptionStr += `${attack.name} est super efficace ! `;
            }
            descriptionStr += "La puissance de " + attack.name + " était de " + puissanceAttaque;

            msgEmbed.setTitle(enemyPokemon["name"] + " vous a attaqué et vous avez perdu " + enemyDamage + " pv !");
            msgEmbed.setDescription(descriptionStr);
            msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});
            msgEmbed.addFields({name:myPokemon["name"], value:combatObject["myPokemonHP"] + "/" + myPokemon["stats"][0] + " PV", inline: true});
            msgEmbed.addFields({name:enemyPokemon["name"], value:combatObject["enemyPokemonHP"] + "/" + enemyPokemon["stats"][0] + " PV", inline: true});
            message.channel.send({embeds: [msgEmbed]});

            combatObject["myTurn"] = true;
            resolve(combatPVE(myPokemon, enemyPokemon, combatObject, message));
            return;
        }

        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Choisissez votre attaque !");
        msgEmbed.setColor("#0823a8");
        msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});

        for (let i = 0; i < myPokemon["capacities"].length; i++) {
            msgEmbed.addFields({name:myPokemon["capacities"][i]["name"] + " (" + myPokemon["capacities"][i]["type"] + ")", value:emojis[i], inline: true});
            if ((i%2) === 1) msgEmbed.addFields({name:" ", value:" "});
        }

        msgEmbed.addFields({name:"Fuite", value:emojis[myPokemon["capacities"].length]});

        let msgSent = await message.channel.send({embeds: [msgEmbed]});

        for (let i = 0; i < 5; i++) await msgSent.react(emojis[i]);

        const filter = (reaction, user) => {
            return emojis.includes(reaction.emoji.name) && !user.bot;
        };

        const collector = msgSent.createReactionCollector(filter, {time: 15000});

        collector.on("collect", (reaction, user) => {
            if (user.id === message.author.id) {
                if (reaction.emoji.name === emojis[myPokemon["capacities"].length]) {
                    combatObject["fuiteCpt"]++;
                    combatObject["myTurn"] = false;

                    let msgEmbed = new EmbedBuilder();
                    let fuite = canEscape(myPokemon, enemyPokemon, combatObject["fuiteCpt"]);
                    if (fuite) {
                        msgEmbed.setColor("#11985c");
                        msgEmbed.setTitle("Vous prenez la fuite !");
                        combatObject["fuite"] = true;
                    } else {
                        msgEmbed.setColor("#00ce5e");
                        msgEmbed.setTitle("Fuite impossible !");
                    }

                    message.channel.send({embeds: [msgEmbed]});
                    collector.stop();
                    return;
                }
                let cc = getCC(myPokemon["level"], myPokemon["stats"][5])

                let i = 0;
                while (i < 4) {
                    if (reaction.emoji.name === emojis[i]) {
                        break;
                    }
                    i++;
                }

                let attack = getPokemonAttack(myPokemon, i);

                let avantageType = getMultiAvantageType(attack["type"], enemyPokemon["types"]);
                let multi = cc * avantageType;

                let puissanceAttaque = attack["puissance"];
                let myDamage;
                if (attack['category'] === "physique") {
                    myDamage = Math.ceil(((((((myPokemon["level"] * 0.4) + 2) * myPokemon["stats"][1] * puissanceAttaque) / enemyPokemon["stats"][2]) / 50) + 2) * multi);
                } else if (attack['category'] === "statut") {
                    myDamage = 0;
                } else {
                    myDamage = Math.ceil(((((((myPokemon["level"] * 0.4) + 2) * myPokemon["stats"][3] * puissanceAttaque) / enemyPokemon["stats"][4]) / 50) + 2) * multi);
                }

                damageCombatPokemon(1, combatObject, myDamage);
                combatObject["myTurn"] = false;

                let msgEmbed = new EmbedBuilder();
                let descriptionStr = "";
                if (cc > 1) {
                    descriptionStr += "Coup Critique ! ";
                    msgEmbed.setColor("#fff300");
                } else msgEmbed.setColor("#ff5600");
                if (avantageType === 0) {
                    descriptionStr += `${attack.name} n'affecte pas ${enemyPokemon.name} ... `;
                } else if (avantageType < 1) {
                    descriptionStr += `${attack.name} n'est pas très efficace ... `;
                } else if (avantageType > 1) {
                    descriptionStr += `${attack.name} est super efficace ! `;
                }
                descriptionStr += "La puissance de " + attack.name + " était de " + puissanceAttaque;

                msgEmbed.setTitle("Votre " + myPokemon["name"].toLowerCase() + " a attaqué et vous avez infligé " + myDamage + " points de dégâts !");
                msgEmbed.setDescription(descriptionStr);
                msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"pokemon help\"."});
                msgEmbed.addFields({name:myPokemon["name"], value:combatObject["myPokemonHP"] + "/" + myPokemon["stats"][0] + " PV", inline: true});
                msgEmbed.addFields({name:enemyPokemon["name"], value:combatObject["enemyPokemonHP"] + "/" + enemyPokemon["stats"][0] + " PV", inline: true});

                message.channel.send({embeds: [msgEmbed]});

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

        collector.on("end", collected => {
            resolve(combatPVE(myPokemon, enemyPokemon, combatObject, message));
            return;
        });

    });
}

/**
 * Inflige des dégâts selon la cible du combat PVE
 * @param {Number}target - Si 0 la cilbe est le pokémon allié sinon c'est le pokémon ennemi
 * @param {Object}combatObject - Objet de combat pour garder les informations du combat en cours
 * @param {Number}damage - Dégâts à infliger
 */
function damageCombatPokemon(target, combatObject, damage) {
    if (target === 0) {
        combatObject["myPokemonHP"] -= damage;
    } else {
        combatObject["enemyPokemonHP"] -= damage;
    }
}

/**
 * Détermine si un pokémon peut s'enfuir d'un combat
 * @param {Object}myPokemon - Pokémon qui doit s'enfuir
 * @param {Object}enemyPokemon - Pokémon ennemi
 * @param {Number}multi=1 - Multiplicateur de chance d'évasion
 * @returns {boolean} - Renvoie vrai si le pokémon peut s'enfuir renvoie faux sinon
 */
function canEscape(myPokemon, enemyPokemon, multi= 1) {
    let A = myPokemon["stats"][5]*32
    let B = Math.floor(enemyPokemon["stats"][5]/4)%255;
    let chance = (Math.floor(A/B)+30)*multi;

    if (chance > 255) return true;

    let rand = Math.floor(Math.random() * 256);

    return rand <= chance;
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

function chooseRandomAttack(pokemon) {
    return pokemon["capacities"][Math.floor(Math.random() * pokemon["capacities"].length)];
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

/**
 * Créé un message embed pour afficher les informations des pokémons
 * @param {Object[]}pokemons -
 * @returns {EmbedBuilder|boolean} - Renvoie faux s'il y a trop de pokémons
 */
function createEmbedInfoPokemons(pokemons) {
    if (pokemons.length > 15) return false;

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setTitle("Choisissez le pokémon dont il faut afficher les informations");
    msgEmbed.setDescription("Pour choisir le pokémon il suffit de réagir à l'émote attribuée au pokémon voulu");
    msgEmbed.setColor("#c0763b");
    msgEmbed.setFooter({text:"Pour plus d'informations utilisez la commande *pokemon help*."});
    let i = 0;
    pokemons.forEach(pokemon => {
        let pokemonName = pokemon.name;
        if (pokemon.shiny) pokemonName += ":sparkles:";
        pokemonName += "(lvl: " + pokemon.level + ")";
        msgEmbed.addFields({name: pokemonName, value: emojis[i], inline: true});
        i++;
    });

    return msgEmbed;
}

module.exports = {
    pveMain: trainPVE
}