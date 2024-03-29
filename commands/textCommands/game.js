let fs = require('fs');
const path = require("path");
const {EmbedBuilder} = require('discord.js');

const log = require('../../assets/log');

let gameData;
const colors = new Map();
colors.set("S", "#fff300");
colors.set("A", "#7b02c7");
colors.set("B", "#0230c7");
colors.set("C", "#ffffff");
colors.set("kill", "#e0d850");
colors.set("death", "#000000");
colors.set("no_damage", "#2fd7b4");
colors.set("attack", "#b62626");
colors.set("mine_activated", "#cb6526");
colors.set("flashed", "#ffffff");
colors.set("flash", "#29a827");
colors.set("mined", "#29a827");
colors.set("pose_c4", "#29a827");
colors.set("heal", "#f120ab");
colors.set("armor", "#0293af");
colors.set("c4_detonated", "#ff5600");
colors.set("nothing_to_steal", "#888888");
colors.set("stolen", "#7df135");
colors.set("loaded offline loots", "#00ffd8");
colors.set("weapon jammed", "#6a1da8");
colors.set("missed shot", "#d5002e");
colors.set("sell", "#69cc9d");
colors.set("buy", "#69cc9d");
colors.set("antiMine", "#ff0000");

let channel;
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
    log.print("gameData has been successfully updated", 1);
}

function lootCrate(message) {
    log.print("tried to loot a crate", message.author, message.content);
    let msgEmbed = new EmbedBuilder();

    let joueur = getPlayer(message);
    if (!joueur) return;

    if (((new Date().getTime() - joueur["last_loot"]) / (1000 * 60 * 60)) < 1) {
        msgEmbed.setColor("#ff0000");
        msgEmbed.setTitle("Trop tôt !");
        msgEmbed.setDescription("Vous ne pouvez looter une caisse qu'une fois toute les heures.\nIl vous reste " + printWaitingTime(joueur));
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game notice\""});

        message.channel.send({embeds: [msgEmbed]});
        log.print("sending message error : less than 3 hours since last loot", 1);
        console.log("moins de 1 heure");
        return;
    }

    let randInt = Math.floor(Math.random() * 99 + 1);

    if (randInt <= 2) {
        // caisse rang S
        log.print("S rank crate found", 1);
        addCrate("faee6b1d-28cb-4728-aa58-5a4923ef92ec", joueur);
        msgEmbed.setColor(colors.get("S"));
        msgEmbed.setTitle("Caisse de rang S trouvée !");
        msgEmbed.setDescription("Félicitation vous avez trouvé une caisse de tier S, espèce de gros con.")
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game notice\""});

        message.channel.send({embeds: [msgEmbed]});
        log.print("sending success message", 1);
    } else if (randInt > 2 && randInt <= 12) {
        // caisse rang A
        log.print("A rank crate found", 1);
        addCrate("4649b24c-05cf-495f-b6ad-f5c9ba5f21ea", joueur);
        msgEmbed.setColor(colors.get("A"));
        msgEmbed.setTitle("Caisse de rang A trouvée !");
        msgEmbed.setDescription("Félicitation vous avez trouvé une caisse de tier A, bravo tu te crois malin c'est ça ?")
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game notice\""});

        message.channel.send({embeds: [msgEmbed]});
        log.print("sending success message", 1);
    } else if (randInt > 12 && randInt <= 41) {
        // caisse de rang b
        log.print("B rank crate found", 1);
        addCrate("630d1881-aaa6-4595-b913-040e2be7455a", joueur);
        msgEmbed.setColor(colors.get("B"));
        msgEmbed.setTitle("Caisse de rang B trouvée !");
        msgEmbed.setDescription("Félicitation vous avez trouvé une caisse de tier B, c'est plutôt cool.")
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game notice\""});

        message.channel.send({embeds: [msgEmbed]});
        log.print("sending success message", 1);
    } else {
        // caisse de rang c
        log.print("C rank crate found", 1);
        addCrate("63f93ab9-8930-4788-9439-ca3f476c6da8", joueur);
        msgEmbed.setColor(colors.get("C"));
        msgEmbed.setTitle("Caisse de rang C trouvée !");
        msgEmbed.setDescription("Félicitation vous avez trouvé une caisse de tier C, comme tout le monde au final.");
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game notice\""});

        message.channel.send({embeds: [msgEmbed]});
        log.print("sending success message", 1);
    }
}

function lootOfflineCrate(player) {
    log.print("loot message is good, looting crate for " + player["name"], 1);
    let randInt = Math.floor(Math.random() * 99 + 1);
    let msgEmbed = new EmbedBuilder();

    if (randInt <= 2) {
        // caisse rang S
        log.print("S rank crate found", 1);
        addCrate("faee6b1d-28cb-4728-aa58-5a4923ef92ec", player);
    } else if (randInt > 2 && randInt <= 12) {
        // caisse rang A
        log.print("A rank crate found", 1);
        addCrate("4649b24c-05cf-495f-b6ad-f5c9ba5f21ea", player);
    } else if (randInt > 12 && randInt <= 41) {
        // caisse de rang B
        log.print("B rank crate found", 1);
        addCrate("630d1881-aaa6-4595-b913-040e2be7455a", player);
    } else {
        // caisse de rang C
        log.print("C rank crate found", 1);
        addCrate("63f93ab9-8930-4788-9439-ca3f476c6da8", player);
    }
}

function printWaitingTime(player) {
    let diff = new Date().getTime() - player["last_loot"];

    let finalDiff = 3600000 - diff //3600000 === 1 heure

    const seconds = Math.floor(finalDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    return `${hours % 24} heure(s), ${minutes % 60} minute(s) et ${seconds % 60} seconde(s)`;
}

function addCrate(crateId, joueur) {
    log.print("adding crate (#" + crateId + ") to player " + joueur["discordName"] + " inventory", 1);
    let crates = JSON.parse(JSON.stringify(gameData["objets"]["crates"]));
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
            joueur["stats"]["crates_looted"][crateToAdd["tier"]] += 1;
            log.print("crate found in inventory, updating number of crate for the user", 1);
            updateData();
            return;
        }
        i++;
    }

    crateToAdd["count"] = 1;
    joueur["inv"].push(crateToAdd);
    joueur["last_loot"] = Date.now();
    joueur["stats"]["crates_looted"][crateToAdd["tier"]] += 1;
    log.print("creating a new item in player inventory for the new crate", 1);
    updateData();
}

function printInventory(message) {
    log.print("tried to print his inventory", message.author, message.content);
    let args = message.content.split(" ");
    const regex = /<@!?\d+>/;
    let joueur;
    if (regex.test(args[2])) {
        {
            let id = args[2].slice(2, args[2].length - 1);
            joueur = getPlayerFromId(id);
        }
    } else joueur = getPlayer(message);
    if (!joueur) return;

    if (joueur["inv"].length <= 0) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Votre inventaire est vide !");
        msgEmbed.setColor("#ff0000");
        msgEmbed.setDescription("Il n'y a rien a affiché si ce n'est de la poussière ...");
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game notice\""});
        message.channel.send({embeds: [msgEmbed]});

        log.print("sending empty inventory message", 1);
        return;
    }

    let sections = sortInventory(joueur);

    let str = "";
    if (sections[0].length > 0) {
        str += "**Liste des armes**\n";
        let rangS = false;
        let rangA = false;
        let rangB = false;
        let rangC = false;
        for (let i = 0; i < sections[0].length; i++) {
            if (sections[0][i]["tier"] === "S" && !rangS) {
                str += "\nRang S (2%) :\n";
                rangS = !rangS;
            } else if (sections[0][i]["tier"] === "A" && !rangA) {
                str += "\nRang A (10%) :\n";
                rangA = !rangA;
            } else if (sections[0][i]["tier"] === "B" && !rangB) {
                str += "\nRang B (30%) :\n";
                rangB = !rangB;
            } else if (sections[0][i]["tier"] === "C" && !rangC) {
                str += "\nRang C (58%) :\n";
                rangC = !rangC;
            }
            if (sections[0][i]["munition"]) {
                let munition = gameData["objets"]["munitions"].find(munition => munition["id"] === sections[0][i]["munition"]);
                let strMunition = munition["name"];
                let munitionInInv = sections[1].find(munition => munition["id"] === sections[0][i]["munition"]);
                if (munitionInInv) strMunition += " (x" + munitionInInv["count"] + ")";
                else strMunition += " (x0)";
                str += sections[0][i]["name"] + " (x" + sections[0][i]["count"] + ") - Munition : " + strMunition + "\n";
            } else {
                str += sections[0][i]["name"] + " (x" + sections[0][i]["count"] + ") - Munition : aucune\n";
            }
        }
        str += "\n";
    }
    if (sections[1].length > 0) {
        str += "**Liste des munitions**\n";
        let rangS = false;
        let rangA = false;
        let rangB = false;
        let rangC = false;
        for (let i = 0; i < sections[1].length; i++) {
            if (sections[1][i]["tier"] === "S" && !rangS) {
                str += "\nRang S (2%) :\n";
                rangS = !rangS;
            } else if (sections[1][i]["tier"] === "A" && !rangA) {
                str += "\nRang A (10%) :\n";
                rangA = !rangA;
            } else if (sections[1][i]["tier"] === "B" && !rangB) {
                str += "\nRang B (30%) :\n";
                rangB = !rangB;
            } else if (sections[1][i]["tier"] === "C" && !rangC) {
                str += "\nRang C (58%) :\n";
                rangC = !rangC;
            }

            str += sections[1][i]["name"] + " (x" + sections[1][i]["count"] + ")\n";
        }
        str += "\n";
    }
    if (sections[2].length > 0) {
        str += "**Liste des soins**\n";
        let rangS = false;
        let rangA = false;
        let rangB = false;
        let rangC = false;
        for (let i = 0; i < sections[2].length; i++) {
            if (sections[2][i]["tier"] === "S" && !rangS) {
                str += "\nRang S (2%) :\n";
                rangS = !rangS;
            } else if (sections[2][i]["tier"] === "A" && !rangA) {
                str += "\nRang A (10%) :\n";
                rangA = !rangA;
            } else if (sections[2][i]["tier"] === "B" && !rangB) {
                str += "\nRang B (30%) :\n";
                rangB = !rangB;
            } else if (sections[2][i]["tier"] === "C" && !rangC) {
                str += "\nRang C (58%) :\n";
                rangC = !rangC;
            }

            str += sections[2][i]["name"] + " (x" + sections[2][i]["count"] + ")\n";
        }
        str += "\n";
    }
    if (sections[3].length > 0) {
        str += "**Liste des protections**\n";
        let rangS = false;
        let rangA = false;
        let rangB = false;
        let rangC = false;
        for (let i = 0; i < sections[3].length; i++) {
            if (sections[3][i]["tier"] === "S" && !rangS) {
                str += "\nRang S (2%) :\n";
                rangS = !rangS;
            } else if (sections[3][i]["tier"] === "A" && !rangA) {
                str += "\nRang A (10%) :\n";
                rangA = !rangA;
            } else if (sections[3][i]["tier"] === "B" && !rangB) {
                str += "\nRang B (30%) :\n";
                rangB = !rangB;
            } else if (sections[3][i]["tier"] === "C" && !rangC) {
                str += "\nRang C (58%) :\n";
                rangC = !rangC;
            }

            str += sections[3][i]["name"] + " (x" + sections[3][i]["count"] + ")\n";
        }
        str += "\n";
    }
    if (sections[4].length > 0) {
        str += "**Liste des caisses**\n";
        let rangS = false;
        let rangA = false;
        let rangB = false;
        let rangC = false;
        for (let i = 0; i < sections[4].length; i++) {
            if (sections[4][i]["tier"] === "S" && !rangS) {
                str += "\nRang S (2%) :\n";
                rangS = !rangS;
            } else if (sections[4][i]["tier"] === "A" && !rangA) {
                str += "\nRang A (10%) :\n";
                rangA = !rangA;
            } else if (sections[4][i]["tier"] === "B" && !rangB) {
                str += "\nRang B (30%) :\n";
                rangB = !rangB;
            } else if (sections[4][i]["tier"] === "C" && !rangC) {
                str += "\nRang C (58%) :\n";
                rangC = !rangC;
            }

            str += sections[4][i]["name"] + " (x" + sections[4][i]["count"] + ")\n";
        }
        str += "\n";
    }

    message.channel.send(str);
    log.print("inventory successfully printed", 1);
}

