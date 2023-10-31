let fs = require('fs');
const path = require("path");

const log = require('../../assets/log');

const { EmbedBuilder } = require('discord.js');
const {play} = require("./music/play");

let gameData;
const colors = new Map();
colors.set("S", "#fff300");
colors.set("A", "#7b02c7");
colors.set("B", "#0230c7");
colors.set("C", "#ffffff");

const maxHealth = 20;

try {
    console.log("|-- Loading jdr data from jdr.json ...");
    const rawData = fs.readFileSync(path.resolve(__dirname, "../../json_files/game.json"));
    gameData = JSON.parse(rawData);
} catch (err) {
    console.log("|-- no file named meme.json found");
    gameData = false;
}

function updateData() {
    fs.writeFileSync(path.resolve(__dirname, "../../json_files/game.json"), JSON.stringify(gameData));
    console.log("|-- data successfully updated");
    log.print("jdrData has been successfully updated", 1);
}
function lootCrate(message) {
    log.print("tried to loot a crate", message.author, message.content);
    let msgEmbed = new EmbedBuilder();

    let joueur = getPlayer(message);
    if(!joueur) return;

    if (((new Date().getTime() - joueur["last_loot"]) / (1000 * 60 * 60)) < 3) {
        msgEmbed.setColor("#ff0000");
        msgEmbed.setTitle("Trop tôt !");
        msgEmbed.setDescription("Vous ne pouvez looter une caisse qu'une fois toute les 3 heures.");
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game help\""});

        message.channel.send({embeds: [msgEmbed]});
        log.print("sending message error : less than 3 hours since last loot", 1);
        return;
    }

    let randInt = Math.floor(Math.random() * 99 + 1);

    if (randInt <= 2) {
        // caisse antimatériel
        log.print("crate with id=c14d280f-121c-4252-bb84-2a6696143c20 found", 1);
        addCrate("c14d280f-121c-4252-bb84-2a6696143c20", joueur);
        msgEmbed.setColor(colors.get("S"));
        msgEmbed.setTitle("Caisse d'arme anti-matériel trouvée !");
        msgEmbed.setDescription("Félicitation vous avez trouvé une caisse d'arme de tier S, espèce de gros con.")
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game help\""});

        message.channel.send({embeds: [msgEmbed]});
        log.print("sending success message", 1);
    }
    else if (randInt > 2 && randInt <= 7) {
        // caisse arme lourde
        log.print("crate with id=a592d1ed-3e66-4585-a68e-697f3c24904e found", 1);
        addCrate("a592d1ed-3e66-4585-a68e-697f3c24904e", joueur);
        msgEmbed.setColor(colors.get("A"));
        msgEmbed.setTitle("Caisse d'arme lourde trouvée !");
        msgEmbed.setDescription("Félicitation vous avez trouvé une caisse d'arme de tier A, bravo tu te crois malin c'est ça ?")
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game help\""});

        message.channel.send({embeds: [msgEmbed]});
        log.print("sending success message", 1);
    }
    else if (randInt > 7 && randInt <= 12) {
        // caisse de protection
        log.print("crate with id=26b8d782-15c4-41f3-a886-eaeed371d714 found", 1);
        addCrate("26b8d782-15c4-41f3-a886-eaeed371d714", joueur);
        msgEmbed.setColor(colors.get("A"));
        msgEmbed.setTitle("Caisse de protection trouvée !");
        msgEmbed.setDescription("Félicitation vous avez trouvé une caisse d'arme de tier A, bravo tu te crois malin c'est ça ?")
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game help\""});

        message.channel.send({embeds: [msgEmbed]});
        log.print("sending success message", 1);
    }
    else if (randInt > 12 && randInt <= 27) {
        // caisse d'explosif
        log.print("crate with id=a74b16f4-3095-4e5d-8093-555c3e13fa5f found", 1);
        addCrate("a74b16f4-3095-4e5d-8093-555c3e13fa5f", joueur);
        msgEmbed.setColor(colors.get("B"));
        msgEmbed.setTitle("Caisse d'explosif trouvée !");
        msgEmbed.setDescription("Félicitation vous avez trouvé une caisse d'arme de tier B, c'est plutôt cool.")
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game help\""});

        message.channel.send({embeds: [msgEmbed]});
        log.print("sending success message", 1);
    }
    else if (randInt > 27 && randInt <= 41) {
        // caisse de soin
        log.print("crate with id=aa298444-c2b5-4d47-af0f-5a06ea0354f0 found", 1);
        addCrate("aa298444-c2b5-4d47-af0f-5a06ea0354f0", joueur);
        msgEmbed.setColor(colors.get("B"));
        msgEmbed.setTitle("Caisse de soin trouvée !");
        msgEmbed.setDescription("Félicitation vous avez trouvé une caisse d'arme de tier B, c'est plutôt cool.")
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game help\""});

        message.channel.send({embeds: [msgEmbed]});
        log.print("sending success message", 1);
    }
    else if (randInt > 41 && randInt <= 70) {
        // caisse d'arme
        log.print("crate with id=1ad565c1-6e56-4a28-8de6-ff6ce228444c found", 1);
        addCrate("1ad565c1-6e56-4a28-8de6-ff6ce228444c", joueur);
        msgEmbed.setColor(colors.get("C"));
        msgEmbed.setTitle("Caisse d'arme trouvée !");
        msgEmbed.setDescription("Félicitation vous avez trouvé une caisse d'arme de tier C, comme tout le monde au final.")
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game help\""});

        message.channel.send({embeds: [msgEmbed]});
        log.print("sending success message", 1);
    }
    else {
        // caisse de munition
        log.print("crate with id=935846e7-ca48-49a3-9a6d-14b273a2139b found", 1);
        addCrate("935846e7-ca48-49a3-9a6d-14b273a2139b", joueur);
        msgEmbed.setColor(colors.get("C"));
        msgEmbed.setTitle("Caisse de munition trouvée !");
        msgEmbed.setDescription("Félicitation vous avez trouvé une caisse d'arme de tier C, comme tout le monde au final.");
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game help\""});

        message.channel.send({embeds: [msgEmbed]});
        log.print("sending success message", 1);
    }
}
function addCrate(crateId, joueur) {
    let crates = gameData["objets"]["crates"];
    let i = 0;
    let crateToAdd;
    while (i < crates.length) {
        if (crates[i]["id"] === crateId) {
            crateToAdd = crates[i];
            break;
        }
        i++;
    }
    i = 0;
    while (i < joueur["inv"].length) {
        if (joueur["inv"][i]["id"] === crateToAdd["id"]) {
            joueur["inv"][i]["count"]++;
            joueur["last_loot"] = Date.now();
            log.print("crate found in inventory, updating number of crate for the user", 1);
            updateData();
            return;
        }
        i++;
    }

    crateToAdd["count"] = 1;
    joueur["inv"].push(crateToAdd);
    joueur["last_loot"] = Date.now();
    log.print("creating a new item in player inventory for the new crate", 1);
    updateData();
}
function printInventory(message) {
    log.print("tried to print his inventory", message.author, message.content);
    let joueur = getPlayer(message);
    if(!joueur) return;

    let str = "";
    joueur["inv"].forEach((item) => {
        str += "TIER " + item["tier"] + " - " + item["name"];
        if (item.hasOwnProperty("count")) str += " (x" + item["count"] + ")";
        str += "\n";
    });

    message.channel.send(str);
    log.print("inventory successfully printed", 1);
}
function getPlayer(message) {
    let joueur;
    if (gameData["joueurs"].hasOwnProperty(message.author.id)) joueur = gameData["joueurs"][message.author.id];
    else {
        msgEmbed.setColor("#ff0000");
        msgEmbed.setTitle("Aucun personnage trouvé pour vous ! ");
        msgEmbed.setDescription("Aucun personnage n'est associé à votre id.");
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game help\""});

        message.channel.send({embeds: [msgEmbed]});
        log.print("sending message error : no character linked to this person", 1);
        return false;
    }
    return joueur;
}