function getPlayer(message) {
    log.print("fecthing player information", 1);
    let joueur;
    if (gameData["joueurs"].hasOwnProperty(message.author.id)) joueur = gameData["joueurs"][message.author.id];
    else {
        msgEmbed.setColor("#ff0000");
        msgEmbed.setTitle("Aucun personnage trouvé pour vous ! ");
        msgEmbed.setDescription("Aucun personnage n'est associé à votre id.");
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game notice\""});

        message.channel.send({embeds: [msgEmbed]});
        log.print("sending message error : no character linked to this person", 1);
        return false;
    }
    return joueur;
}

function getPlayerFromId(playerId) {
    log.print("fetching player data from his id", 1);
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
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game notice\""});

        message.channel.send({embeds: [msgEmbed]});
        log.print("error message successfully sent", 1);
        return;
    }

    if (!removeCrate(crateToOpen["id"], player)) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setColor("#ff0000");
        msgEmbed.setTitle("Erreur : caisse introuvable");
        msgEmbed.setDescription("Vous ne possédez pas la caisse que vous avez essayé d'ouvrir. Utiliser la commande \"game inv\" pour afficher votre inventaire.");
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game notice\""});

        message.channel.send({embeds: [msgEmbed]});
        log.print("error : player doesn't have the crate", 1);
        return;
    }

    let loot = getItemFromCrate(crateToOpen["id"]);
    addItem(loot, player);

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor(colors.get(loot["tier"]));
    msgEmbed.setTitle(loot["name"] + " trouvé !");
    if (loot.hasOwnProperty("desc")) msgEmbed.setDescription(loot["desc"]);
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game help\""});

    message.channel.send({embeds: [msgEmbed]});
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

function addItem(item, player) {
    log.print("adding the item to the player inventory", 1);
    let i = 0;
    while (i < player["inv"].length) {
        if (player["inv"][i]["id"] === item["id"]) {
            player["inv"][i]["count"]++;
            log.print("item found in inventory, updating number of item for the user", 1);
            updateData();
            return;
        }
        i++;
    }

    item["count"] = 1;
    player["inv"].push(item);
    log.print("creating a new item in player inventory for the new item", 1);
    updateData();
}

function getItemFromCrate(crateId) {
    log.print("Looting the crate to get a new item", 1);
    let itemId;
    let randInt;

    switch (crateId) {
        case "faee6b1d-28cb-4728-aa58-5a4923ef92ec": //caisse rang S
            randInt = Math.floor(Math.random() * 9 + 1);
            if (randInt === 1) {
                // Medikit
                itemId = "974fdc99-bf5f-4aea-858c-cc14765788df";
            } else if (randInt === 2) {
                // Tenue de démineur
                itemId = "c6ac9e8c-1822-42b5-870d-50e366650bce";
            } else if (randInt === 3) {
                // Gilet pare-balle
                itemId = "a5832d33-68f5-4b83-8ebd-9903484d2d15";
            } else if (randInt === 4) {
                // M4 super 90
                itemId = "f03af414-d4a2-484f-9170-9989d410101a";
            } else if (randInt === 5) {
                // SCAR-H
                itemId = "0a682b69-9234-4064-b487-d6be870c2f84";
            } else if (randInt === 6) {
                // Rem 700
                itemId = "8221a349-60de-41b0-a7ba-41ab386eaf65";
            } else if (randInt === 7) {
                // RPG-7
                itemId = "b8657581-9f05-47c2-a955-710ca157557c";
            } else if (randInt === 8) {
                // NLAW
                itemId = "f4bba4de-5b09-4fc7-9eb1-3c07ca23e562";
            } else if (randInt === 9) {
                // Mine antipersonnel
                itemId = "4160668f-2b86-41e1-822f-ae5af585db67";
            }
            break;

        case "4649b24c-05cf-495f-b6ad-f5c9ba5f21ea": // caisse de rang A
            randInt = Math.floor(Math.random() * 12 + 1);
            if (randInt === 1) {
                // Desert Eagle
                itemId = "3bc72433-fe0f-47b3-9a17-f714555f879c";
            } else if (randInt === 2) {
                // 357 magnum
                itemId = "410b884e-7906-4fda-8e54-d27932c13b3d";
            } else if (randInt === 3) {
                // Gilet SKS
                itemId = "99a7cfe4-e8fd-42af-b60d-c12754665e2f";
            } else if (randInt === 4) {
                // M32A1
                itemId = "9ce3092c-f2d7-41ec-b9b5-12c2758b2325";
            } else if (randInt === 5) {
                // SV-98
                itemId = "c5c0ba54-4f3a-4c63-ab29-5d6c917154d8";
            } else if (randInt === 6) {
                // Cocktail molotov
                itemId = "c3bd7600-bdce-4076-a5e3-fdcbaf94af78";
            } else if (randInt === 7) {
                // Grenade flash
                itemId = "22024005-8768-4754-8dec-47d44266e91a";
            } else if (randInt === 8) {
                // Cal 12
                itemId = "5ca3b4fb-3c7d-491a-b2e2-6b4d1c7ab918";
            } else if (randInt === 9) {
                // .308 WIN
                itemId = "3bcc71f5-daee-4bb2-9ade-cbc37cce68f7";
            } else if (randInt === 10) {
                // PG-7V
                itemId = "3c4a07e6-c095-4324-9bba-1d8a1de53e6a";
            } else if (randInt === 11) {
                // Seringue
                itemId = "69fdba79-7814-4e10-ab04-7d9031f3c47e";
            } else if (randInt === 12) {
                // Gilet tactique
                itemId = "85b58af1-d1e2-4657-baef-39664e3b9052";
            }
            break;

        case "630d1881-aaa6-4595-b913-040e2be7455a": // caisse de rang B
            randInt = Math.floor(Math.random() * 16 + 1);
            if (randInt === 1) {
                // M4A1
                itemId = "eb74e2fb-1b62-40c4-bd5d-08dc13304d0e";
            } else if (randInt === 2) {
                // 357 AK-47
                itemId = "db0c7226-b54d-46f6-910a-cd13f6638939";
            } else if (randInt === 3) {
                // Gilet MPX
                itemId = "b20e3725-2f6c-4995-bc57-761fb9064283";
            } else if (randInt === 4) {
                // P90
                itemId = "65503d4d-12e3-4dd3-ace6-fc4f040bd35d";
            } else if (randInt === 5) {
                // MP7
                itemId = "1c3e7c6a-b77a-4772-b573-70dddbdcfe5c";
            } else if (randInt === 6) {
                // Grenade explosive
                itemId = "98df46f7-5a8a-4760-a74b-7c49eec9b04b";
            } else if (randInt === 7) {
                // 7,62x51 mm
                itemId = "27fdecb5-3a3e-46af-9cb9-cd4aab0d1271";
            } else if (randInt === 8) {
                // .357 Magnum
                itemId = "c369dfd0-37c6-4da2-981d-4972ef126d36";
            } else if (randInt === 9) {
                // Kit de premier soin
                itemId = "24ff4b27-5337-41d7-b50e-e79f24fab10d";
            } else if (randInt === 10) {
                // Anti douleur
                itemId = "acb5d750-3c8e-4e24-aec9-acb989a63b5e";
            } else if (randInt === 11) {
                // Bandage
                itemId = "095b4994-a49f-44b0-8a7a-962244a072bc";
            } else if (randInt === 12) {
                // Bouclier de chevalier
                itemId = "816934d8-c5a3-40f4-a7ba-d73e24422470";
            } else if (randInt === 13) {
                // Grenade explosive (arme)
                itemId = "058361e2-d1ba-46fa-a231-a28411c5d2de";
            } else if (randInt === 14) {
                // C4
                itemId = "5c5b617c-22a3-490d-a3f1-254d704ccd9c";
            } else if (randInt === 15) {
                // Bombe
                itemId = "b28c357b-4c11-4cef-95e1-5b4a73c4343e";
            } else if (randInt === 16) {
                // .50 AE
                itemId = "95401368-5219-426c-8977-bd469d8426bb";
            }
            break;

        case "63f93ab9-8930-4788-9439-ca3f476c6da8": // caisse de rang C
            randInt = Math.floor(Math.random() * 13 + 1);
            if (randInt === 1) {
                // Glock 18
                itemId = "91181b12-f8fa-4cea-a311-d7610e049380";
            } else if (randInt === 2) {
                // Beretta 92
                itemId = "674bec62-1a50-409f-9196-1607496371e6";
            } else if (randInt === 3) {
                // Colt 1911
                itemId = "fe5329fb-786d-4a44-a607-059544ea6ff6";
            } else if (randInt === 4) {
                // HK USP
                itemId = "63a9bf96-aa6f-4e88-8bd1-a67464edd14b";
            } else if (randInt === 5) {
                // Taser
                itemId = "965b3713-0480-4adf-8e55-1e68d5890a96";
            } else if (randInt === 6) {
                // MP5A2
                itemId = "b3f63afb-6f60-4abb-80be-1b54649250ca";
            } else if (randInt === 7) {
                // 9x19 mm
                itemId = "259fb976-376a-4008-b9c6-e8199a9dee78";
            } else if (randInt === 8) {
                // 9 mm
                itemId = "e02ee42e-8475-409e-8a80-0c051131e4bb";
            } else if (randInt === 9) {
                // .45 ACP
                itemId = "b25d2396-8d09-45d7-be93-b0a3fcc60c29";
            } else if (randInt === 10) {
                // 5,56x45 mm
                itemId = "ca10ce42-811d-47fe-bf2b-77b6253ae644";
            } else if (randInt === 11) {
                // 7,62x39 mm
                itemId = "49372c93-8d1b-4141-a2da-89f201a8ee78";
            } else if (randInt === 12) {
                // 4,6x30 mm
                itemId = "9a88c3bd-87e5-41f0-85f6-e9930411efc2";
            } else if (randInt === 13) {
                // Pansement
                itemId = "e0e07dde-97d2-4ca4-9875-6642b7384c7e";
            }
            break;
    }

    // recup l'item
    let item = findItemById(itemId);
    log.print("successfully looted the crate, returning item", 1);
    return item;
}

function findItemById(itemId) {
    for (let j = 0; j < gameData["objets"]["armes"].length; j++) {
        if (gameData["objets"]["armes"][j]["id"] === itemId) {
            return JSON.parse(JSON.stringify(gameData["objets"]["armes"][j]));
        }
    }

    for (let j = 0; j < gameData["objets"]["munitions"].length; j++) {
        if (gameData["objets"]["munitions"][j]["id"] === itemId) {
            return JSON.parse(JSON.stringify(gameData["objets"]["munitions"][j]));
        }
    }

    for (let j = 0; j < gameData["objets"]["medicine"].length; j++) {
        if (gameData["objets"]["medicine"][j]["id"] === itemId) {
            return JSON.parse(JSON.stringify(gameData["objets"]["medicine"][j]));
        }
    }

    for (let j = 0; j < gameData["objets"]["protection"].length; j++) {
        if (gameData["objets"]["protection"][j]["id"] === itemId) {
            return JSON.parse(JSON.stringify(gameData["objets"]["protection"][j]));
        }
    }

    for (let j = 0; j < gameData["objets"]["crates"].length; j++) {
        if (gameData["objets"]["crates"][j]["id"] === itemId) {
            return JSON.parse(JSON.stringify(gameData["objets"]["crates"][j]));
        }
    }

    return false;
}

function searchCrate(crateName) {
    log.print("looking for the crate in game.json", 1);
    let crates = JSON.parse(JSON.stringify(gameData["objets"]["crates"]));
    let i = 0;

    while (i < crates.length) {
        if (crateName.toLowerCase() === crates[i]["name"].toString().toLowerCase()) {
            log.print("crate found !", 1);
            return crates[i];
        }
        i++;
    }
    log.print("can't find the crate, returning error", 1);
    return false;
}

function useItem(message) {
    log.print("tried to use an item", message.author, message.content);
    let args = message.content.split(" ");
    let itemName = "";
    for (let i = 2; i < args.length; i++) itemName += args[i] + " ";
    itemName = itemName.slice(0, -1);

    let player = getPlayer(message);
    if (!player) return;

    let item = findItem(itemName);
    if (!item) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setColor("#ff0000");
        msgEmbed.setTitle("Erreur : item introuvable");
        msgEmbed.setDescription("L'item que vous avez utiliser est introuvable. Essayer de copier le nom de l'item directement depuis votre inventaire (commande : *game inv*)");
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game use help\""});

        message.channel.send({embeds: [msgEmbed]});
        log.print("error : item doesn't exist", 1);
        return;
    }

    let result;
    switch (item["type"]) {
        case "crate":
            openCrate(message);
            log.print("opening crate ...", 1);
            return;
        case "ammo":
            let msgEmbed = new EmbedBuilder();
            msgEmbed.setColor("#ff0000");
            msgEmbed.setTitle("Erreur : item inutilisable");
            msgEmbed.setDescription("Il est impossible d'utiliser une munition seule. Utiliser l'arme associée à votre munition.");
            msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game use help\""});

            message.channel.send({embeds: [msgEmbed]});
            log.print("error : can't use an ammo", 1);
            return;
        case "weapon":
            log.print("using weapon ...", 1);
            result = useWeapon(item, player); // @TODO
            if (result["flash"]) {
                message.author.send({embeds: [result["flash"]]});
                let result2 = JSON.parse(JSON.stringify(result));
                result2["flash"]["description"] = "Vous avez lancé votre grenade flash avec succès. Vérifiez vos MP pour connaître la cible.";
                message.channel.send({embeds: [result2["flash"]]});
            } else if (result["mine"]) {
                message.author.send({embeds: [result["mine"]]});
                let result2 = JSON.parse(JSON.stringify(result));
                result2["mine"]["description"] = "Vous avez utilisé votre mine avec succès. Vérifiez vos MP pour connaître la cible.";
                message.channel.send({embeds: [result2["mine"]]});
            } else if (result["c4"]) {
                message.author.send({embeds: [result["c4"]]});
                let result2 = JSON.parse(JSON.stringify(result));
                result2["c4"]["description"] = "Vous avez lancé votre C4 avec succès. Vérifiez vos MP pour connaître la cible.";
                message.channel.send({embeds: [result2["c4"]]});
            } else if (result["silent"]) {
                message.author.send({embeds: result["silent"]});
                let result2 = JSON.parse(JSON.stringify(result));
                result2["silent"].forEach(message => {
                    message["title"] = "Vous avez attaqué avec succès. Vérifiez vos MP pour connaître la cible.";
                    message["description"] = " ";
                });
                //result2["silent"]["description"] = "Vous avez attaqué avec succès. Vérifiez vos MP pour connaître la cible.";
                message.channel.send({embeds: result2["silent"]});
            } else {
                message.channel.send({embeds: result});
            }
            break;
        case "med":
            message.channel.send({embeds: [useMedicine(item, player)]});
            break;
        case "protection":
            message.channel.send({embeds: [useProtection(item, player)]});
            break;
    }

    updateData();
}

function useProtection(protection, player) {
    let i = 0;
    let itemFound = false;
    while (i < player["inv"].length) {
        if (player["inv"][i]["id"] === protection["id"]) {
            if (player["inv"][i]["count"] > 1) player["inv"][i]["count"]--;
            else player["inv"].splice(i, 1);
            itemFound = !itemFound;
            break;
        }
        i++;
    }

    if (!itemFound) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setColor("#ff0000");
        msgEmbed.setTitle("Erreur : vous n'avez pas la protection");
        msgEmbed.setDescription("Vous n'avez la protection : " + protection["name"] + ", gros con !");
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game use help\""});
        return msgEmbed;
    }

    let randInt;
    switch (protection["id"]) {
        case "c6ac9e8c-1822-42b5-870d-50e366650bce": // tenue de démineur
            player["state"]["antiMine"] = true;
            return addArmorPlayer(8, player);
        case "a5832d33-68f5-4b83-8ebd-9903484d2d15": // gilet pare-balle
            randInt = Math.floor(Math.random() * (15 - 10) + 10);
            return addArmorPlayer(randInt, player);
        case "85b58af1-d1e2-4657-baef-39664e3b9052": // gilet tactique
            randInt = Math.floor(Math.random() * (7 - 4) + 4);
            return addArmorPlayer(randInt, player);
        case "816934d8-c5a3-40f4-a7ba-d73e24422470": // bouclier de chevalier
            randInt = Math.floor(Math.random() * (5 - 2) + 2);
            return addArmorPlayer(randInt, player);
    }
}

function addArmorPlayer(armorAmount, player) {
    player["armor"] += armorAmount;
    player["stats"]["shield_used"] += armorAmount;

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor(colors.get("armor"));
    msgEmbed.setTitle("Vous vous êtes appliqué un bouclier");
    msgEmbed.setDescription("Vous avez gagner " + armorAmount + " points d'armure.");
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game notice\""});
    return msgEmbed;
}

function useMedicine(medicine, player) {
    let i = 0;
    let itemFound = false;
    while (i < player["inv"].length) {
        if (player["inv"][i]["id"] === medicine["id"]) {
            if (player["inv"][i]["count"] > 1) player["inv"][i]["count"]--;
            else player["inv"].splice(i, 1);
            itemFound = !itemFound;
            break;
        }
        i++;
    }

    if (!itemFound) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setColor("#ff0000");
        msgEmbed.setTitle("Erreur : vous n'avez pas l'objet");
        msgEmbed.setDescription("Vous n'avez l'objet : " + medicine["name"] + ", gros con !");
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game use help\""});
        return msgEmbed;
    }

    let randInt;
    switch (medicine["id"]) {
        case "69fdba79-7814-4e10-ab04-7d9031f3c47e": // seringue
            randInt = Math.floor(Math.random() * (10 - 6) + 6);
            buffNextAttack(player, 0.25);
            return healPlayer(randInt, player);
        case "974fdc99-bf5f-4aea-858c-cc14765788df": // medikit
            randInt = Math.floor(Math.random() * (20 - 15) + 15);
            return healPlayer(randInt, player);
        case "24ff4b27-5337-41d7-b50e-e79f24fab10d": // kit de premier soin
            randInt = Math.floor(Math.random() * (8 - 4) + 4);
            return healPlayer(randInt, player);
        case "acb5d750-3c8e-4e24-aec9-acb989a63b5e": // anti douleur
            randInt = Math.floor(Math.random() * (5 - 2) + 2);
            buffPlayerResistance(player, 0.25);
            return healPlayer(randInt, player);
        case "095b4994-a49f-44b0-8a7a-962244a072bc": // bandage
            randInt = Math.floor(Math.random() * (6 - 3) + 3);
            nerfPlayerPrecision(player, 10);
            return healPlayer(randInt, player);
        case "e0e07dde-97d2-4ca4-9875-6642b7384c7e": // pansement
            randInt = Math.floor(Math.random() * (2 - 1) + 1);
            return healPlayer(randInt, player);
    }
}