function getPlayerFromId(playerId) {
    if (gameData["joueurs"].hasOwnProperty(playerId)) return gameData["joueurs"][playerId];
    else return false;
}
function openCrate(message) {
    log.print("tried to open a crate", message.author, message.content);
    let player = getPlayer(message);
    if (!player) return;

    let crateToOpenName = "";
    let args = message.content.split(" ");
    for (let i = 2; i < args.length; i++) crateToOpenName += args[i] + " ";
    crateToOpenName = crateToOpenName.slice(0, -1);

    let crateToOpen = searchCrate(crateToOpenName);
    if (!crateToOpen) {
        console.log("nom incorrect");
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Erreur : ce nom de caisse n'existe pas !");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setDescription("Le nom que vous avez utiliser n'est associé à aucune caisse.");
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game help\""});

        message.channel.send({embeds: [msgEmbed]});
        log.print("error message successfully sent", 1);
        return;
    }

    removeCrate(crateToOpen["id"], player);

    let loot = getItemFromCrate(crateToOpen["id"]);
    addItem(loot[0], loot[1], player);
    message.channel.send({embeds: [loot[2]]});
    log.print("success message sent", 1);
}
function removeCrate(crateId, player) {
    log.print("removing crate from player inventory", 1);
    let i = 0;
    while (i < player["inv"].length) {
        if (player["inv"][i]["id"] === crateId) {
            player["inv"][i]["count"]--;
            if (player["inv"][i]["count"] <= 0) {
                player["inv"].splice(i, 1);
                log.print("crate successfully remove from inventory", 1);
            } else log.print("player had more than 1 crate, crate count successfully actualised", 1);
            updateData();
            return true;
        }
        i++;
    }
    return false;
}
function addItem(item, cat, joueur) {
    log.print("adding the item to the player inventory", 1);
    let i = 0;
    while (i < joueur["inv"].length) {
        if (joueur["inv"][i]["id"] === item["id"]) {
            joueur["inv"][i]["count"]++;
            log.print("item found in inventory, updating number of item for the user", 1);
            updateData();
            return;
        }
        i++;
    }

    item["count"] = 1;
    joueur["inv"].push(item);
    log.print("creating a new item in player inventory for the new item", 1);
    updateData();
}
function getItemFromCrate(crateId) {
    log.print("Looting the crate to get a new item", 1);
    let randInt = Math.floor(Math.random() * 99 + 1);
    let itemId;
    let cat;

    switch (crateId) {
        case "1ad565c1-6e56-4a28-8de6-ff6ce228444c" : // caisse d'arme
            cat = "armes";
            if (randInt === 1) {
                itemId = "0a682b69-9234-4064-b487-d6be870c2f84";
                break;
            } else if (randInt === 2) {
                itemId = "f03af414-d4a2-484f-9170-9989d410101a";
                break;
            } else if (randInt > 2 && randInt <= 7) {
                itemId = "c5c0ba54-4f3a-4c63-ab29-5d6c917154d8";
                break;
            } else if (randInt > 7 && randInt <= 12) {
                itemId = "410b884e-7906-4fda-8e54-d27932c13b3d";
                break;
            } else if (randInt > 12 && randInt <= 18) {
                itemId = "1c3e7c6a-b77a-4772-b573-70dddbdcfe5c";
                break;
            } else if (randInt > 18 && randInt <= 24) {
                itemId = "65503d4d-12e3-4dd3-ace6-fc4f040bd35d";
                break;
            } else if (randInt > 24 && randInt <= 30) {
                itemId = "db0c7226-b54d-46f6-910a-cd13f6638939";
                break;
            } else if (randInt > 30 && randInt <= 36) {
                itemId = "eb74e2fb-1b62-40c4-bd5d-08dc13304d0e";
                break;
            } else if (randInt > 36 && randInt <= 42) {
                itemId = "674bec62-1a50-409f-9196-1607496371e6";
                break;
            } else if (randInt > 42 && randInt <= 53) {
                itemId = "b3f63afb-6f60-4abb-80be-1b54649250ca";
                break;
            } else if (randInt > 53 && randInt <= 65) {
                itemId = "965b3713-0480-4adf-8e55-1e68d5890a96";
                break;
            } else if (randInt > 65 && randInt <= 77) {
                itemId = "63a9bf96-aa6f-4e88-8bd1-a67464edd14b";
                break;
            } else if (randInt > 77 && randInt <= 88) {
                itemId = "fe5329fb-786d-4a44-a607-059544ea6ff6";
                break;
            } else {
                itemId = "91181b12-f8fa-4cea-a311-d7610e049380";
                break;
            }

        case "935846e7-ca48-49a3-9a6d-14b273a2139b": // caisse munition
            cat = "munitions";
            if (randInt <= 2) {
                itemId = "3c4a07e6-c095-4324-9bba-1d8a1de53e6a";
                break;
            } else if (randInt > 2 && randInt <= 4) {
                itemId = "3bcc71f5-daee-4bb2-9ade-cbc37cce68f7";
                break;
            } else if (randInt > 4 && randInt <= 7) {
                itemId = "c369dfd0-37c6-4da2-981d-4972ef126d36";
                break;
            } else if (randInt > 7 && randInt <= 9) {
                itemId = "5ca3b4fb-3c7d-491a-b2e2-6b4d1c7ab918";
                break;
            } else if (randInt > 9 && randInt <= 12) {
                itemId = "98df46f7-5a8a-4760-a74b-7c49eec9b04b";
                break;
            } else if (randInt > 12 && randInt <= 22) {
                itemId = "95401368-5219-426c-8977-bd469d8426bb";
                break;
            } else if (randInt > 22 && randInt <= 32) {
                itemId = "9a88c3bd-87e5-41f0-85f6-e9930411efc2";
                break;
            } else if (randInt > 32 && randInt <= 42) {
                itemId = "27fdecb5-3a3e-46af-9cb9-cd4aab0d1271";
                break;
            } else if (randInt > 42 && randInt <= 52) {
                itemId = "b25d2396-8d09-45d7-be93-b0a3fcc60c29";
                break;
            } else if (randInt > 52 && randInt <= 61) {
                itemId = "ca10ce42-811d-47fe-bf2b-77b6253ae644";
                break;
            } else if (randInt > 61 && randInt <= 70) {
                itemId = "49372c93-8d1b-4141-a2da-89f201a8ee78";
                break;
            } else if (randInt > 70 && randInt <= 80) {
                itemId = "e02ee42e-8475-409e-8a80-0c051131e4bb";
                break;
            } else if (randInt > 80 && randInt <= 90) {
                itemId = "259fb976-376a-4008-b9c6-e8199a9dee78";
                break;
            } else {
                itemId = "ec3ba175-75d7-4961-8767-a9afe284ce3e";
                break;
            }

        case "aa298444-c2b5-4d47-af0f-5a06ea0354f0" : // caisse de soin
            cat = "medicine";
            if (randInt <= 2) {
                itemId = "69fdba79-7814-4e10-ab04-7d9031f3c47e";
                break;
            } else if (randInt > 2 && randInt <= 12) {
                itemId = "974fdc99-bf5f-4aea-858c-cc14765788df";
                break;
            } else if (randInt > 12 && randInt <= 27) {
                itemId = "24ff4b27-5337-41d7-b50e-e79f24fab10d";
                break;
            } else if (randInt > 27 && randInt <= 42) {
                itemId = "acb5d750-3c8e-4e24-aec9-acb989a63b5e";
                break;
            } else if (randInt > 42 && randInt <= 71) {
                itemId = "095b4994-a49f-44b0-8a7a-962244a072bc";
                break;
            } else {
                itemId = "e0e07dde-97d2-4ca4-9875-6642b7384c7e";
                break;
            }

        case "a74b16f4-3095-4e5d-8093-555c3e13fa5f" : // caisse d'explosif
            cat = "armes";
            if (randInt <= 2) {
                itemId = "4160668f-2b86-41e1-822f-ae5af585db67";
                break;
            } else if (randInt > 2 && randInt <= 7) {
                itemId = "c3bd7600-bdce-4076-a5e3-fdcbaf94af78";
                break;
            } else if (randInt > 7 && randInt <= 12) {
                itemId = "22024005-8768-4754-8dec-47d44266e91a";
                break;
            } else if (randInt > 12 && randInt <= 27) {
                itemId = "5c5b617c-22a3-490d-a3f1-254d704ccd9c";
                break;
            } else if (randInt > 27 && randInt <= 41) {
                itemId = "058361e2-d1ba-46fa-a231-a28411c5d2de";
                break;
            } else {
                itemId = "b28c357b-4c11-4cef-95e1-5b4a73c4343e";
                break;
            }

        case "26b8d782-15c4-41f3-a886-eaeed371d714" : // caisse arme lourde
            cat = "protection";
            if (randInt <= 2) {
                itemId = "c6ac9e8c-1822-42b5-870d-50e366650bce";
                break;
            } else if (randInt > 2 && randInt <= 11) {
                itemId = "a5832d33-68f5-4b83-8ebd-9903484d2d15";
                break;
            } else if (randInt > 11 && randInt <= 41) {
                itemId = "85b58af1-d1e2-4657-baef-39664e3b9052";
                break;
            } else {
                itemId = "816934d8-c5a3-40f4-a7ba-d73e24422470";
                break;
            }

        case "a592d1ed-3e66-4585-a68e-697f3c24904e" : // caisse arme lourde
            cat = "armes";
            if (randInt <= 9) {
                itemId = "8221a349-60de-41b0-a7ba-41ab386eaf65";
                break;
            } else if (randInt > 9 && randInt <= 24) {
                itemId = "3bc72433-fe0f-47b3-9a17-f714555f879c";
                break;
            } else if (randInt > 24 && randInt <= 41) {
                itemId = "99a7cfe4-e8fd-42af-b60d-c12754665e2f";
                break;
            } else {
                itemId = "b20e3725-2f6c-4995-bc57-761fb9064283";
                break;
            }

        case "c14d280f-121c-4252-bb84-2a6696143c20": // caisse d'arme anti-matériel
            cat = "armes";
            if (randInt <= 15) {
                itemId = "b8657581-9f05-47c2-a955-710ca157557c";
                break;
            } else if (randInt > 15 && randInt <= 30) {
                itemId = "f4bba4de-5b09-4fc7-9eb1-3c07ca23e562";
                break;
            } else {
                itemId = "9ce3092c-f2d7-41ec-b9b5-12c2758b2325";
                break;
            }
    }

    let i = 0;
    let items = gameData["objets"][cat];
    while (i < items.length) {
        if (items[i]["id"] === itemId) {
            //message de l'item loot ?
            let msgEmbed = new EmbedBuilder();
            let debutDesc = "";
            let finDesc = "";
            switch (items[i]["tier"]) {
                case "S":
                    msgEmbed.setColor(colors.get("S"));
                    finDesc = " S, espèce de gros con.";
                    break;
                case "A":
                    msgEmbed.setColor(colors.get("A"));
                    finDesc = " A, bravo tu te crois malin c'est ça ?";
                    break;
                case "B":
                    msgEmbed.setColor(colors.get("B"));
                    finDesc = " B, c'est plutôt cool.";
                    break;
                default:
                    msgEmbed.setColor(colors.get("C"));
                    finDesc = " C, comme tout le monde au final.";
                    break;
            }

            switch (items[i]["type"]) {
                case "weapon":
                    debutDesc = "Félicitation vous avez trouvé une arme de tier";
                    break;
                case "ammo":
                    debutDesc = "Félicitation vous avez trouvé une boite de munition de tier";
                    break;
                case "med":
                    debutDesc = "Félicitation vous avez trouvé un soin de tier";
                    break;
                case "protection":
                    debutDesc = "Félicitation vous avez trouvé une protection de tier";
                    break;
                default :
                    debutDesc = "Félicitation vous avez trouvé un objet de tier";
                    break;
            }

            msgEmbed.setTitle(items[i]["name"] + " trouvé !");
            msgEmbed.setDescription(debutDesc + finDesc);
            msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game help\""});

            log.print("successfully looted the crate, returning item", 1);
            return [items[i], cat, msgEmbed];
        }
        i++;
    }
}
function searchCrate(crateName) {
    log.print("looking for the crate in game.json", 1);
    let crates = gameData["objets"]["crates"];
    let i = 0;
    while (i < crates.length) {
        if (crateName === crates[i]["name"]) {
            log.print("crate found !", 1);
            return crates[i];
        }
        i++;
    }
    log.print("can't find the crate, returning error", 1);
    return false;
}