function buffNextAttack(player, boost) {
    player["state"]["damageBoost"] = player["state"]["damageBoost"] + boost;
}

function buffPlayerResistance(player, boost) {
    player["state"]["resistance"] = player["state"]["resistance"] + boost;
}

function nerfPlayerPrecision(player, nerf) {
    player["state"]["precisionNerf"] = player["state"]["precisionNerf"] + nerf;
}

function healPlayer(healAmount, player) {
    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor(colors.get("heal"));
    msgEmbed.setTitle("Vous vous êtes soigné");

    player["health"] += healAmount;
    player["stats"]["hp_healed"] += healAmount;
    if (player["health"] > maxHealth) {
        player["health"] = maxHealth;
        msgEmbed.setDescription("Vous avez regagner toute votre vie.");
    } else {
        msgEmbed.setDescription("Vous avez regagner " + healAmount + " points de vie.");
    }

    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game notice\""});
    return msgEmbed;
}

function useWeapon(weapon, player) {
    // chercher la munition dans l'inventaire
    let ammoId = weapon["munition"];
    if (ammoId) {
        let ammo = false;
        let i = 0;
        while (i < player["inv"].length) {
            if (player["inv"][i]["id"] === ammoId) {
                ammo = player["inv"][i];
                break;
            }
            i++
        }

        if (!ammo) {
            let msgEmbed = new EmbedBuilder();
            msgEmbed.setColor("#ff0000");
            msgEmbed.setTitle("Erreur : pas de munition");
            msgEmbed.setDescription("Vous n'avez pas de munition pour l'arme : " + weapon["name"]);
            msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game use help\""});
            return [msgEmbed];
        }

        // remove une balle de l'inventaire
        ammo["count"]--;
        if (ammo["count"] <= 0) {
            player["inv"].splice(i, 1);
        }
    } else {
        let i = 0;
        let itemFound = false;
        while (i < player["inv"].length) {
            if (player["inv"][i]["id"] === weapon["id"]) {
                if (player["inv"][i]["count"] > 1) {
                    player["inv"][i]["count"]--;
                    itemFound = !itemFound
                } else {
                    player["inv"].splice(i, 1);
                    itemFound = !itemFound
                }
                break;
            }
            i++;
        }
        if (!itemFound) {
            let msgEmbed = new EmbedBuilder();
            msgEmbed.setColor("#ff0000");
            msgEmbed.setTitle("Erreur : vous n'avez pas l'arme");
            msgEmbed.setDescription("Vous n'avez l'arme : " + weapon["name"] + ", gros con !");
            msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game use help\""});
            return [msgEmbed];
        }
    }

    let randInt, randInt2, randInt3, randInt4, rand;

    switch (weapon["id"]) {
        case "db0c7226-b54d-46f6-910a-cd13f6638939": // ak-47$
            rand = Math.floor(Math.random() * 100) + 1;
            if (rand <= 2) {
                // arme enrayee
                let msgEmbed = new EmbedBuilder();
                msgEmbed.setColor(colors.get("weapon jammed"));
                msgEmbed.setTitle("L'arme vient de s'enrayer, vraiment pas de chance");
                msgEmbed.setDescription("L'arme que vous venez d'utiliser vient de s'enrayer, vous ne pouvez pas l'utiliser pour cette attaque seulement et vous venez de gaspiller une munition.");
                msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game use help\""});
                return [msgEmbed];
            }
            randInt = Math.floor(Math.random() * (8 - 4) + 4);
            return shootPlayers(randInt, 1, player);
        case "91181b12-f8fa-4cea-a311-d7610e049380": // glock 18
            return shootPlayers(2, 1, player);
        case "674bec62-1a50-409f-9196-1607496371e6": // beretta
            return shootPlayers(2, 1, player, true);
        case "3bc72433-fe0f-47b3-9a17-f714555f879c": // desert eagle
            return shootPlayers(5, 2, player, true);
        case "fe5329fb-786d-4a44-a607-059544ea6ff6": // colt 1911
            randInt = Math.floor(Math.random() * (3 - 2) + 2);
            return shootPlayers(randInt, 1, player);
        case "63a9bf96-aa6f-4e88-8bd1-a67464edd14b": // HK USP
            return {"silent": shootPlayers(2, 1, player)};
        case "410b884e-7906-4fda-8e54-d27932c13b3d": // 357 Magnum
            randInt = Math.floor(Math.random() * (3 - 2) + 2);
            randInt2 = Math.floor(Math.random() * (3 - 2) + 2);
            randInt3 = Math.floor(Math.random() * (3 - 2) + 2);
            return shootPlayers(randInt + randInt2 + randInt3, 2, player, true);
        case "965b3713-0480-4adf-8e55-1e68d5890a96": // taser
            return shootPlayers(1, 1, player);
        case "eb74e2fb-1b62-40c4-bd5d-08dc13304d0e": // M4A1
            randInt = Math.floor(Math.random() * (3 - 2) + 2);
            randInt2 = Math.floor(Math.random() * (3 - 2) + 2);
            randInt3 = Math.floor(Math.random() * (3 - 2) + 2);
            return shootPlayers(randInt + randInt2 + randInt3, 1, player);
        case "99a7cfe4-e8fd-42af-b60d-c12754665e2f": // SKS
            return shootPlayers(7, 1, player);
        case "f03af414-d4a2-484f-9170-9989d410101a": // M4 super 90
            randInt = Math.floor(Math.random() * (8 - 5) + 5);
            randInt2 = Math.floor(Math.random() * (8 - 5) + 5);
            return shootPlayers(randInt + randInt2, 1, player);
        case "b3f63afb-6f60-4abb-80be-1b54649250ca": // MP5A2
            randInt = Math.floor(Math.random() * 2);
            randInt2 = Math.floor(Math.random() * 2);
            return shootPlayers(randInt + randInt2, 1, player);
        case "b20e3725-2f6c-4995-bc57-761fb9064283": // MPX
            randInt = Math.floor(Math.random() * (3 - 1) + 1);
            randInt2 = Math.floor(Math.random() * (3 - 1) + 1);
            randInt3 = Math.floor(Math.random() * (3 - 1) + 1);
            return shootPlayers(randInt + randInt2 + randInt3, 1, player);
        case "9ce3092c-f2d7-41ec-b9b5-12c2758b2325": // M32A1
            return shootPlayers(5, 3, player);
        case "0a682b69-9234-4064-b487-d6be870c2f84": // SCAR-H
            randInt = Math.floor(Math.random() * (6 - 3) + 3);
            randInt2 = Math.floor(Math.random() * (6 - 3) + 3);
            randInt3 = Math.floor(Math.random() * (6 - 3) + 3);
            return shootPlayers(randInt + randInt2 + randInt3, 1, player);
        case "65503d4d-12e3-4dd3-ace6-fc4f040bd35d": // P90
            randInt = Math.floor(Math.random() * (2 - 1) + 1);
            randInt2 = Math.floor(Math.random() * (2 - 1) + 1);
            randInt3 = Math.floor(Math.random() * (2 - 1) + 1);
            randInt4 = Math.floor(Math.random() * (2 - 1) + 1);

            rand = Math.floor(Math.random() * 100 + 1);
            if (rand <= 5) randInt4 = 0;

            return shootPlayers(randInt + randInt2 + randInt3 + randInt4, 1, player);
        case "1c3e7c6a-b77a-4772-b573-70dddbdcfe5c": // MP7
            randInt = Math.floor(Math.random() * (3 - 1) + 1);
            randInt2 = Math.floor(Math.random() * (3 - 1) + 1);
            randInt3 = Math.floor(Math.random() * (3 - 1) + 1);
            return shootPlayers(randInt + randInt2 + randInt3, 1, player);
        case "c5c0ba54-4f3a-4c63-ab29-5d6c917154d8": // SV-98
            return shootPlayers(7, 1, player, true);
        case "8221a349-60de-41b0-a7ba-41ab386eaf65": // Rem 700
            return shootPlayers(9, 1, player, true);
        case "c3bd7600-bdce-4076-a5e3-fdcbaf94af78": // Cocktail Molotov
            randInt = Math.floor(Math.random() * (4 - 3) + 3);
            randInt2 = Math.floor(Math.random() * (4 - 3) + 3);
            randInt3 = Math.floor(Math.random() * (4 - 3) + 3);
            return shootPlayers(randInt + randInt2 + randInt3, 1, player);
        case "058361e2-d1ba-46fa-a231-a28411c5d2de": // Grenade explosive
            return shootPlayers(5, 2, player);
        case "f4bba4de-5b09-4fc7-9eb1-3c07ca23e562": // NLAW
            rand = Math.floor(Math.random() * 100 + 1);
            if (rand <= 5) {
                let msgEmbed = new EmbedBuilder();
                msgEmbed.setColor(colors.get("missed shot"));
                msgEmbed.setTitle("Vous avez loupé votre cible, vraiment pas de chance !");
                msgEmbed.setDescription("Le NLAW n'est pas très précis d'aussi loin, malheureusement vous avez loupé votre cible et utiliser cette arme pour rien.");
                msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game use help\""});
                return [msgEmbed];
            }
            return shootPlayers(10, 1, player);
        case "b8657581-9f05-47c2-a955-710ca157557c": // RPG-7
            return shootPlayers(8, 3, player);
        case "b28c357b-4c11-4cef-95e1-5b4a73c4343e": // Bombe
            return shootPlayers(3, 3, player);
        case "22024005-8768-4754-8dec-47d44266e91a": // Grenade flash
            return {"flash": blindPlayers(1, player)};
        case "4160668f-2b86-41e1-822f-ae5af585db67": // mine antipersonnel
            return {"mine": minePlayers(1, player)};
        case "5c5b617c-22a3-490d-a3f1-254d704ccd9c": // c4
            return {"c4": c4Players(1, player)};
    }
}

function c4Players(nbTarget, player) {
    let playerList = loadAllOtherPlayers(player["idDiscord"]);
    let targets = getTargets(nbTarget, playerList);

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor(colors.get("pose_c4"));
    msgEmbed.setTitle("C4 posé");

    let str = " ";
    targets.forEach((target) => {
        target["c4"]["count"]++;
        target["c4"]["minersId"].push(player["idDiscord"]);
        str += target["discordName"] + " ";
    });

    str.slice(0, -1);
    msgEmbed.setDescription("Vous avez posé un C4 chez :" + str);
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game notice\""});
    return msgEmbed;
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

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor(colors.get("c4_detonated"));
    if (c4ToExplode.length <= 0) {
        console.log("il a pas de c4 a faire exploser");
        return;
    }
    if (c4ToExplode.length === 1) {
        msgEmbed.setTitle("Un C4 vient d'exploser !");
        msgEmbed.setDescription(userPlayer["discordName"] + " vient de faire exploser un C4 sur " + c4ToExplode[0]["discordName"] + " !");
    } else {
        msgEmbed.setTitle("Plusieurs C4 viennent d'exploser !");
        msgEmbed.setDescription(userPlayer["discordName"] + " vient de faire exploser un C4 sur plusieurs joueurs !");
    }
    msgEmbed.addFields({name: "Cible(s) des C4", value: " "});
    c4ToExplode.forEach((player) => {
        msgEmbed.addFields({name: player["discordName"], value: ("Vie restante : " + player["health"])});

        if (player["state"]["antiMine"]) {
            let msgEmbed2 = new EmbedBuilder();
            msgEmbed2.setColor(colors.get("antiMine"));
            msgEmbed2.setTitle("Aucun dégâts fait !");
            msgEmbed2.setDescription(player["discordName"] + " portait une tenue de démineur, il a résisté à votre C4");
            msgEmbed2.setFooter({text: "Pour plus d'informations utiliser la commande \"game notice\""});
            message.channel.send({embeds: [msgEmbed2]});
            player["state"]["antiMine"] = false;
            return;
        }
        let damages = damagePlayer(5, player);

        if (damages["playerDead"]) {
            userPlayer["stats"]["nb_kills"]++;
            userPlayer["stats"]["kill_streak"]++;
            let msgEmbed3 = stealTarget(5, player, userPlayer);
            let msgEmbed2 = new EmbedBuilder();

            msgEmbed2.setColor(colors.get("kill"));
            msgEmbed2.setTitle("Vous avez tué "  + player["discordName"]);
            msgEmbed2.setDescription("Vous avez tué " + player["idDiscord"] + " grâce à vote C4, vous venez de lui voler 5 objets de son inventaire.");
            msgEmbed2.setFooter({text: "Pour plus d'informations utiliser la commande \"game notice\""});
            message.channel.send({embeds: [msgEmbed2, msgEmbed3]});
            console.log("player dead " + player["discordName"]);
        }
    });

    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game notice\""});
    message.channel.send({embeds: [msgEmbed]});

    updateData();
}

function minePlayers(nbTarget, player) {
    let playerList = loadAllOtherPlayers(player["idDiscord"]);
    let targets = getTargets(nbTarget, playerList);

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor(colors.get("mined"));
    msgEmbed.setTitle("Mine posée");

    let str = " ";
    targets.forEach((target) => {
        target["mines"]["count"]++;
        target["mines"]["minersId"].push(player["idDiscord"]);
        str += target["discordName"] + " ";
    });
    str.slice(0, -1);
    msgEmbed.setDescription("Vous avez posé une mine chez :" + str);
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game notice\""});
    return msgEmbed;
}

function blindPlayers(nbTarget, player) {
    let playerList = loadAllOtherPlayers(player["idDiscord"]);
    let targets = getNoFlashedTargets(nbTarget, playerList);
    let flashed = 0;

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor(colors.get("flash"));
    msgEmbed.setTitle("Grenade flash lancé");
    let str = " ";

    targets.forEach((target) => {
        if (!target["flashed"]) {
            target["flashed"] = true;
            str += target["discordName"] + ",";
            flashed++;
        }
    });
    str.slice(0, -1);
    msgEmbed.setDescription("Vous avez flashé " + flashed + " personne(s) :" + str);
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game notice\""});
    return msgEmbed;
}

function shootPlayers(damage, nbTarget, player, trueDamage = false) {
    let playerList = loadAllOtherPlayers(player["idDiscord"]);
    let targets = getTargets(nbTarget, playerList);

    let playerDead = false;
    let msgEmbed = new EmbedBuilder();

    if (player["state"]["precisionNerf"] > 0) {
        let randInt = Math.floor(Math.random() * 100 + 1);
        if (randInt < player["state"]["precisionNerf"]) {
            msgEmbed.setColor(colors.get("missed shot"));
            msgEmbed.setTitle("Vous loupez votre cible !");
            msgEmbed.setDescription("Vous ne vous êtes pas encore remis de votre dernière blessure et ce vilain bandage n'a pas arrangé les choses.");
            msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game notice\""});
            player["state"]["precisionNerf"] = 0;
            log.print("player precision is nerfed, he can't shoot", 1, "randInt : " + randInt);
            return [msgEmbed];
        } else {
            player["state"]["precisionNerf"] = 0;
        }
    }

    if (player["flashed"]) {
        player["flashed"] = false;
        msgEmbed.setColor(colors.get("flashed"));
        msgEmbed.setTitle("Vous êtes flashé");
        msgEmbed.setDescription("Vous avez été flashé par quelqu'un, vous loupez votre tir !");
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game notice\""});

        log.print("player is flashed, he can't shoot", 1);
        return [msgEmbed];
    }

    let msgEmbeds = [];
    targets.forEach((target) => {
        if (!playerDead) {
            let msgEmbed = new EmbedBuilder();

            //mine gameplay
            if (player["mines"]["count"] > 0) {
                while (player["mines"]["count"] > 0) {
                    let damage = damagePlayer(12, player);
                    log.print("a mined planted by " + player["mines"]["minersId"][0] + "just exploded", 1);
                    let msgEmbed = new EmbedBuilder();
                    msgEmbed.setColor(colors.get("mine_activated"));
                    msgEmbed.setTitle("Une mine vient d'exploser !");
                    msgEmbed.setDescription(player["discordName"] + " vient de se prendre une mine posée par <@" + player["mines"]["minersId"][0] + "> !");
                    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game notice\""});
                    channel.send({embeds: [msgEmbed]});

                    // enlever la mine
                    let killer = getPlayerFromId(player["mines"]["minersId"][0]);
                    player["mines"]["count"]--;
                    player["mines"]["minersId"].splice(0, 1);

                    // check si mort et tuer le man
                    if (damage["playerDead"]) {
                        if (!killer) return;
                        killer["stats"]["nb_kills"]++;
                        killer["stats"]["kill_streak"]++;
                        let stealEmbed = stealTarget(5, player, killer);
                        playerDead = true;

                        msgEmbed.setColor(colors.get("death"));
                        msgEmbed.setTitle("Vous êtes mort");
                        msgEmbed.setDescription("Vous avez été tué par l'explosion d'une mine posée par <@" + killer["idDiscord"] + ">");
                        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game notice\""});

                        msgEmbeds.push(msgEmbed, stealEmbed);
                        return;
                    }
                }

                //return // --> à mettre si on veut que quand on mange une mine ça annule l'attaque ? donc consommation de la munition
            }

            if (player["state"]["damageBoost"] > 1 || player["state"]["damageBoost"] < 1) {
                damage = Math.ceil(damage * player["state"]["damageBoost"]);
                player["state"]["damageBoost"] = 1;
            }
            let damages = damagePlayer(damage, target, trueDamage);
            player["stats"]["damages_done"] += damages["damageDone"];

            // si target morte alors, on vole 5 items dans son inventaire et on augmente son nb kill et sa kill streak de 1
            if (damages["playerDead"]) {
                player["stats"]["nb_kills"]++;
                player["stats"]["kill_streak"]++;
                let stealEmbed = stealTarget(5, target, player);
                msgEmbed.setColor(colors.get("kill"));
                msgEmbed.setTitle("Vous avez tué " + target["discordName"] + " !");
                msgEmbed.setDescription("Vous avez tué " + target["discordName"] + ", grâce à ça vous venez de lui voler 5 objets de son inventaire.");
                msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game notice\""});
                msgEmbeds.push(stealEmbed);

                let msgEmbedTarget = new EmbedBuilder();
                msgEmbedTarget.setColor(colors.get("death"));
                msgEmbedTarget.setTitle("Vous avez été tué par " + player["discordName"]);
                msgEmbedTarget.setDescription("Vous avez été tué par " + player["discordName"] + ", il va vous voler 5 objets de votre inventaire.");
                sendMPMessage(target["idDiscord"], [msgEmbedTarget]);
            } else {
                msgEmbed.setTitle("Vous avez attaqué " + target["discordName"] + " !");
                let msgEmbedTarget = new EmbedBuilder();
                msgEmbedTarget.setTitle("Vous avez été attaqué par " + player["discordName"]);
                if (damages["armorDestroyed"]) {
                    msgEmbed.setColor(colors.get("attack"));
                    msgEmbedTarget.setColor(colors.get("attack"));
                    msgEmbed.setDescription("Vous avez détruit son armure et fait " + damages["damageDone"] + " dégâts.");
                    msgEmbedTarget.setDescription("Il a détruit votre armure et fait " + damages["damageDone"] + " dégâts.");
                    msgEmbedTarget.addFields({name: "HP restants", value: target["health"].toString()});
                    sendMPMessage(target["idDiscord"], [msgEmbedTarget]);
                } else if (damages["damageDone"] === 0) {
                    msgEmbed.setColor(colors.get("no_damage"));
                    msgEmbedTarget.setColor(colors.get("no_damage"));
                    msgEmbed.setDescription("Malheureusement il était bien protégé, vous n'avez pas réussi à lui faire des dégâts.");
                    msgEmbedTarget.setDescription("Heureusement vous êtes bien protégé, vous n'avez pas perdu de points de vie");
                    msgEmbedTarget.addFields({name: "Armure restante", value: target["armor"].toString()});
                    sendMPMessage(target["idDiscord"], [msgEmbedTarget]);
                } else {
                    msgEmbed.setColor(colors.get("attack"));
                    msgEmbedTarget.setColor(colors.get("attack"));
                    msgEmbedTarget.setDescription("Vous avez perdu " + damages["damageDone"] + " points de vie.");
                    msgEmbedTarget.addFields({name: "HP restants", value: target["health"].toString()});
                    msgEmbed.setDescription("Vous lui avez fait " + damages["damageDone"] + " dégâts.");
                    sendMPMessage(target["idDiscord"], [msgEmbedTarget]);
                }
                msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game notice\""});
            }
            msgEmbeds.push(msgEmbed);
        }
    });
    return msgEmbeds;
}