function useItem(message) {
    let args = message.content.split(" ");
    let itemName = "";
    for (let i = 2; i < args.length; i++) itemName += args[i] + " ";
    itemName = itemName.slice(0, -1);

    let player = getPlayer(message);
    if (!player) return;

    let item = findItem(itemName);
    if (!item) {
        console.log("item pas trouvé :/");
        return;
    }

    switch (item["type"]) {
        case "crate":
            openCrate(message);
            return;
        case "ammo":
            console.log("impossible d'utiliser une munition :)");
            return;
        case "weapon":
            useWeapon(item, player);
            break;
        case "med":
            useMedicine(item, player);
            break;
        case "protection":
            useProtection(item, player);
            break;
    }

    console.log(player);
    //updateData();
}

function useProtection(protection, player) {
    let i = 0;
    while (i < player["inv"].length) {
        if (player["inv"][i]["id"] === protection["id"]) {
            if (player["inv"][i]["count"] > 1) player["inv"][i]["count"]--;
            else player["inv"].splice(i, 1);
            break;
        }
        i++;
    }

    let randInt;
    switch (protection["id"]) {
        case "c6ac9e8c-1822-42b5-870d-50e366650bce": // tenue de démineur
            randInt = Math.floor(Math.random() * (20 - 15) + 15);
            addArmorPlayer(randInt, player);
            break;
        case "a5832d33-68f5-4b83-8ebd-9903484d2d15": // gilet pare-balle
            randInt = Math.floor(Math.random() * (12 - 10) + 10);
            addArmorPlayer(randInt, player);
            break;
        case "85b58af1-d1e2-4657-baef-39664e3b9052": // gilet tactique
            randInt = Math.floor(Math.random() * (8 - 6) + 6);
            addArmorPlayer(randInt, player);
            break;
        case "816934d8-c5a3-40f4-a7ba-d73e24422470": // bouclier de chevalier
            randInt = Math.floor(Math.random() * (5 - 2) + 2);
            addArmorPlayer(randInt, player);
            break;
    }
}

function addArmorPlayer(armorAmount, player) {
    player["armor"] += armorAmount;
}

function useMedicine(medicine, player) {
    let i = 0;
    while (i < player["inv"].length) {
        if (player["inv"][i]["id"] === medicine["id"]) {
            if (player["inv"][i]["count"] > 1) player["inv"][i]["count"]--;
            else player["inv"].splice(i, 1);
            break;
        }
        i++;
    }

    let randInt;
    switch (medicine["id"]) {
        case "69fdba79-7814-4e10-ab04-7d9031f3c47e": // seringue
            randInt = Math.floor(Math.random() * (20 - 15) + 15);
            healPlayer(randInt, player);
            break;
        case "974fdc99-bf5f-4aea-858c-cc14765788df": // medkit
            randInt = Math.floor(Math.random() * (12 - 10) + 10);
            healPlayer(randInt, player);
            break;
        case "24ff4b27-5337-41d7-b50e-e79f24fab10d": // kit de premier soin
            randInt = Math.floor(Math.random() * (8 - 4) + 4);
            healPlayer(randInt, player);
            break;
        case "095b4994-a49f-44b0-8a7a-962244a072bc": // bandage
            randInt = Math.floor(Math.random() * (3 - 2) + 2);
            healPlayer(randInt, player);
            break;
        case "e0e07dde-97d2-4ca4-9875-6642b7384c7e": // pansement
            randInt = Math.floor(Math.random() * (3 - 2) + 2);
            healPlayer(randInt, player);
            break;
    }
}