function stealTarget(nbItemToSteal, target, player) {
    let msgEmbed = new EmbedBuilder();

    if (target["inv"].length === 0) {
        msgEmbed.setTitle("Il n'y a rien à voler chez ce(tte) pauvre " + target["discordName"]);
        msgEmbed.setColor(colors.get("nothing_to_steal"));
        msgEmbed.setDescription("Déjà qu'il ou elle n'a pas grand chose vous n'allez quand même pas en plus voler sa dignité. Pour la peine vous avez le droit de looter une caisse.");
        player["last_loot"] = 0;
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game notice\""});
        channel.send({embeds: [msgEmbed]});
        log.print("nothing to steal, setting last loot timer to 0", 1);
        return msgEmbed;
    }
    if (nbItemToSteal > target["inv"].length) nbItemToSteal = target["inv"].length;
    let itemAdded = [];
    for (let i = 0; i < nbItemToSteal; i++) {
        let randInt = Math.floor(Math.random() * target["inv"].length);
        if (target["inv"][randInt]["count"] > 1) {
            target["inv"][randInt]["count"]--;
            let copyItem = JSON.parse(JSON.stringify(target["inv"][randInt]));
            copyItem["count"] = 1;
            addItem(copyItem, player);
            itemAdded.push(copyItem);
        } else {
            addItem(target["inv"][randInt], player);
            itemAdded.push(target["inv"][randInt])
            target["inv"].splice(randInt, 1);
        }
    }

    msgEmbed.setTitle("Vous avez volé " + itemAdded.length + " item(s) chez " + target["discordName"]);
    msgEmbed.setColor(colors.get("stolen"));
    msgEmbed.setDescription("Puisque vous avez tué " + target["discordName"] + " vous lui avez volé " + itemAdded.length + " de ses items. Voici ce que vous avez volé :");
    for (let i = 0; i < itemAdded.length; i++) {
        msgEmbed.addFields({name: itemAdded[i]["name"], value: ("TIER " + itemAdded[i]["tier"]), inline: true});
    }
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game notice\""});
    return msgEmbed;
}

function damagePlayer(damage, player, trueDamage = false) {
    let armorDestroyed = false;
    let playerDead = false;
    let baseArmor;
    let finalDamage;

    if (trueDamage) {
        baseArmor = 0;
        finalDamage = Math.ceil(damage - damage * player["state"]["resistance"]);
    } else {
        baseArmor = player["armor"];
        finalDamage = Math.ceil(damage - damage * player["state"]["resistance"]) - player["armor"];
        player["armor"] -= Math.ceil(damage - damage * player["state"]["resistance"]);
    }

    if (player["state"]["resistance"] > 0) player["state"]["resistance"] = 0;

    if (player["armor"] <= 0 && baseArmor > 0) {
        player["armor"] = 0;
        armorDestroyed = true;
    } else if (player["armor"] <= 0) player["armor"] = 0;

    if (finalDamage <= 0) {
        finalDamage = 0;
    }

    player["health"] -= finalDamage;
    player["stats"]["damages_took"] += finalDamage;
    if (player["health"] <= 0) {
        playerDead = true;
        player["stats"]["nb_morts"]++;

        player["health"] = maxHealth;
        player["armor"] = 0;
        player["flashed"] = false;
        player['mines'] = {"count": 0, "minersId": []};
        player['c4'] = {"count": 0, "minersId": []};

        if (player["stats"]["kill_streak"] > player["stats"]["max_kill_streak"]) {
            player["stats"]["max_kill_streak"] = player["stats"]["kill_streak"];
            player["stats"]["kill_streak"] = 0;
        }
    }

    return {
        "armorDestroyed": armorDestroyed,
        "damageDone": finalDamage,
        "playerDead": playerDead
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
        if (gameData["objets"]["armes"][j]["name"].toLowerCase() === itemName.toLowerCase()) {
            return JSON.parse(JSON.stringify(gameData["objets"]["armes"][j]));
        }
    }

    for (let j = 0; j < gameData["objets"]["munitions"].length; j++) {
        if (gameData["objets"]["munitions"][j]["name"].toLowerCase() === itemName.toLowerCase()) {
            return JSON.parse(JSON.stringify(gameData["objets"]["munitions"][j]));
        }
    }

    for (let j = 0; j < gameData["objets"]["medicine"].length; j++) {
        if (gameData["objets"]["medicine"][j]["name"].toLowerCase() === itemName.toLowerCase()) {
            return JSON.parse(JSON.stringify(gameData["objets"]["medicine"][j]));
        }
    }

    for (let j = 0; j < gameData["objets"]["protection"].length; j++) {
        if (gameData["objets"]["protection"][j]["name"].toLowerCase() === itemName.toLowerCase()) {
            return JSON.parse(JSON.stringify(gameData["objets"]["protection"][j]));
        }
    }

    for (let j = 0; j < gameData["objets"]["crates"].length; j++) {
        if (gameData["objets"]["crates"][j]["name"].toLowerCase() === itemName.toLowerCase()) {
            return JSON.parse(JSON.stringify(gameData["objets"]["crates"][j]));
        }
    }

    return false;
}

function printStats(message) {
    let args = message.content.split(" ");
    const regex = /<@!?\d+>/;
    let player;
    if (regex.test(args[2])) {
        {
            let id = args[2].slice(2, args[2].length - 1);
            player = getPlayerFromId(id);
        }
    } else player = getPlayer(message);

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setTitle("Statistiques");
    msgEmbed.setColor("#00ce5e");
    msgEmbed.setDescription("Voici vos stats pour ce jeu");
    msgEmbed.addFields({name: "Points de vie", value: player["health"].toString(), inline: true});
    msgEmbed.addFields({name: "Armure", value: player["armor"].toString(), inline: true});
    msgEmbed.addFields({name: "Argent", value: player["money"].toString(), inline: true});
    msgEmbed.addFields({name: "Kills", value: player["stats"]["nb_kills"].toString(), inline: true});
    msgEmbed.addFields({name: "Morts", value: player["stats"]["nb_morts"].toString(), inline: true});
    msgEmbed.addFields({name: " ", value: " "});
    msgEmbed.addFields({name: "Série meurtrière", value: player["stats"]["kill_streak"].toString(), inline: true});
    msgEmbed.addFields({name: "Meilleure série", value: player["stats"]["max_kill_streak"].toString(), inline: true});
    msgEmbed.addFields({name: " ", value: " "});
    msgEmbed.addFields({name: "Dégâts reçus", value: player["stats"]["damages_took"].toString(), inline: true});
    msgEmbed.addFields({name: "Dégâts faits", value: player["stats"]["damages_done"].toString(), inline: true});
    msgEmbed.addFields({name: " ", value: " "});
    msgEmbed.addFields({name: "Vie soignée", value: player["stats"]["hp_healed"].toString(), inline: true});
    msgEmbed.addFields({name: "Armure utilisée", value: player["stats"]["shield_used"].toString(), inline: true});
    msgEmbed.addFields({name: "Caisses récupérées", value: " "});
    msgEmbed.addFields({name: "S", value: player["stats"]["crates_looted"]["S"].toString(), inline: true});
    msgEmbed.addFields({name: "A", value: player["stats"]["crates_looted"]["A"].toString(), inline: true});
    msgEmbed.addFields({name: " ", value: " "});
    msgEmbed.addFields({name: "B", value: player["stats"]["crates_looted"]["B"].toString(), inline: true});
    msgEmbed.addFields({name: "C", value: player["stats"]["crates_looted"]["C"].toString(), inline: true});
    msgEmbed.addFields({name: " ", value: " "});
    msgEmbed.addFields({name: "Nombre d'objets achetés", value: player["stats"]["bought_objects"].toString(), inline: true});
    msgEmbed.addFields({name: "Nombre d'objets vendus", value: player["stats"]["sold_objects"].toString(), inline: true});

    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game notice\""});
    message.channel.send({embeds: [msgEmbed]});
}

function sellItem(message) {
    log.print("tried to sell an item", message.author, message.content);
    let args = message.content.split(" ");
    let itemName = "";
    for (let i = 2; i < args.length; i++) itemName += args[i] + " ";
    itemName = itemName.slice(0, -1);

    let player = getPlayer(message);
    if (!player) return;

    let item = findItem(itemName);
    if (!item) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setColor("#ff0000");
        msgEmbed.setTitle("Erreur : item introuvable");
        msgEmbed.setDescription("L'item que vous avez utiliser est introuvable. Essayer de copier le nom de l'item directement depuis votre inventaire (commande : *game inv*)");
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game use help\""});

        message.channel.send({embeds: [msgEmbed]});
        log.print("error : item doesn't exist", 1);
        return;
    }

    if (item["type"] === "ammo") {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setColor("#ff0000");
        msgEmbed.setTitle("Erreur : impossible de vendre une munition");
        msgEmbed.setDescription("Il est impossible de vendre une munition pas de chance.");
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game use help\""});

        message.channel.send({embeds: [msgEmbed]});
        log.print("error : can't sell ammo", 1);
        return;
    }

    if (!removeItem(player, item["id"])) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setColor("#ff0000");
        msgEmbed.setTitle("Erreur : impossible de vendre un objet que vous n'avez pas");
        msgEmbed.setDescription("Il est impossible de vendre un objet que vous ne possédez pas espèce de gros con");
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game use help\""});

        message.channel.send({embeds: [msgEmbed]});
        log.print("error : player doesn't have item", 1);
        return;
    }

    player["money"] += item["sellPrice"];
    player["stats"]["sold_objects"]++;

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor(colors.get("sell"));
    msgEmbed.setTitle("Objet vendu avec succès !");
    msgEmbed.setDescription("Vous avez vendu votre objet au prix de : " + item["sellPrice"].toString());
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game use help\""});
    message.channel.send({embeds: [msgEmbed]});
    log.print("sending success message", 1);

    updateData();
}