function healPlayer(healAmount, player) {
    player["health"] += healAmount;
    if (player["health"] > maxHealth) player["health"] = maxHealth;
}

function useWeapon(weapon, player) {
    // chercher la munition dans l'inventaire
    let ammoId = weapon["munition"];
    if (ammoId) {
        let ammo = false;
        let i = 0;
        while (i < player["inv"].length) {
            if (player["inv"][i]["id"] === ammoId) ammo = player["inv"][i];
            i++
        }

        if (!ammo) {
            console.log("pas de munition pour utiliser l'arme");
            return false;
        }

        // remove une balle de l'inventaire
        ammo["count"]--;
        if (ammo["count"] <= 0) {
            player["inv"].splice(i, 1);
        }
    } else {
        let i = 0;
        while (i < player["inv"].length) {
            if (player["inv"][i]["id"] === weapon["id"]) {
                if (player["inv"][i]["count"] > 1) {
                    player["inv"][i]["count"]--;
                }
                else {
                    player["inv"].splice(i, 1);
                }
                break;
            }
            i++;
        }

    }
    let randInt, randInt2, randInt3;
     switch (weapon["id"]) {
         case "db0c7226-b54d-46f6-910a-cd13f6638939": // ak-47
             randInt = Math.floor(Math.random() * (3 - 2) + 2);
             randInt2 = Math.floor(Math.random() * (3 - 2) + 2);
             shootPlayers(randInt + randInt2, 1, player);
             break;
         case "91181b12-f8fa-4cea-a311-d7610e049380": // glock 18
             shootPlayers(2, 1, player);
             break;
         case "674bec62-1a50-409f-9196-1607496371e6": // baretta
             shootPlayers(3, 1, player);
             break;
         case "3bc72433-fe0f-47b3-9a17-f714555f879c": // desert eagle
             shootPlayers(5, 1, player, true);
             break;
         case "fe5329fb-786d-4a44-a607-059544ea6ff6": // colt 1911
             shootPlayers(2, 1, player);
             break;
         case "63a9bf96-aa6f-4e88-8bd1-a67464edd14b": // HK USP
             shootPlayers(2, 1, player);
             break;
         case "410b884e-7906-4fda-8e54-d27932c13b3d": // 357 Magnum
             randInt = Math.floor(Math.random() * (4 - 2) + 2);
             randInt2 = Math.floor(Math.random() * (4 - 2) + 2);
             shootPlayers(randInt + randInt2, 1, player);
             break;
         case "965b3713-0480-4adf-8e55-1e68d5890a96": // taser
             shootPlayers(1, 1, player);
             break;
         case "eb74e2fb-1b62-40c4-bd5d-08dc13304d0e": // M4A1
             randInt = Math.floor(Math.random() * (3 - 2) + 2);
             randInt2 = Math.floor(Math.random() * (3 - 2) + 2);
             shootPlayers(randInt + randInt2, 1, player);
             break;
         case "99a7cfe4-e8fd-42af-b60d-c12754665e2f": // SKS
             shootPlayers(7, 1, player);
             break;
         case "f03af414-d4a2-484f-9170-9989d410101a": // M4 super 90
             randInt = Math.floor(Math.random() * (8 - 5) + 5);
             randInt2 = Math.floor(Math.random() * (8 - 5) + 5);
             shootPlayers(randInt + randInt2, 1, player);
             break;
         case "b3f63afb-6f60-4abb-80be-1b54649250ca": // MP5A2
             shootPlayers(2, 1, player);
             break;
         case "b20e3725-2f6c-4995-bc57-761fb9064283": // MPX
             randInt = Math.floor(Math.random() * (3 - 1) + 1);
             randInt2 = Math.floor(Math.random() * (3 - 1) + 1);
             randInt3 = Math.floor(Math.random() * (3 - 1) + 1);
             shootPlayers(randInt + randInt2 + randInt3, 1, player);
             break;
         case "9ce3092c-f2d7-41ec-b9b5-12c2758b2325": // M32A1
             shootPlayers(5, 3, player);
             break;
         case "0a682b69-9234-4064-b487-d6be870c2f84": // SCAR-H
             randInt = Math.floor(Math.random() * (6 - 3) + 3);
             randInt2 = Math.floor(Math.random() * (6 - 3) + 3);
             randInt3 = Math.floor(Math.random() * (6 - 3) + 3);
             shootPlayers(randInt + randInt2 + randInt3, 1, player);
             break;
         case "65503d4d-12e3-4dd3-ace6-fc4f040bd35d": // P90
             randInt = Math.floor(Math.random() * (3 - 1) + 1);
             randInt2 = Math.floor(Math.random() * (3 - 1) + 1);
             randInt3 = Math.floor(Math.random() * (3 - 1) + 1);
             shootPlayers(randInt + randInt2 + randInt3, 1, player);
             break;
         case "1c3e7c6a-b77a-4772-b573-70dddbdcfe5c": // MP7
             randInt = Math.floor(Math.random() * (3 - 1) + 1);
             randInt2 = Math.floor(Math.random() * (3 - 1) + 1);
             randInt3 = Math.floor(Math.random() * (3 - 1) + 1);
             shootPlayers(randInt + randInt2 + randInt3, 1, player);
             break;
         case "c5c0ba54-4f3a-4c63-ab29-5d6c917154d8": // SV-98
             shootPlayers(6, 1, player, true);
             break;
         case "8221a349-60de-41b0-a7ba-41ab386eaf65": // Rem 700
             shootPlayers(8, 1, player, true);
             break;
         case "c3bd7600-bdce-4076-a5e3-fdcbaf94af78": // Cocktail Molotov
             randInt = Math.floor(Math.random() * (3 - 2) + 2);
             randInt2 = Math.floor(Math.random() * (3 - 2) + 2);
             shootPlayers(randInt + randInt2, 1, player);
             break;
         case "058361e2-d1ba-46fa-a231-a28411c5d2de": // Grenade explosive
             shootPlayers(5, 2, player);
             break;
         case "f4bba4de-5b09-4fc7-9eb1-3c07ca23e562": // NLAW
             shootPlayers(10, 1, player);
             break;
         case "b8657581-9f05-47c2-a955-710ca157557c": // RPG-7
             shootPlayers(8, 3, player);
             break;
         case "b28c357b-4c11-4cef-95e1-5b4a73c4343e": // Bombe
             shootPlayers(3, 3, player);
             break;
         case "22024005-8768-4754-8dec-47d44266e91a": // Grenade flash
             let blinded = blindPlayers(1, player); // renvoie le nb de gens flash
             console.log(blinded)
             break;
         case "4160668f-2b86-41e1-822f-ae5af585db67": // mine antipersonnel
             minePlayers(1, player); // renvoie le nb de gens minés
             break;
         case "5c5b617c-22a3-490d-a3f1-254d704ccd9c": // c4
             c4Players(1, player); // renvoie le nb de gens minés
             break;
     }
}

function c4Players(nbTarget, player) {
    let playerList = loadAllOtherPlayers(player["idDiscord"]);
    let targets = getTargets(nbTarget, playerList);

    targets.forEach((target) => {
        target["c4"]["count"]++;
        target["c4"]["minersId"].push(player["idDiscord"]);
    });
}

function detonateC4(message) {
    let userPlayer = getPlayer(message);
    let playerList = loadAllOtherPlayers(userPlayer["idDiscord"]);

    let c4ToExplode = [];
    playerList.forEach((player) => {
        if (player["c4"]["count"] > 0) {
            let i = 0;
            while (i < player["c4"]["count"]) {
                if (player["c4"]["minersId"][i] === userPlayer["idDiscord"]) {
                    c4ToExplode.push(player);
                    player["c4"]["minersId"].splice(i, 1);
                    player["c4"]["count"]--;
                } else {
                    i++;
                }
            }
        }
    });

    c4ToExplode.forEach((player) => {
        let damages = damagePlayer(15, player);
        if (damages["playerDead"]) {
            userPlayer["stats"]["nb_kills"]++;
            userPlayer["stats"]["kill_streak"]++;
            stealTarget(5,player, userPlayer);
        }
    });
}

function minePlayers(nbTarget, player) {
    let playerList = loadAllOtherPlayers(player["idDiscord"]);
    let targets = getTargets(nbTarget, playerList);

    targets.forEach((target) => {
        target["mines"]["count"]++;
        target["mines"]["minersId"].push(player["idDiscord"]);
    });
}