function removeItem(player, itemId) {
    let i = 0;
    while (i < player["inv"].length) {
        if (player["inv"][i]["id"] === itemId) {
            if (player["inv"][i]["count"] > 1) {
                player["inv"][i]["count"]--;
                return true;
            } else {
                player["inv"].splice(i, 1);
                return true;
            }
        }
        i++;
    }
    return false;
}

function help(message) {
    message.channel.send("PAS ENCORE DISPO FF fait game notice ya tout marqué\nsinon les commandes principales c'est : game loot, game inv, game use [nom_item], game stats, game open [nom_caisse], game detonate")
}

function notice(message) {
    let msgEmbed = new EmbedBuilder();
    let msgEmbed1 = new EmbedBuilder();
    msgEmbed.setColor("#bf00ff");
    msgEmbed1.setColor("#bf00ff");
    msgEmbed.setTitle("Notice du jeu");
    msgEmbed1.setTitle("Notice du jeu - suite");
    msgEmbed.setDescription("C'est un jeu, toutes les heures vous pouvez obtenir une caisse à ouvrir qui vous donnera soit : des armes, des munitions, du heal ou des protections. Vous pouvez utiliser ces différents objets pour vous défendre ou attaquer les autres joueurs du discord. Pour l'instant il n'y a aucun but à part s'amuser.");
    msgEmbed.addFields({
        name: "Obtenir et ouvrir des caisses",
        value: "Il y a 4 types de caisses : caisse de rang C, caisse de rang B, caisse de rang A et caisse de rang S. Chaque caisse à un % de chance différent d'être drop et peut être ouverte dès que le souhaite avec la commande \"game open [nom_caisse]\". Voici une liste des caisses avec leur rang et leur % de chance de drop : "
    });
    msgEmbed.addFields({
        name: "Taux de drop des caisses : ",
        value: "Caisse de rang S : 2%\nCaisse de rang A : 10%\nCaisse de rang B : 30%\nCaisse de rang C : 58%"
    });
    msgEmbed.addFields({
        name: "Utiliser ses armes",
        value: "Les armes ont un type de munition associé, sans cette dernière vous ne pourrait pas attaquer les autres joueurs. Les munitions sont trouvables dans les caisses de munitions. Si vous possédez les munitions ou que vous avez une arme qui n'en a pas besoin vous pouvez l'utiliser avec la commande \"game use [nom_arme]\". Voici la liste des armes, de leurs dégâts, de leurs effets et de leurs munitions."
    });
    msgEmbed.addFields({
        name: "Jouer quand le bot est déconnecté",
        value: "Quand le bot est déconnecté vous pouvez toujours récupérer des caisses toutes les heures. Pour cela vous avez juste à écire la commande \"game loot\" dans le salon #jeu-de-fou-offline . Quand le bot sera reconnecté il enverra un message vous disant qu'il a bien effectué tous les loots que vous avez fait en son abscence."
    })
    msgEmbed.addFields({
        name: "Liste des armes", value: "**Rang S : **\n" +
            "M4 super 90 - munition : Cal 12 - Dégâts : 5 à 8 - Effet : Tire 2 cartouches pour le prix d'une\n" +
            "SCAR-H - munition : 7,62 x 51mm - Dégâts : 3 à 6 - Effet : Tire 3 cartouches pour le prix d'une\n" +
            "Rem 700 - munition : .308 WIN - Dégâts : 9 - Effet : Ignore l'armure de la cible\n" +
            "RPG-7 - munition : PG-7V - Dégâts : 8 - Effet : Tire sur 3 joueurs\n" +
            "NLAW - munition : aucune - Dégâts : 10 - Effet : Inflige 10 de dégâts à un joueur, 5% de chance de rater sa cible\n" +
            "Mine antipersonnel - munition : aucune - Dégâts : 12 - Effet : S'active chez le joueur cible lorsqu'il attaque. Un joueur peut marcher sur plusieurs mines d'un seul coup."
    });
    msgEmbed.addFields({
        name: "Rang A :",
        value: "Desert Eagle - munition : .50AE - Dégâts : 5 - Effet : Tire sur 2 joueurs et ignore l'armure de la cible\n" +
            "357 Magnum - munition : .357 Magnum - Dégâts 2 à 3 : - Effet : Tire sur 2 joueurs et tire 3 cartouches par joueur pour le prix d'une au total\n" +
            "SKS - munition : 7,62 x 39mm - Dégâts : 7 - Effet : Inflige 7 de dégâts à un joueur\n" +
            "M32A1 - munition : Grenade explosive - Dégâts : 5 - Effet : Tire sur 3 joueurs\n" +
            "SV-98 - munition : 7,62 x 51mm - Dégâts : 7 - Effet : Ignore l'armure de la cible\n" +
            "Cocktail molotov - munition : aucune - Dégâts : 3 à 4 - Effet : Attaque 3 fois la cible\n" +
            "Grenade flash - munition : aucune - Dégâts : 0 - Effet : Annule la prochaine attaque de la cible. Une cible ne peut être flashé que pour 1 attaque"
    });
    msgEmbed.addFields({
        name: "Rang B : ",
        value: "M4A1 - munition : 5,56 x 45mm - Dégâts : 2 à 3 - Effet : Tire 3 cartouches pour le prix d'une\n" +
            "AK-47 - munition : 7,62 x 39mm - Dégâts : 4 à 8 - Effet : Fait 4 à 8 de dégâts à un joueur, l'arme a 2% de chance de s'enrayer\n" +
            "MPX - munition : 9mm - Dégâts : 1 à 3 - Effet : Tire 3 cartouches pour le prix d'une\n" +
            "P90 - munition : 9 x 19mm - Dégâts : 1 à 2 - Effet : Tire 3 cartouches pour le prix d'une, 95% de chance d'en tirer une 4eme\n" +
            "MP7 - munition : 4,6 x 30mm - Dégâts : 1 à 3 - Effet : Tire 3 cartouches pour le prix d'une\n" +
            "Grenade explosive - munition : aucune - Dégâts : 5 - Effet : Tire sur 2 joueurs\n" +
            "C4 - munition : aucune - Dégâts : 5 - Effet : Les C4 se déclenchent lorsque vous le souhaitez. Vous pouvez poser plusieurs C4 avant de les déclencher. Le déclenchement les fera tous exploser en même temps. Pour déclencher un C4 utiliser la commande \"game detonate\"\n" +
            "Bombe - munition : aucune - Dégâts : 3 - Effet : Tire sur 3 joueurs\n"
    });
    msgEmbed.addFields({
        name: "Rang C : ",
        value: "Glock 18 - munition : 9 x 19mm - Dégâts : 2 - Effet : Inflige 2 de dégâts à un joueur\n" +
            "Colt 1911 - munition : .45 ACP - Dégâts : 2-3 - Effet : Inflige 2 à 3 de dégâts à un joueur \n" +
            "HK USP - munition : .45 ACP - Dégâts : 2 - Effet : Inflige 2 de dégâts à un joueur dont seul vous connaissez l'identité\n" +
            "MP5A2 - munition : 9 x 19mm - Dégâts : 0-2 - Effet : Tire 2 cartouches pour le prix d'une et inflige 0 à 2 de dégâts à un joueur \n" +
            "Taser - munition : aucune - Dégâts : 1 - Effet : Inflige 1 de dégât à un joueur \n" +
            "Beretta 92 - munition : 9mm - Dégâts : 2 - Effet : Ignore l'armure de la cible\n"
    });
    msgEmbed.addFields({
        name: "Utiliser les consommables",
        value: "Les consommables sont les objets de soin et de protection, pour les utiliser c'est comme pour les armes il suffit de faire la commande \"game use [nom_objet]\". Voici la liste de ces consommables."
    });
    msgEmbed.addFields({
        name: "Liste des consommables", value:
            "**Rang S :**\n" +
            "Medikit - Soigne entre 15 et 20 points de vie\n" +
            "Tenue de démineur - Ajoute entre 8 d'armure et protège contre la prochain explosion de mine ou de C4\n" +
            "Gilet pare-balle - Ajoute entre 10 et 15 points d'armure\n" +
            "**Rang A (10%) :**\n" +
            "Seringue - Soigne entre 6 et 10 points de vie et donne 25% de dégâts supplémentaires à la prochaine attaque\n" +
            "Gilet tactique - Ajoute entre 4 et 7 points d'armure\n" +
            "**Rang B (30%) :**\n" +
            "Kit de premier soin - Soigne entre 4 et 8 points de vie\n" +
            "Anti douleur - Soigne entre 2 et 5 points de vie et donne 25% de résistance à la prochaine attaque\n" +
            "Bandage - Soigne entre 3 et 6 points de vie et réduit de 10% la précision de la prochaine attaque\n" +
            "Bouclier de chevalier - Ajoute entre 2 et 5 points d'armure\n" +
            "**Rang C (58%) :**\n" +
            "Pansement - Soigne entre 1 et 2 points de vie\n"

    });
    msgEmbed.addFields({name: " ", value: " "});
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game help\""});
    msgEmbed1.setFooter({text: "Pour plus d'informations utiliser la commande \"game help\""});

    message.channel.send({embeds: [msgEmbed, msgEmbed1]});
}