function blindPlayers(nbTarget, player) {
    let playerList = loadAllOtherPlayers(player["idDiscord"]);
    let targets = getNoFlashedTargets(nbTarget, playerList);
    let flashed = 0;
    targets.forEach((target) => {
        if (!target["flashed"]) {
            target["flashed"] = true;
            flashed++;
        }
    });

    return flashed;
}

function shootPlayers(damage, nbTarget, player, trueDamage = false) {
    let playerList = loadAllOtherPlayers(player["idDiscord"]);
    let targets = getTargets(nbTarget, playerList);

    let playerDead = false;

    targets.forEach((target) => {
        if (playerDead) return;
        if (player["flashed"]) {
            player["flashed"] = false;
        } else {
            // @TODO : mine gameplay
            if (player["mines"]["count"] > 0) {
                while (player["mines"]["count"] > 0) {
                    let damage = damagePlayer(15, player);
                    console.log("mine posé par : " + player["mines"]["minersId"][0] + " vient d'exploser");
                    // enlever la mine
                    let killer = getPlayerFromId(player["mines"]["minersId"][0]);
                    player["mines"]["count"]--;
                    player["mines"]["minersId"].splice(0, 1);

                    // check si mort et tuer le man
                    if (damage["playerDead"]) {
                        if (!killer) return;
                        killer["stats"]["nb_kills"]++;
                        killer["stats"]["kill_streak"]++;
                        stealTarget(5, player, killer);
                        playerDead = true;
                    }
                }

                //return // --> à mettre si on veut que quand on mange une mine ça annule l'attaque ? donc consommation de la munition
            }
            let damages = damagePlayer(damage, target, trueDamage);

            // si target morte alors, on vole 5 items dans son inventaire et on augmente son nb kill et sa kill streak de 1
            if (damages["playerDead"]) {
                player["stats"]["nb_kills"]++;
                player["stats"]["kill_streak"]++;
                stealTarget(5,target, player);
            }
        }
    });
}

function stealTarget(nbItemToSteal, target, player) {
    if (target["inv"].length === 0) return;
    if (nbItemToSteal > target["inv"].length) nbItemToSteal = target["inv"].length;
    for (let i = 0; i < nbItemToSteal; i++) {
        let randInt = Math.floor(Math.random() * target["inv"].length);
        if (target["inv"][randInt]["count"] > 1) {
            target["inv"][randInt]["count"]--;
            let copyItem = target["inv"][randInt];
            copyItem["count"] = 1;
            player["inv"].push(copyItem);
        } else {
            player["inv"].push(target["inv"][randInt]);
            target["inv"].splice(randInt, 1);
        }
    }
}

function damagePlayer(damage, player, trueDamage = true) {
    let armorDestroyed = false;
    let playerDead = false;

    let baseArmor;
    let finalDamage;
    if (trueDamage) {
        baseArmor = 0;
        finalDamage = damage;
    } else {
        baseArmor = player["armor"];
        finalDamage = damage - player["armor"];
        player["armor"] -= damage;
    }

    if (player["armor"] <= 0 && baseArmor > 0) {
        player["armor"] = 0;
        armorDestroyed = true;
    } else if (player["armor"] <= 0) player["armor"] = 0;

    if (finalDamage <= 0) {
        finalDamage = 0;
    }

    player["health"] -= finalDamage;
    if (player["health"] <= 0) {
        playerDead = true;
        player["stats"]["nb_morts"]++;

        player["health"] = maxHealth;
        player["armor"] = 0;
        player["flashed"] = false;
        player['mines'] = {"count": 0, "minerId": []};
        player['c4'] = {"count": 0, "minerId": []};

        if (player["stats"]["kill_streak"] > player["stats"]["max_kill_streak"]) {
            player["stats"]["max_kill_streak"] = player["stats"]["kill_streak"];
            player["stats"]["kill_streak"] = 0;
        }
    }

    return {
        "armorDestroyed" : armorDestroyed,
        "damageDone" : finalDamage,
        "playerDead" : playerDead
    }
}

function getTargets(nbTarget, playerList) {
    let targets = [];
    let tempPlayerList = playerList.slice();
    while (targets.length < nbTarget && tempPlayerList.length > 0) {
        let randInt = Math.floor(Math.random() * tempPlayerList.length);
        targets.push(tempPlayerList[randInt]);
        tempPlayerList.splice(randInt, 1);
    }
    return targets;
}

function getNoFlashedTargets(nbTarget, playerList) {
    let targets = [];
    let tempPlayerList = playerList.slice();
    while (targets.length < nbTarget && tempPlayerList.length > 0) {
        let randInt = Math.floor(Math.random() * tempPlayerList.length);
        if (!tempPlayerList[randInt]["flashed"]) targets.push(tempPlayerList[randInt]);
        tempPlayerList.splice(randInt, 1);
    }
    return targets;
}

function loadAllOtherPlayers(discordId) {
    let playerList = [];
    for (const playerId in gameData["joueurs"]) {
        if (playerId === discordId) continue;
        else if (gameData["joueurs"].hasOwnProperty(playerId)) playerList.push(gameData["joueurs"][playerId]);
    }
    return playerList;
}

function findItem(itemName) {

    for (let j = 0; j < gameData["objets"]["armes"].length; j++) {
        if (gameData["objets"]["armes"][j]["name"] === itemName) {
            return gameData["objets"]["armes"][j];
        }
    }

    for (let j = 0; j < gameData["objets"]["munitions"].length; j++) {
        if (gameData["objets"]["munitions"][j]["name"] === itemName) {
            return gameData["objets"]["munitions"][j];
        }
    }

    for (let j = 0; j < gameData["objets"]["medicine"].length; j++) {
        if (gameData["objets"]["medicine"][j]["name"] === itemName) {
            return gameData["objets"]["medicine"][j];
        }
    }

    for (let j = 0; j < gameData["objets"]["protection"].length; j++) {
        if (gameData["objets"]["protection"][j]["name"] === itemName) {
            return gameData["objets"]["protection"][j];
        }
    }

    for (let j = 0; j < gameData["objets"]["crates"].length; j++) {
        if (gameData["objets"]["crates"][j]["name"] === itemName) {
            return gameData["objets"]["crates"][j];
        }
    }

    return false;
}
function execute(message) {
    let args = message.content.split(" ");
    if (args[1] === "loot") {
        lootCrate(message);
    } else if (args[1] === "inv") {
        printInventory(message);
    } else if (args[1] === "open") {
        openCrate(message);
    } else if (args[1] === "use") {
        useItem(message);
    } else if (args[1] === "c4") {
        detonateC4(message);
    } else {
        test();
    }
}

module.exports = {
    execute
}