function loadOfflineLoots(client) {
    log.print("fetching offline messages to loot crates", 1);
    let truePlayers = gameData["joueurs"];
    loadMessages(client)
        .then((msgLoots) => {
            let playersCopyWithTimestamps = parseOfflineMessages(msgLoots[0]);
            Object.entries(playersCopyWithTimestamps).forEach(([key, player]) => {
                player["lootMessages"].forEach(timestamp => {
                    if (((timestamp - truePlayers[key]["last_loot"]) / (1000 * 60 * 60)) > 1) {
                        lootOfflineCrate(truePlayers[key]);
                        truePlayers[key]["last_loot"] = timestamp;
                    }
                });
            });

            updateData();

            let msgEmbed = new EmbedBuilder();

            msgEmbed.setColor(colors.get("loaded offline loots"));
            msgEmbed.setTitle("Loot hors ligne récupérer avec succès");
            msgEmbed.setDescription("Les commandes \"game loot\" effectuées quand le bot était hors ligne ont été récupéré et activé avec succès. Vérifier vos inventaires pour voir ce que vous avez obtenu !")
            msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game notice\""});

            msgLoots[1].send({embeds: [msgEmbed]});
            log.print("successfully looted all crates", 1);

        })
        .catch(error => {
            console.error(error);
        });
}

async function loadMessages(client) {
    log.print("fetching message for offline looting", 1);
    let msgLoots = [];
    let channel;

    try {
        const res = await client.channels.fetch("1170062817894879333");
        channel = res;
        const messages = await res.messages.fetch();

        for (const message of messages.values()) {
            let config = require('../../assets/config.js');
            let prefix = config['config']['prefix'];

            log.print("message fetched", 1, message.content);

            if (message.content === (prefix + "game loot")) {
                msgLoots.push(message);
            }

            await message.delete();
        }
    } catch (error) {
        console.error(`Une erreur s'est produite : ${error}`);
    }

    return [msgLoots, channel];
}

function parseOfflineMessages(messages) {
    log.print("parsing offline messages to verify time", 1);
    let playersCopy = JSON.parse(JSON.stringify(gameData["joueurs"]));
    Object.entries(playersCopy).forEach(([key, player]) => {
        player["lootMessages"] = [];
        messages.forEach(message => {
            if (message.author.id === key) {
                player["lootMessages"].unshift(message.createdTimestamp);
            }
        });
    });
    return playersCopy
}

function sortInventory(player) {
    let inventoryCopy = JSON.parse(JSON.stringify(player["inv"]));

    let weaponSection = [];
    let ammoSection = [];
    let healSection = [];
    let protectionSection = [];
    let crateSection = [];

    inventoryCopy.forEach(item => {
        if (item["type"] === "weapon") weaponSection.push(item);
        else if (item["type"] === "ammo") ammoSection.push(item);
        else if (item["type"] === "med") healSection.push(item);
        else if (item["type"] === "protection") protectionSection.push(item);
        else if (item["type"] === "crate") crateSection.push(item);
    });
    weaponSection = sortSection(weaponSection);
    ammoSection = sortSection(ammoSection);
    healSection = sortSection(healSection);
    protectionSection = sortSection(protectionSection);
    crateSection = sortSection(crateSection);

    //let finalInv = mergeSections([weaponSection, ammoSection, healSection, protectionSection, crateSection]);
    return [weaponSection, ammoSection, healSection, protectionSection, crateSection];
}

function addWeightToSection(section) {
    section.forEach(item => {
        if (item["tier"] === "S") item["weight"] = 4;
        if (item["tier"] === "A") item["weight"] = 3;
        if (item["tier"] === "B") item["weight"] = 2;
        if (item["tier"] === "C") item["weight"] = 1;
    });

    return section;
}

function sortSection(section) {
    section = addWeightToSection(section);
    let sortedSection = section.sort((a, b) => b["weight"] - a["weight"]);
    sortedSection = removeWeightFromSection(sortedSection);
    return sortedSection;
}

function removeWeightFromSection(section) {
    section.forEach(item => {
        delete item.weight;
    });
    return section;
}

function sendMPMessage(discordId, msgEmbeds) {
    channel.guild.members.fetch(discordId)
        .then((res) => {
            res.user.send({embeds: msgEmbeds})
                .then(r => {
                    console.log("|-- PM successfully sent !");
                    log.print("PM successfully sent", 1);
                })
                .catch(err => {
                    console.error(err);
                });
        })
        .catch(err => {
            console.error(err);
        });
}

function buyItem(message) {
    log.print("tried to buy an item", message.author, message.content);
    let args = message.content.split(" ");
    let itemName = "";
    for (let i = 2; i < args.length; i++) itemName += args[i] + " ";
    itemName = itemName.slice(0, -1);

    let player = getPlayer(message);
    if (!player) return;

    let item = findItem(itemName);
    if (!item) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setColor("#ff0000");
        msgEmbed.setTitle("Erreur : item introuvable");
        msgEmbed.setDescription("L'item que vous avez utiliser est introuvable. Essayer de copier le nom de l'item directement depuis votre inventaire (commande : *game inv*)");
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game use help\""});

        message.channel.send({embeds: [msgEmbed]});
        log.print("error : item doesn't exist", 1);
        return;
    }

    if (item["type"] === "ammo") {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setColor("#ff0000");
        msgEmbed.setTitle("Erreur : impossible d'acheter une munition");
        msgEmbed.setDescription("Il est impossible d'acheter une munition. C'est comme ça c'est la vie");
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game use help\""});

        message.channel.send({embeds: [msgEmbed]});
        log.print("error : can't buy ammo", 1);
        return;
    }

    if (player["money"] - item["buyPrice"] < 0) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setColor("#ff0000");
        msgEmbed.setTitle("Erreur : vous être trop pauvre");
        msgEmbed.setDescription("Vous n'avez pas assez d'argent pour acheter cet objet. Pour voir toute la boutique utilisez la commande \"game shop\".");
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game use help\""});

        message.channel.send({embeds: [msgEmbed]});
        log.print("error : not enough money", 1);
        return;
    }

    player["money"] = player["money"] - item["buyPrice"];
    player["stats"]["bought_objects"]++;
    addItem(item, player);

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor(colors.get("buy"));
    msgEmbed.setTitle("Félicitations vous venez d'acheter : " + item["name"]);
    msgEmbed.setDescription("Bravo pour votre achat, j'espère que cet objet saura vous satisfaire au quotidien.");
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"game use help\""});

    message.channel.send({embeds: [msgEmbed]});
    log.print("sending success message", 1);
}

function shop(message) {
    let str = "**Boutique des objets avec leurs prix de vente et d'achat**\n";
    str += "**Rang S :**\n";
    str += "M4 Super 90 - Achat : 130 - Vente : 40\n";
    str += "SCAR-H - Achat : 135 - Vente : 40\n";
    str += "Rem 700 - Achat : 135 - Vente : 40\n";
    str += "RPG-7 - Achat : 240 - Vente 80\n";
    str += "NLAW - Achat : 200 - Vente : 60\n";
    str += "Mine antipersonnel - Achat : 180 - Vente : 60\n";
    str += "Medikit - Achat : 60 - Vente : 20\n";
    str += "Tenue de démineur - Achat : 90 - Vente : 30\n";
    str += "Gilet pare-balle - Achat : 80 - Vente : 25\n";
    str += "\n**Rang A : **\n";
    str += "Desert Eagle - Achat : 150 - Vente : 50\n";
    str += "357 Magnum - Achat : 150 - Vente : 50\n";
    str += "SKS - Achat : 70 - Vente : 20\n";
    str += "M32A1 - Achat : 150 - Vente : 50\n";
    str += "SV-98 - Achat : 105 - Vente : 30\n";
    str += "Cocktail molotov - Achat : 200 - Vente : 60\n";
    str += "Grenade flash - Achat : 100 - Vente : 30\n";
    str += "Seringue - Achat : 30 - Vente : 10\n";
    str += "Gilet tactique - Achat : 30 - Vente : 10\n";
    str += "\n**Rang B : **\n";
    str += "M4A1 - Achat : 75 - Vente : 20\n";
    str += "AK-47 - Achat : 60 - Vente : 20\n";
    str += "MPX - Achat : 60 - Vente : 20\n";
    str += "P90 - Achat : 60 - Vente : 20\n";
    str += "MP7 - Achat : 60 - Vente : 20\n";
    str += "Grenade explosive - Achat : 150 - Vente : 50\n";
    str += "C4 - Achat : 100 - Vente : 30\n";
    str += "Bombe - Achat : 135 - Vente : 40\n";
    str += "Kit de premier soin - Achat : 20 - Vente : 6\n";
    str += "Anti douleur - Achat : 15 - Vente : 5\n";
    str += "Bandage - Achat : 12 - Vente : 4\n";
    str += "Bouclier de chevalier - Achat : 20 - Vente : 6\n";
    str += "\n**Rang C : **\n";
    str += "Beretta 92 - Achat : 30 - Vente : 7\n";
    str += "Glock 18 - Achat : 20 - Vente : 5\n";
    str += "Colt 1911 - Achat : 25 - Vente : 6\n";
    str += "HK USP - Achat : 30 - Vente : 7\n";
    str += "Taser - Achat : 10 - Vente : 2\n";
    str += "MP5A2 - Achat : 20 - Vente : 5\n";
    str += "Pansement - Achat : 5 - Vente : 1\n";

    message.channel.send(str);
}

function execute(message) {
    channel = message.channel;
    let args = message.content.split(" ");
    if (args[1] === "loot") {
        lootCrate(message);
    } else if (args[1] === "inv") {
        printInventory(message);
    } else if (args[1] === "open") {
        openCrate(message);
    } else if (args[1] === "use") {
        useItem(message);
    } else if (args[1] === "detonate") {
        detonateC4(message);
    } else if (args[1] === "help") {
        help(message);
    } else if (args[1] === "notice") {
        notice(message);
    } else if (args[1] === "stats" || args[1] === "stat") {
        printStats(message);
    } else if (args[1] === "sell") {
        sellItem(message);
    } else if (args[1] === "buy") {
        buyItem(message);
    } else if (args[1] === "shop") {
        shop(message);
    } else if (args[1] === "test") {

    }
}

module.exports = {
    execute,
    loadOfflineLoots
}