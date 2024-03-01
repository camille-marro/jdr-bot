let fs = require('fs');
const path = require("path");

const log = require('../../assets/log');

const { EmbedBuilder } = require('discord.js');
const {useMasterPlayer} = require("discord-player");

let jdrData;

try {
    console.log("|-- Loading jdr data from jdr.json ...");
    const rawData = fs.readFileSync(path.resolve(__dirname, "../../json_files/jdr.json"));
    jdrData = JSON.parse(rawData);
} catch (err) {
    console.log("|-- no file named meme.json found");
    jdrData = false;
}

function getInfos(message) {
    log.print("tried to get info about a rpg character", message.author, message.content);
    if (!jdrData) {
        log.print("cancelling command : no data found, jdr.json doesn't exist", 1);
        console.log("|-- no data found for jdr, cancelling command");
        return;
    }

    let args = message.content.split(" ");
    if (args[2] === "help") {
        infoHelp(message);
        log.print("asked help for jdr info command", message.author, message.content);
        return;
    }
    let personnageToFind = "";
    for (let i = 2; i < args.length; i++) {
        personnageToFind += (args[i] + " ");
    }
    personnageToFind = personnageToFind.slice(0,-1); // supprimer le dernier " "

    let personnage = searchPersonnageByName(personnageToFind.toLowerCase(), message.author.id);

    let msgEmbed = new EmbedBuilder();
    if (!personnage) {
        console.log("|-- " + personnageToFind + " n'existe pas !");

        msgEmbed.setColor("#ff0000");
        msgEmbed.setTitle(personnageToFind + " n'existe pas !");
        msgEmbed.setDescription("Ce personnage n'existe pas. Vérifier son orthographe ou essayer un pseudo.");
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"jdr help\""});

        message.channel.send({embeds: [msgEmbed]});
        log.print("sending error message : this character doesn't exist !", 1);
        return;
    }

    msgEmbed = printPersonnage(personnage);
    message.channel.send({embeds: [msgEmbed]});
    log.print("info about the character has been printed", 1);
}

function printPersonnage(personnage) {
    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#dc8f52");
    msgEmbed.setTitle("Fiche perso de " + personnage["name"]);
    msgEmbed.setDescription(personnage["desc"]);
    if (personnage["pseudo"] !== "/") msgEmbed.addFields({name: "Pseudonyme", value: personnage["pseudo"]});
    msgEmbed.addFields({name: "Race", value: personnage["race"], inline: true});
    if (personnage.hasOwnProperty("age")) msgEmbed.addFields({name: "Age", value: personnage["age"] + " ans", inline: true});
    msgEmbed.addFields({name: "Sexe", value: personnage["sex"], inline: true});
    if (personnage.hasOwnProperty("job")) msgEmbed.addFields({name: "Métier", value: personnage["job"], inline: true});
    if (personnage.hasOwnProperty("magic")) msgEmbed.addFields({name: "Magie", value: personnage["magic"], inline: true});
    msgEmbed.setFooter({text: "Pour plus d'infos utiliser la commande \"jdr help\""});

    if (personnage.hasOwnProperty("pp")) msgEmbed.setThumbnail(personnage["pp"]);

    return msgEmbed;
}

function printFullPersonnage(personnage) {
    log.print("preparing message with detailed characters information", 1);
    let msgEmbed = printPersonnage(personnage);

    msgEmbed.addFields({name: "Compétences", value: " "});

    msgEmbed.addFields({name: "Intelligence", value: personnage["stats"]["Int"], inline: true});
    msgEmbed.addFields({name: "Force", value: personnage["stats"]["For"], inline: true});
    msgEmbed.addFields({name: " ", value: " "});

    msgEmbed.addFields({name: "Charisme", value: personnage["stats"]["Cha"], inline: true});
    msgEmbed.addFields({name: "Dextérité", value: personnage["stats"]["Dex"], inline: true});
    msgEmbed.addFields({name: " ", value: " "});

    msgEmbed.addFields({name: "Courir / Sauter", value: personnage["stats"]["CS"], inline: true});
    msgEmbed.addFields({name: "Mentir / Convaincre", value: personnage["stats"]["MC"], inline: true});
    msgEmbed.addFields({name: "Discrétion", value: personnage["stats"]["Dis"], inline: true});

    msgEmbed.addFields({name: "Intimidation", value: personnage["stats"]["Inti"], inline: true});
    msgEmbed.addFields({name: "Survie", value: personnage["stats"]["Sur"], inline: true});
    msgEmbed.addFields({name: "Perception", value: personnage["stats"]["Per"], inline: true});

    msgEmbed.addFields({name: "Soigner", value: personnage["stats"]["Soi"], inline: true});
    msgEmbed.addFields({name: "Combat rapproché", value: personnage["stats"]["CAC"], inline: true});
    msgEmbed.addFields({name: "Combat à distance", value: personnage["stats"]["CAD"], inline: true});

    msgEmbed.addFields({name: "Réflèxes", value: personnage["stats"]["Ref"]});

    msgEmbed.addFields({name: "Magie", value: personnage["stats"]["Mag"], inline: true});
    msgEmbed.addFields({name: personnage["talent"], value: personnage["stats"]["Tal"], inline: true});

    return msgEmbed;
}

function printInventory(personnage) {
    log.print("preparing the printing message for the inventory of the character", 1);
    let msgEmbed = new EmbedBuilder();

    msgEmbed.setColor("#dc8f52");
    msgEmbed.setTitle("Inventaire de " + personnage["name"]);
    msgEmbed.setDescription("Argent : " + personnage["money"].toString());

    personnage["inv"].forEach((objet) => {
        let nameField = objet["name"];
        if (objet.hasOwnProperty("size")) nameField += " (x" + objet["size"] + ")";
        let description = " ";
        if(!(objet["desc"] === "none" || objet["desc"] === "@TODO")) description = objet["desc"];
        msgEmbed.addFields({name: nameField, value: description});
    })

    msgEmbed.setFooter({text: "Pour plus d'infos utiliser la commande \"jdr help\""});
    return msgEmbed;
}

function searchPersonnageByName(personnageToFind, id) {
    log.print("searching character with his name", 1);
    // plus de 30% bon si plusieurs, il te sort celui qui a le plus
    let personnagesFound = [];

    jdrData["personnages"].forEach((personnage) => {
        if (!personnage["private"] || personnage["idDiscord"] === id || id === "198381114602160128") {
            let name = personnage["name"].toLowerCase();
            let pseudo = personnage["name"].toLowerCase();

            if (name.includes(personnageToFind)) {
                let percent = ((personnageToFind.length/name.length)*100).toFixed(2);
                console.log("|--- character found with " + percent + "% matching");
                log.print("character found with " + percent + "% matching", 1);
                if (percent >= 30) personnagesFound.push({"personnage" : personnage, "percent": percent });
            } else if (pseudo.includes(personnageToFind)) {
                let percent = ((personnageToFind.length/pseudo.length)*100).toFixed(2);
                console.log("|--- character found with " + percent + "% matching");
                log.print("character found with " + percent + "% matching", 1);
                if (percent >= 30) personnagesFound.push({"personnage" : personnage, "percent": percent });
            }
        }
    });

    if (personnagesFound.length === 0) {
        console.log("|--- character not found");
        log.print("error : character not found", 1);
        return false;
    }
    else if (personnagesFound.length === 1) {
        log.print("character returned", 1);
        return personnagesFound[0]["personnage"];
    }
    else {
        let basePercent = 0;
        let personnageToReturn;
        log.print("multiple characters found, selecting the one with the more matching letters", 1);
        personnagesFound.forEach((personnage) => {
            if (parseFloat(personnage["percent"]) > parseFloat(basePercent)) {
                basePercent = personnage["percent"];
                personnageToReturn = personnage["personnage"];
            }
        });
        log.print("character returned", 1);
        return personnageToReturn;
    }
}

function searchPersonnageByIdDiscord(id) {
    log.print("searching character with his ID", 1);
    let found = false;
    let personnageToReturn;
    jdrData["personnages"].forEach((personnage) => {
        if(personnage.hasOwnProperty("idDiscord") && !found) {
            if (personnage["idDiscord"] === id.toString()) {
                found = true;
                personnageToReturn = personnage;
            }
        }
    });

    if (personnageToReturn) {
        log.print("character found", 1);
        return personnageToReturn;
    }
    console.log("|--- character not found");
    log.print("error : character not found", 1);
    return false;
}

function getPersonalInfos(message) {
    log.print("tried to get info about his/her rpg character", message.author, message.content);
    let args = message.content.split(" ");
    if (args[2] === "help") {
        ficheHelp(message);
        log.print("asked help for jdr fiche command", message.author, message.content);
        return;
    }
    let id = message.author.id;

    let personnage = searchPersonnageByIdDiscord(id);

    let msgEmbed = new EmbedBuilder();
    if (!personnage) {
        msgEmbed.setColor("#ff0000");
        msgEmbed.setTitle("Aucun personnage trouvé pour vous ! ");
        msgEmbed.setDescription("Aucun personnage n'est associé à votre pseudo.");
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"jdr help\""});

        message.channel.send({embeds: [msgEmbed]});
        log.print("sending error message : no character linked to this person", 1);
        return;
    }

    msgEmbed = printFullPersonnage(personnage);
    message.author.send({embeds: [msgEmbed]});

    let msgEmbedSuccess = new EmbedBuilder();
    msgEmbedSuccess.setColor("#08ff00");
    msgEmbedSuccess.setTitle("Informations envoyés par message privé !");
    msgEmbedSuccess.setDescription("Les informations demandées ont été envoyée via message privé, si vous n'avez rien reçu vérifiez que vous avez autorisé les messages privés ou que le bot ne soit pas bloqué.");
    msgEmbedSuccess.setFooter({text: "Pour plus d'informations utiliser la commande \"jdr help\""});

    message.channel.send({embeds: [msgEmbedSuccess]});
    log.print("info about his/her character has been sent", 1);
}

function getInventory(message) {
    log.print("tried to get inventory of his/her rpg character", message.author, message.content);
    let args = message.content.split(" ");
    if (args[2] === "help") {
        invHelp(message);
        log.print("asked help for jdr inv command", message.author, message.content);
        return;
    }
    let id = message.author.id;

    let personnage = searchPersonnageByIdDiscord(id);

    let msgEmbed = new EmbedBuilder();
    if (!personnage) {
        msgEmbed.setColor("#ff0000");
        msgEmbed.setTitle("Aucun personnage trouvé pour vous ! ");
        msgEmbed.setDescription("Aucun personnage n'est associé à votre id.");
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"jdr help\""});

        message.channel.send({embeds: [msgEmbed]});
        log.print("sending message error : no character linked to this person", 1);
        return;
    }

    msgEmbed = printInventory(personnage);

    let msgEmbedSuccess = new EmbedBuilder();
    msgEmbedSuccess.setColor("#08ff00");
    msgEmbedSuccess.setTitle("Informations envoyés par message privé !");
    msgEmbedSuccess.setDescription("Les informations demandées ont été envoyée via message privé, si vous n'avez rien reçu vérifiez que vous avez autorisé les messages privés ou que le bot ne soit pas bloqué.");
    msgEmbedSuccess.setFooter({text: "Pour plus d'informations utiliser la commande \"jdr help\""});

    message.author.send({embeds: [msgEmbed]});
    message.channel.send({embeds: [msgEmbedSuccess]});
    log.print("inventory successfully printed", 1);
}

function createPerso(message) {
    console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") launch a new rpg character");
    log.print("tried to create an new rpg character", message.author, message.content);

    let args = message.content.split(" ");
    if(args[2] === "help") {
        createHelp(message);
        log.print("asked help for jdr create command", message.author, message.content);
        return;
    }

    let numbers = [];

    for (let i = 0; i < 16; i++) {
        let number = Math.floor(Math.random() * 100 + 1);
        numbers.push(number);
    }

    // rectify number
    // if 0-10 -> 10 | if 90-100 -> 90 | arrondi au 5
    for (let i = 0; i < numbers.length; i++) {
        if (numbers[i] <= 10) numbers[i] = 10
        else if (numbers[i]>=90) numbers[i] = 90
        else {
            numbers[i] = Math.round(numbers[i]/5) * 5;
        }
    }

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#bd48d2");
    msgEmbed.setTitle("JDR");
    msgEmbed.setDescription("Crée un personnage avec des statistiques aléatoires");

    msgEmbed.addFields({name: "Intelligence", value: numbers[0].toString(), inline: true});
    msgEmbed.addFields({name: "Force", value: numbers[1].toString(), inline: true});
    msgEmbed.addFields({name: "Charisme", value: numbers[2].toString(), inline: true});
    msgEmbed.addFields({name: "Dextérité", value: numbers[3].toString(), inline: true});
    msgEmbed.addFields({name: "Courir / Sauter", value: numbers[4].toString(), inline: true});
    msgEmbed.addFields({name: "Mentir / Convaincre", value: numbers[5].toString(), inline: true});
    msgEmbed.addFields({name: "Discrétion", value: numbers[6].toString()});
    msgEmbed.addFields({name: "Réflexes", value: numbers[7].toString()});
    msgEmbed.addFields({name: "Intimidation", value: numbers[8].toString()});
    msgEmbed.addFields({name: "Survie", value: numbers[9].toString()});
    msgEmbed.addFields({name: "Perception", value: numbers[10].toString()});
    msgEmbed.addFields({name: "Soigner", value: numbers[11].toString()});
    msgEmbed.addFields({name: "Combat rapproché", value: numbers[12].toString()});
    msgEmbed.addFields({name: "Combat à distance", value: numbers[13].toString()});
    msgEmbed.addFields({name: "Talent", value: numbers[14].toString()});
    msgEmbed.addFields({name: "Magie", value: numbers[15].toString()});

    message.channel.send({embeds: [msgEmbed]});
    log.print("character successfully created", 1);
}

function updateData() {
    fs.writeFileSync(path.resolve(__dirname, "../../json_files/jdr.json"), JSON.stringify(jdrData));
    console.log("|-- data successfully updated");
    log.print("jdrData has been successfully updated", 1);
}

function addInventory(message) {
    log.print("tried to add an item to his/her rpg character inventory", message.author, message.content);
    let id = message.author.id;
    let args = message.content.split(" ");
    if (args[2] === "help") {
        addHelp(message);
        log.print("asked help for jdr add command", message.author, message.content);
        return;
    }

    let personnage = searchPersonnageByIdDiscord(id);

    let msgEmbed = new EmbedBuilder();
    if (!personnage) {
        msgEmbed.setColor("#ff0000");
        msgEmbed.setTitle("Aucun personnage trouvé pour vous ! ");
        msgEmbed.setDescription("Aucun personnage n'est associé à votre id.");
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"jdr help\""});

        message.channel.send({embeds: [msgEmbed]});
        log.print("sending message error : no character linked to this person", 1);
        return;
    }


    let newItemRaw = "";
    for(let i = 2; i < args.length; i++) newItemRaw += args[i] + " ";
    newItemRaw = newItemRaw.slice(0,-1); // supprime le dernier " "
    let newItemFields = parseNewItem(newItemRaw);

    let newItem = {};
    if (newItem["name"] === "") newItem["name"] = "@TODO";
    else newItem["name"] = newItemFields[0];

    if (newItemFields[1]) {
        if (newItemFields[1] === "") newItem["desc"] = " ";
        else newItem["desc"] = newItemFields[1];
    } else {
        newItem["desc"] = "none";
    }

    if (newItemFields[2]) {
        if (newItemFields[2] === "") newItem["size"] = 1
        else {
            const regex = /[^0-9]+/;
            if (regex.test(newItemFields[2])) newItem["size"] = parseInt(newItemFields[2]);
            else newItem["size"] = 1;
        }
    } else {
        newItem["size"] = 1;
    }

    newItem["price"] = "@TODO";

    personnage["inv"].push(newItem);
    log.print("character inventory has been updated in local", 1);
    updateData();

    msgEmbed.setColor("#dc8f52");
    msgEmbed.setTitle("Inventaire actualisé");
    msgEmbed.setDescription("Pour voir si le changement est bien effectif vous pouvez utiliser la commande jdr inv");
    msgEmbed.setFooter({text: "Pour plus d'infos utiliser la commande \"jdr help\""});
    message.channel.send({embeds: [msgEmbed]});
    log.print("success message sent", 1);
}

function parseNewItem(itemRaw) {
    log.print("parsing item data to add", 1, itemRaw);
    let fields = itemRaw.split(";");
    let newFields = [];
    fields.forEach((field) => {
        if (field[0] === " ") {
            field = field.slice(1);
        }
        if (field[field.length-1] === " ") {
            field = field.slice(0,-1);
        }
        newFields.push(field);
    });

    return newFields;
}

function removeInventory(message) {
    log.print("tried to remove an item from his/her rpg character inventory", message.author, message.content);
    let args = message.content.split(" ");

    if(args[2] === "help") {
        removeHelp(message);
        log.print("asked help for jdr remove command", message.author, message.content);
        return;
    }

    let id = message.author.id;
    let personnage = searchPersonnageByIdDiscord(id);

    let msgEmbed = new EmbedBuilder();
    if (!personnage) {
        msgEmbed.setColor("#ff0000");
        msgEmbed.setTitle("Aucun personnage trouvé pour vous ! ");
        msgEmbed.setDescription("Aucun personnage n'est associé à votre id.");
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"jdr help\""});

        message.channel.send({embeds: [msgEmbed]});
        log.print("sending message error : no character linked to this person", 1);
        return;
    }

    let remove;
    let item = "";
    const regex = /\d+$/g;
    if (regex.test(args[2])) {
        for (let i = 3; i < args.length; i++) {
            item += args[i] + " ";
        }
        item = item.slice(0,-1);
        remove = removeXItems(parseInt(args[2]), item, personnage);
    } else {
        for (let i = 2; i < args.length; i++) {
            item += args[i] + " ";
        }
        item = item.slice(0,-1);
        remove = removeXItems(-1, item, personnage);
    }

    if (!remove) {
        msgEmbed.setColor("#ff0000");
        msgEmbed.setTitle("Erreur - objet non trouvé");
        msgEmbed.setDescription("Aucun objet portant le nom : \"" + item + "\" n'a été trouvé.\nSi vous pensez qu'il s'agit d'une erreur essayer la command jdr inv pour accéder à votre inventaire actuel.");
        msgEmbed.setFooter({text: "Pour plus d'infos utiliser la commande \"jdr help\""});
        message.channel.send({embeds: [msgEmbed]});

        log.print("error message sent", 1);
        return;
    }

    msgEmbed.setColor("#dc8f52");
    msgEmbed.setTitle("Inventaire actualisé");
    msgEmbed.setDescription("Pour voir si le changement est bien effectif vous pouvez utiliser la commande jdr inv");
    msgEmbed.setFooter({text: "Pour plus d'infos utiliser la commande \"jdr help\""});
    message.channel.send({embeds: [msgEmbed]});
    log.print("success message sent", 1);
}

function removeXItems(quantity, itemToFind, personnage) {
    log.print("looking for item to remove", 1);
    let items = personnage["inv"];
    let finalItems = [];
    let itemFound = false;

    if (quantity === -1) quantity = 250000;
    items.forEach((item) => {
        if (item["name"] === itemToFind) {
            itemFound = true;
            log.print("item found !", 1);
            if (quantity > 0) {
                item["size"] = item["size"] - quantity;
                // si la quantité est 0 ou moins, on supprime l'item
                if ((item["size"] > 0)) {
                    finalItems.push(item);
                    log.print("quantity is now lower", 1);
                } else {
                    log.print("quantity is now 0 or less, removing item", 1);
                }
            } else {
                log.print("removing item", 1);
            }
        } else {
            finalItems.push(item);
        }
    });
    if (!itemFound) {
        log.print("No item has been found", 1);
        return false;
    }
    personnage["inv"] = finalItems;
    log.print("character inventory has been updated in local", 1);
    updateData();
    return true;
}

function payer(message) {
    log.print("tried to pay with his/her rpg character", message.author, message.content);
    let args = message.content.split(" ");
    if (args[2] === "help") {
        payerHelp(message);
        log.print("asked help for jdr payer command", message.author, message.content);
        return;
    }
    let id = message.author.id;

    let personnage = searchPersonnageByIdDiscord(id);

    let msgEmbed = new EmbedBuilder();
    if (!personnage) {
        msgEmbed.setColor("#ff0000");
        msgEmbed.setTitle("Aucun personnage trouvé pour vous ! ");
        msgEmbed.setDescription("Aucun personnage n'est associé à votre id.");
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"jdr help\""});

        message.channel.send({embeds: [msgEmbed]});
        log.print("sending message error : no character linked to this person", 1);
        return;
    }

    const regex = /[^0-9]+/;
    if (!regex.test(args[2])) {
        if (parseInt(args[2]) > 0) {
            if (personnage['money'] - parseInt(args[2]) < 0) {
                msgEmbed.setColor("#ff0000");
                msgEmbed.setTitle("Erreur : somme trop grande détectée !");
                msgEmbed.setDescription("La somme saisie est incorrecte, vous ne pouvez pas avoir un nombre négatif de po")
                msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"jdr help\""});

                message.channel.send({embeds: [msgEmbed]});
                log.print("sending message error : incorrect data, can't have less than 0 po", 1, message.content);
            } else {
                personnage['money'] = personnage['money'] - args[2];
                msgEmbed.setColor("#dc8f52");
                msgEmbed.setTitle("Argent actualisé !");
                msgEmbed.addFields({name: "Votre argent", value: personnage['money'].toString()});

                msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"jdr help\""});

                message.channel.send({embeds: [msgEmbed]});
                log.print("money successfully updated", 1);
                updateData();
            }
        } else {
            msgEmbed.setColor("#ff0000");
            msgEmbed.setTitle("Erreur : somme négative détectée !");
            msgEmbed.setDescription("La somme saisie est incorrecte, veuillez saisir un somme supérieur à 0")
            msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"jdr help\""});

            message.channel.send({embeds: [msgEmbed]});
            log.print("sending message error : incorrect data, data must > 0", 1, message.content);
        }
    } else {
        msgEmbed.setColor("#ff0000");
        msgEmbed.setTitle("Erreur : pas de nombre détecté !");
        msgEmbed.setDescription("La somme saisie est incorrecte, veuillez saisir un nombre supérieur à 0")
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"jdr help\""});

        message.channel.send({embeds: [msgEmbed]});
        log.print("sending message error : incorrect data, data must be number", 1, message.content);
    }
}

function gagner(message) {
    log.print("tried to get money with his/her rpg character", message.author, message.content);
    let args = message.content.split(" ");
    if (args[2] === "help") {
        gagnerHelp(message);
        log.print("asked help for jdr gagner command", message.author, message.content);
        return;
    }
    let id = message.author.id;

    let personnage = searchPersonnageByIdDiscord(id);

    let msgEmbed = new EmbedBuilder();
    if (!personnage) {
        msgEmbed.setColor("#ff0000");
        msgEmbed.setTitle("Aucun personnage trouvé pour vous ! ");
        msgEmbed.setDescription("Aucun personnage n'est associé à votre id.");
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"jdr help\""});

        message.channel.send({embeds: [msgEmbed]});
        log.print("sending message error : no character linked to this person", 1);
        return;
    }

    const regex = /[^0-9]+/;
    if (!regex.test(args[2])) {
        if (parseInt(args[2]) > 0) {
            personnage['money'] = personnage['money'] + parseInt(args[2]);
            msgEmbed.setColor("#dc8f52");
            msgEmbed.setTitle("Argent actualisé !");
            msgEmbed.addFields({name: "Votre argent", value: personnage['money'].toString()});

            msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"jdr help\""});

            message.channel.send({embeds: [msgEmbed]});
            log.print("money successfully updated", 1);
            updateData();
        } else {
            msgEmbed.setColor("#ff0000");
            msgEmbed.setTitle("Erreur : somme négative détectée !");
            msgEmbed.setDescription("La somme saisie est incorrecte, veuillez saisir un somme supérieur à 0")
            msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"jdr help\""});

            message.channel.send({embeds: [msgEmbed]});
            log.print("sending message error : incorrect data, data must > 0", 1, message.content);
        }
    } else {
        msgEmbed.setColor("#ff0000");
        msgEmbed.setTitle("Erreur : pas de nombre détecté !");
        msgEmbed.setDescription("La somme saisie est incorrecte, veuillez saisir un nombre supérieur à 0")
        msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"jdr help\""});

        message.channel.send({embeds: [msgEmbed]});
        log.print("sending message error : incorrect data, data must be number", 1, message.content);
    }
}

function help(message) {
    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#6e0e91");
    msgEmbed.setTitle("JDR - HELP");
    msgEmbed.setDescription("Ces commandes sont utilisées pour consulter diverses informations à propos du JDR, elles n'ont aucune autre utilité.");
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"jdr [commande] help\""});

    msgEmbed.addFields({name: "Syntaxe de la commande", value: "jdr [commande]"});
    msgEmbed.addFields({name: "Paramètre", value: " ", inline: true});
    msgEmbed.addFields({name: "commande", value: "info / fiche / inv / add / remove / create / payer / gagner / ambiance / destin / roll", inline: true});
    msgEmbed.addFields({name: "Exemple de commande", value: "jdr inv"});

    message.channel.send({embeds: [msgEmbed]});
}

function infoHelp(message) {
    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#6e0e91");
    msgEmbed.setTitle("JDR - Info");
    msgEmbed.setDescription("Permet d'obtenir des informations sur un personnage grâce à son nom");
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"jdr help\""});
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "jdr info [nom]"});
    msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
    msgEmbed.addFields({name: "nom", value: "Nom du personnage à chercher", inline: true});
    msgEmbed.addFields({name: "Exemple de commande", value: "jdr info Tristan"});

    message.channel.send({embeds: [msgEmbed]});
    log.print("help message successfully sent", 1)
}

function ficheHelp(message) {
    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#6e0e91");
    msgEmbed.setTitle("JDR - Fiche");
    msgEmbed.setDescription("Permet de récupérer la fiche personnage de son personnage. La commande ne fonctionne que si un personnage est rattaché à son ID Discord.\n**Les informations seront envoyés par MP !**");
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"jdr help\""});
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "jdr fiche"});
    msgEmbed.addFields({name: "Exemple de commande", value: "jdr fiche"});

    message.channel.send({embeds: [msgEmbed]});
    log.print("help message successfully sent", 1);
}

function invHelp(message) {
    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#6e0e91");
    msgEmbed.setTitle("JDR - Inventaire");
    msgEmbed.setDescription("Permet d'afficher l'inventaire de son personnage.");
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"jdr help\""});
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "jdr inventaire"});
    msgEmbed.addFields({name: "Alias", value: " ", inline: true});
    msgEmbed.addFields({name: "inv", value: "Exemple : jdr inv", inline: true});
    msgEmbed.addFields({name: "Exemple de commande", value: "jdr inventaire"});

    message.channel.send({embeds: [msgEmbed]});
    log.print("help message successfully sent", 1)
}

function addHelp(message) {
    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#6e0e91");
    msgEmbed.setTitle("JDR - Add");
    msgEmbed.setDescription("Permet d'ajouter des objets dans l'inventaire de son personnage. Veillez à toujours remplir les deux premiers champs avec au moins un caractère (un espace ou /)");
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"jdr help\""});
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "jdr add [nom_objet];[description_objet];[quantité:optionnel]"});
    msgEmbed.addFields({name: "Paramètres", value: " "});
    msgEmbed.addFields({name: "nom_objet", value: "Le nom de l'objet a ajouter, il peut contenir des espaces", inline: true});
    msgEmbed.addFields({name: "description_objet", value: "La description de l'objet a ajouter, elle peut contenir des espaces", inline: true});
    msgEmbed.addFields({name: "quantite:optionnel", value: "La quantite d'objet a ajouter dans l'inventaire", inline: true});
    msgEmbed.addFields({name: "Exemple de commande", value: "jdr add épée de fou furieux;une épée de zinzin qui tabasse tout;1"});

    message.channel.send({embeds: [msgEmbed]});
    log.print("help message successfully sent", 1)
}

function removeHelp(message) {
    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#6e0e91");
    msgEmbed.setTitle("JDR - Remove");
    msgEmbed.setDescription("Permet de supprimer des objets de l'inventaire de son personnage. Si aucune quantité n'est indiquée, supprime directement l'objet ou le stock d'objet");
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"jdr help\""});
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "jdr remove [quantite:optionnel] [nom_objet]"});
    msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
    msgEmbed.addFields({name: "quantite:optionnel", value: "quantité d'objet à supprimer du stock", inline: true});
    msgEmbed.addFields({name: "nom_objet", value: "Nom de l'objet à supprimer", inline: true});
    msgEmbed.addFields({name: "Alias", value: " ", inline: true});
    msgEmbed.addFields({name: "remove", value: "delete / del", inline: true});
    msgEmbed.addFields({name: "Exemples de commande", value: " "});
    msgEmbed.addFields({name: "jdr remove épée de fou furieux", value: "supprimer s'il existe l'objet appelé \"épée de fou furieux\" de l'inventaire", inline: true});
    msgEmbed.addFields({name: "jdr remove 5 flèches", value: "Supprimera 5 flèches du stock de l'objet \"flèches\" s'il existe. \nSi le stock devient inférieur ou égale à 0 alors l'objet sera supprimé", inline: true});

    message.channel.send({embeds: [msgEmbed]});
    log.print("help message successfully sent", 1);
}

function createHelp(message) {
    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#6e0e91");
    msgEmbed.setTitle("JDR - Create");
    msgEmbed.setDescription("Permet de créer un personnage pour le jdr avec des statistiques aléatoires dans toutes ses compétences");
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"jdr help\""});
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "jdr create"});
    msgEmbed.addFields({name: "Exemples de commande", value: "jdr create"});

    message.channel.send({embeds: [msgEmbed]});
    log.print("help message successfully sent", 1)
}

function payerHelp(message) {
    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#6e0e91");
    msgEmbed.setTitle("JDR - Payer");
    msgEmbed.setDescription("Permet de retirer de l'argent du porte monnaie de son personnage");
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"jdr help\""});
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "jdr payer [quantite]"});
    msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
    msgEmbed.addFields({name: "quantite", value: "quantité de pièce à retirer", inline: true});
    msgEmbed.addFields({name: " ", value: " "});
    msgEmbed.addFields({name: "Alias", value: " ", inline: true});
    msgEmbed.addFields({name: "payer", value: "paye / pay", inline: true});
    msgEmbed.addFields({name: "Exemples de commande", value: " "});
    msgEmbed.addFields({name: "jdr payer 20", value: "Retire 20 pièces d'or du porte monnaie de son personnage"});

    message.channel.send({embeds: [msgEmbed]});
    log.print("help message successfully sent", 1);
}

function gagnerHelp(message) {
    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#6e0e91");
    msgEmbed.setTitle("JDR - Gagner");
    msgEmbed.setDescription("Permet d'ajouter' de l'argent au porte monnaie de son personnage");
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"jdr help\""});
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "jdr gagner [quantite]"});
    msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
    msgEmbed.addFields({name: "quantite", value: "quantité de pièce à ajouter", inline: true});
    msgEmbed.addFields({name: " ", value: " "});
    msgEmbed.addFields({name: "Alias", value: " ", inline: true});
    msgEmbed.addFields({name: "gagner", value: "gagne / win / collect", inline: true});
    msgEmbed.addFields({name: "Exemple de commande", value: " "});
    msgEmbed.addFields({name: "jdr gagner 20", value: "Ajoute 20 pièces d'or au porte monnaie de son personnage"});

    message.channel.send({embeds: [msgEmbed]});
    log.print("help message successfully sent", 1);
}

async function ambiance(message) {
    log.print("tried to play an ambiance music", message.author, message.content);
    let args = message.content.split(" ");
    if (args[2] === "help") {
        ambianceHelp(message);
        log.print("asked help for jdr ambiance command", message.author, message.content);
        return;
    }

    let url;
    let id;
    switch (args[2]) {
        case "bars":
            id = Math.floor(Math.random() * jdrData['ambiances']['bars'].length);
            url = jdrData['ambiances']['bars'][id];
            break;

        case "villes":
            id = Math.floor(Math.random() * jdrData['ambiances']['villes'].length);
            url = jdrData['ambiances']['villes'][id];
            break;

        case "exploration":
            id = Math.floor(Math.random() * jdrData['ambiances']['exploration'].length);
            url = jdrData['ambiances']['exploration'][id];
            break;

        case "combat":
            id = Math.floor(Math.random() * jdrData['ambiances']['combat'].length);
            url = jdrData['bars'][id];
            break;

        default:
            id = Math.floor(Math.random() * jdrData['ambiances']['start'].length);
            url = jdrData['ambiances']['start'][id];
            break;
    }

    const player = useMasterPlayer();
    await player.extractors.loadDefault();

    url = await player.search(url);
    await player.play(message.member.voice.channel, url, {leaveOnEmpty: true});

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#23bb95");
    msgEmbed.setTitle("Son d'ambiance lancé");
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"jdr help\""})
}

function ambianceHelp(message) {
    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#6e0e91");
    msgEmbed.setTitle("JDR - Ambiance");
    msgEmbed.setDescription("Permet de jouer des sons d'ambiance");
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"jdr help\""});
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "jdr ambiance [type:optionnel]"});
    msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
    msgEmbed.addFields({name: "type:optionnel", value: "type d'ambiance à jouer dans la liste suivante : [start, bars, villes, exploration, combat]", inline: true});
    msgEmbed.addFields({name: " ", value: " "});
    msgEmbed.addFields({name: "Alias", value: " ", inline: true});
    msgEmbed.addFields({name: "ambiance", value: "play", inline: true});
    msgEmbed.addFields({name: "Exemples de commande", value: " "});
    msgEmbed.addFields({name: "jdr ambiance exploration", value: "Joue un son d'ambiance pour l'exploration"});

    message.channel.send({embeds: [msgEmbed]});
    log.print("help message successfully sent", 1);
}

function admin(message) {
    log.print("tried to use jdr admin command", message.author, message.content);
    // fonction pour administrer doit être faite par moi uniquement
    if (message.author.id !== "198381114602160128") {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setColor("#ff0000");
        msgEmbed.setTitle("Erreur : permissions insuffisantes");
        msgEmbed.setDescription("Vous n'avez pas les permissions requises pour utiliser cette commande");
        msgEmbed.setFooter({text: "Si vous pensez qu'il s'agit d'une erreur contactez l'administrateur du serveur."});
        message.channel.send({embeds: [msgEmbed]});
        log.print("Error : not enough permissions to use this command", 1);
        return;
    }

    let args = message.content.split(" ");
    if (args[2] === "perso") {
        log.print("wants to manage the character collection", message.author);
        managePersonnage(message);
    }
}

function managePersonnage(message) {
    let args = message.content.split(" ");
    if (args[3] === "help") {
        let msgEmbed = managePersonnageHelp();
        message.channel.send({embeds: [msgEmbed]});
        log.print("help message successfully sent", 1);
    } else if (args[3] === "add") {
        let msgEmbed = addPersonnage(message);
        message.channel.send({embeds: [msgEmbed]});
        log.print("result message successfully sent", 1);
    } else if (args[3] === "remove") {
        let msgEmbed = removePersonnage(message);
        message.channel.send({embeds: [msgEmbed]});
        log.print("result message successfully sent", 1);
    } else if (args[3] === "modify") {
        let msgEmbed = modifyPersonnage(message);
        message.channel.send({embeds: [msgEmbed]});
        log.print("help message successfully sent", 1);
    }
}

function modifyPersonnage(message) {
    let args = message.content.split(" ");
    if (args[4] === "help") {
        log.print("sending help message", 1);
        return modifyPersonnageHelp();
    }

    let commandArgs = message.content.split(";");
    let nameParsing = commandArgs[0].split(" ");
    let name = nameParsing.slice(4).join(" ");

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"jdr admin perso modify help\""});


    let personnageToModify = searchPersonnageByName(name.toLowerCase(), message.author.id);
    if (!personnageToModify) {
        console.log("|-- " + name + " n'existe pas !");

        msgEmbed.setColor("#ff0000");
        msgEmbed.setTitle(name + " n'existe pas !");
        msgEmbed.setDescription("Ce personnage n'existe pas. Vérifier son orthographe ou essayer un pseudo.");

        log.print("error : this character doesn't exist !", 1);
        return msgEmbed;
    }


    switch (commandArgs[1]) {
        case "name":
            msgEmbed.setColor("#08ff00");
            msgEmbed.setTitle("Nom modifié avec succès !");
            msgEmbed.setDescription("Le nom de " + personnageToModify["name"] + " a été modifié avec succès par : " + commandArgs[2]);

            personnageToModify['name'] = commandArgs[2];
            log.print("modifying name of the character", 1);

            updateData();
            break;
        case "private":
            msgEmbed.setColor("#08ff00");
            msgEmbed.setTitle("Statut modifié avec succès !");
            msgEmbed.setDescription("Le statut de " + personnageToModify["name"] + " a été modifié par : " + commandArgs[2]);

            personnageToModify['private'] = commandArgs[2] === "true";

            log.print("modifying private status of the character", 1);
            updateData();
            break;
        case "pseudo":
            msgEmbed.setColor("#08ff00");
            msgEmbed.setTitle("Pseudo modifié avec succès !");
            msgEmbed.setDescription("Le pseudo de " + personnageToModify["name"] + " a été modifié avec succès par : " + commandArgs[2]);

            personnageToModify['pseudo'] = commandArgs[2];
            log.print("modifying pseudo of the character", 1);

            updateData();
            break;
        case "desc":
            msgEmbed.setColor("#08ff00");
            msgEmbed.setTitle("Description modifiée avec succès !");
            msgEmbed.setDescription("La description de " + personnageToModify["name"] + " a été modifiée avec succès par : " + commandArgs[2]);

            personnageToModify['desc'] = commandArgs[2];
            log.print("modifying description of the character", 1);

            updateData();
            break;
        case "race":
            msgEmbed.setColor("#08ff00");
            msgEmbed.setTitle("Race modifiée avec succès !");
            msgEmbed.setDescription("La race de " + personnageToModify["name"] + " a été modifiée avec succès par : " + commandArgs[2]);

            personnageToModify['race'] = commandArgs[2];
            log.print("modifying race of the character", 1);

            updateData();
            break;
        case "job":
            msgEmbed.setColor("#08ff00");
            msgEmbed.setTitle("Métier modifié avec succès !");
            msgEmbed.setDescription("Le métier de " + personnageToModify["name"] + " a été modifié avec succès par : " + commandArgs[2]);

            personnageToModify['job'] = commandArgs[2];
            log.print("modifying job of the character", 1);

            updateData();
            break;
        case "sex":
            msgEmbed.setColor("#08ff00");
            msgEmbed.setTitle("Sexe modifié avec succès !");
            msgEmbed.setDescription("Le sexe de " + personnageToModify["name"] + " a été modifié avec succès par : " + commandArgs[2]);

            personnageToModify['sex'] = commandArgs[2];
            log.print("modifying sex of the character", 1);

            updateData();
            break;
        case "pp":
            msgEmbed.setColor("#08ff00");
            msgEmbed.setTitle("Photo de profil modifié avec succès !");
            msgEmbed.setDescription("La photo de profil de " + personnageToModify["name"] + " a été modifié avec succès par : " + commandArgs[2]);

            personnageToModify['pp'] = commandArgs[2];
            log.print("modifying pp of the character", 1);

            updateData();
            break;
        default:
            msgEmbed.setColor("#ff0000");
            msgEmbed.setTitle("Erreur : catégorie invalide !");
            msgEmbed.setDescription("La catégorie indiquée n'existe pas : " + commandArgs[1] + ", les catégories valides sont : name, private, pseudo, desc, race, job, sex, pp");
            break;
    }

    return msgEmbed;
}

function modifyPersonnageHelp() {
    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#6e0e91");
    msgEmbed.setTitle("JDR - Administration - Personnage - Modify");
    msgEmbed.setDescription("Permet de modifier un personnage de la collection de personnages du jdr");
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"jdr admin help\""});
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "jdr admin perso modify [name];[cat];[value]"});
    msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
    msgEmbed.addFields({name: "name", value: "nom du personnage à modifier", inline: true});
    msgEmbed.addFields({name: "cat", value: "catégorie à modifier : name, private, pseudo, desc, race, job, sex, pp", inline: true});
    msgEmbed.addFields({name: "value", value: "modification à faire", inline: true});
    msgEmbed.addFields({name: " ", value: " "});
    msgEmbed.addFields({name: "Exemple de commande", value: " "});
    msgEmbed.addFields({name: "jdr admin perso modify Edward;private;false", value: "Modifie la valeur de private à false pour le personnage Edward"});

    return msgEmbed;
}

function removePersonnage(message) {
    let args = message.content.split(" ");
    if (args[4] === "help") {
        log.print("sending help message", 1);
        return removePersonnageHelp();
    }

    let personnageToFind = "";
    for (let i = 4; i < args.length; i++) {
        personnageToFind += (args[i] + " ");
    }
    personnageToFind = personnageToFind.slice(0,-1); // supprimer le dernier " "

    let personnageToRemove = searchPersonnageByName(personnageToFind.toLowerCase(), message.author.id);

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"jdr admin perso remove help\""});

    if (!personnageToRemove) {
        console.log("|-- " + personnageToFind + " n'existe pas !");

        msgEmbed.setColor("#ff0000");
        msgEmbed.setTitle(personnageToFind + " n'existe pas !");
        msgEmbed.setDescription("Ce personnage n'existe pas. Vérifier son orthographe ou essayer un pseudo.");

        log.print("error : this character doesn't exist !", 1);
        return msgEmbed;
    }

    jdrData["personnages"] = jdrData["personnages"].filter(personnage => personnage.name !== personnageToRemove.name);

    updateData();


    msgEmbed.setColor("#ff0000");
    msgEmbed.setTitle("Personnage supprimé avec succès !");
    msgEmbed.setDescription("Le personnage appelé " + personnageToRemove["name"] + " a été supprimé avec succès.");

    return msgEmbed;
}

function removePersonnageHelp() {
    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#6e0e91");
    msgEmbed.setTitle("JDR - Administration - Personnage - Remove");
    msgEmbed.setDescription("Permet de supprimer un personnage de la collection de personnages du jdr");
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"jdr admin help\""});
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "jdr admin perso remove [name]"});
    msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
    msgEmbed.addFields({name: "name", value: "nom du personnage", inline: true});
    msgEmbed.addFields({name: " ", value: " "});
    msgEmbed.addFields({name: "Exemple de commande", value: " "});
    msgEmbed.addFields({name: "jdr admin perso remove Edward", value: "Supprime le personnage appelé Edward de la collection."});

    return msgEmbed;
}

function addPersonnage(message) {
    let args = message.content.split(" ");
    if (args[4] === "help") {
        log.print("sending help message", 1);
        return addPersonnageHelp();
    }
    let parsedPersonnage = parsePersonnage(message);
    console.log(parsedPersonnage);
    jdrData["personnages"].push(parsedPersonnage);


    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#08ff00");
    msgEmbed.setTitle("Personnage créé avec succès !");
    msgEmbed.setDescription("Votre personnage a été créé avec succès, utilisez la commande jdr info [nom_du_personnage] pour plus d'informations.");
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"jdr admin add help\""});

    log.print("character successfully created !", 1);

    updateData();
    return msgEmbed;
}

function parsePersonnage(message) {
    let args = message.content.split(";");
    let nameParsing = args[0].split(" ");
    let name = nameParsing.slice(4).join(" ");

    let pseudo = args[1];
    let desc = args[2];
    let race = args[3];
    let job = args[4];
    let sex = args[5];
    let pp = args[6];
    let isPrivate = args[7];

    if (name === "" || name === " " || name === undefined) name = "/";
    if (pseudo === "" || pseudo === " " || pseudo === undefined) pseudo = "/";
    if (desc === "" || desc === " " || desc === undefined) desc = "/";
    if (race === "" || race === " " || race === undefined) race = "/";
    if (job === "" || job === " " || job === undefined) job = "/";
    if (sex === "" || sex === " " || sex === undefined) sex = "/";
    isPrivate = isPrivate !== "false";

    let personnage = {
        "name": name,
        "pseudo": pseudo,
        "desc": desc,
        "race": race,
        "job": job,
        "sex": sex,
        "private": isPrivate
    };
    if (pp !== "" && pp !== " " && pp !== undefined) personnage["pp"] = pp;

    return personnage;
}

function addPersonnageHelp() {
    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#6e0e91");
    msgEmbed.setTitle("JDR - Administration - Personnage - Add");
    msgEmbed.setDescription("Permet d'ajouter un personnage à la collection de personnage du jdr");
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"jdr admin help\""});
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "jdr admin perso add [name];[pseudo];[desc];[race];[job];[sex];[pp];[private]"});
    msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
    msgEmbed.addFields({name: "name", value: "nom du personnage", inline: true});
    msgEmbed.addFields({name: "pseudo", value: "psuedo du personnage, par défault : \"/\"", inline: true});
    msgEmbed.addFields({name: "desc", value: "description du personnage", inline: true});
    msgEmbed.addFields({name: "race", value: "race du personnage", inline: true});
    msgEmbed.addFields({name: "job", value: "métier du personnage", inline: true});
    msgEmbed.addFields({name: "sex", value: "sexe du personnage", inline: true});
    msgEmbed.addFields({name: "pp", value: "lien de la photo du personnage, par default : none", inline: true});
    msgEmbed.addFields({name: "private", value: "définit si le personnage est visible pour tout le monde, par défault : true", inline: true});
    msgEmbed.addFields({name: " ", value: " "});
    msgEmbed.addFields({name: "Exemple de commande", value: " "});
    msgEmbed.addFields({name: "jdr admin perso add Edward;;Edward est un collectionneur ...;Humain;Collectionneur d'artéfact;H;lienpp;false", value: "Crée un personnage appelé Edward avec sa description sa race son métier son sexe et une photo de profil, son pseudo sera / donc aucun et il sera visible par tout le monde."});

    return msgEmbed;
}

function managePersonnageHelp() {
    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#6e0e91");
    msgEmbed.setTitle("JDR - Administration - Personnage");
    msgEmbed.setDescription("Permet de gérer la collection de personnage du jdr");
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"jdr admin help\""});
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "jdr admin perso [command]"});
    msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
    msgEmbed.addFields({name: "command", value: "commande a effectuer : [add, remove, modify]", inline: true});
    msgEmbed.addFields({name: " ", value: " "});
    msgEmbed.addFields({name: "Exemple de commande", value: " "});
    msgEmbed.addFields({name: "jdr admin perso add [options]", value: "Commande pour créer un nouveau personnage dans la collection"});

    return msgEmbed;
}

function planify(message) {
    log.print("tried to planify next jdr session", message.author, message.content);
    let date = new Date();

    let args = message.content.split(" ");

    if (date.getDay() === 1) date.setDate(date.getDate() + 1);
    while(date.getDay() !== 1) {
        date.setDate(date.getDate() + 1);
        if (date.getDate() === 1) date.setMonth(date.getMonth() + 1);
    }

    console.log(date);
    console.log(date.getMonth())

    if (args[2]) { // ajoute x semaine
        date.setDate(date.getDate() + (args[2]*7));
    }

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setTitle("Vote pour la prochaine session de jeu");
    msgEmbed.setColor("#3c9636");

    let desc = "<@&770386606146060371> - Comme d'hab ptite réaction pour quand vous êtes dispo : \n\n";
    desc += ":one: Lundi " + date.getDate() + "/" + (date.getMonth()+1) + "\n";
    date.setDate(date.getDate() + 1);
    desc += ":two: Mardi " + date.getDate() + "/" + (date.getMonth()+1) + "\n";
    date.setDate(date.getDate() + 1);
    desc += ":three: Mercredi " + date.getDate() + "/" + (date.getMonth()+1) + "\n";
    date.setDate(date.getDate() + 1);
    desc += ":four: Jeudi " + date.getDate() + "/" + (date.getMonth()+1) + "\n";
    date.setDate(date.getDate() + 1);
    desc += ":five: Vendredi " + date.getDate() + "/" + (date.getMonth()+1) + "\n";
    desc += ":x: Si vous êtes pas dispo cette semaine";
    //date.setDate(date.getDate() + 1);
    log.print("sending message", 1);
    msgEmbed.setDescription(desc);

    message.channel.send({embeds: [msgEmbed]})
    .then(embedMessage => {
        log.print("successfully sent message ! Reacting to the message",1);
        embedMessage.react('1️⃣');
        embedMessage.react('2️⃣');
        embedMessage.react('3️⃣');
        embedMessage.react('4️⃣');
        embedMessage.react('5️⃣');
        embedMessage.react('❌');
    });

    log.print("successfully reacted to the messsage !", 1);
}

function destin(message) {
    log.print("tried to draw a faith number", message.author, message.content);
    let args = message.content.split(" ");
    if (args[2] === "help") {
        log.print("asked for help for faith command", message.author, message.content);
        destinHelp(message);
        return;
    }
    let msgEmbed = new EmbedBuilder();

    let destin = Math.floor((Math.random() * 4) + 1);
    msgEmbed.setTitle("Votre destin pour cette séance : " + destin);
    msgEmbed.setDescription("Les jets de destin servent à relancer un ou plusieurs de vos lancés sauf en cas de succès ou échec critique.");
    msgEmbed.setColor("#ffcd2a");

    message.channel.send({embeds: [msgEmbed]});
    log.print("sending successful message");
}

function destinHelp(message) {
    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#6e0e91");
    msgEmbed.setTitle("JDR - Destin");
    msgEmbed.setDescription("Permet de connaître son destin pour une séance");
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"jdr help\""});
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "jdr destin"});
    msgEmbed.addFields({name: "Exemple de commande", value: "jdr destin"});

    message.channel.send({embeds: [msgEmbed]});
    log.print("help message successfully sent", 1)
}

function roll(message) {
    log.print("tried to roll a dice 100", message.author, message.content);
    let args = message.content.split(" ");
    if (args[2] === "help") {
        log.print("asked help for roll command", message.author, message.content);
        rollHelp(message);
        return;
    }

    let msgEmbed = new EmbedBuilder();

    let nb = Math.floor((Math.random() * 100) + 1);
    msgEmbed.setTitle("Votre jet : " + nb);
    msgEmbed.setDescription("Pour avoir plus d'options dans vos jetés de dés utilisez la commande *jdr roll*");

    if (nb > 90) msgEmbed.setColor("#ff0000");
    else if (nb < 10) msgEmbed.setColor("#ffcd2a");
    else msgEmbed.setColor("#35cc1b");

    message.channel.send({embeds: [msgEmbed]});
    log.print("sending successful message");
}

function rollHelp(message) {
    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#6e0e91");
    msgEmbed.setTitle("JDR - Roll");
    msgEmbed.setDescription("Permet de lancer 1 dé à 100 faces");
    msgEmbed.setFooter({text: "Pour plus d'informations utiliser la commande \"jdr help\""});
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "jdr roll"});
    msgEmbed.addFields({name: "Exemple de commande", value: "jdr roll"});

    message.channel.send({embeds: [msgEmbed]});
    log.print("help message successfully sent", 1);
}

function execute(message) {
    let args = message.content.split(" ");
    if (args[1] === "create") {
        createPerso(message);
    } else if (args[1] === "info") {
        getInfos(message);
    } else if (args[1] === "fiche") {
        getPersonalInfos(message);
    } else if (args[1] === "inv" || args[1] === "inventaire") {
        getInventory(message);
    } else if (args[1] === "add") {
        addInventory(message);
    } else if (args[1] === "remove" || args[1] === "delete" || args[1] === "del") {
        removeInventory(message);
    } else if (args[1] === "help") {
        help(message);
    } else if (args[1] === "paye" || args[1] === "payer" || args[1] === "pay") {
        payer(message);
    } else if (args[1] === "gagne" || args[1] === "gagner" || args[1] === "win" || args[1] === "collect") {
        gagner(message);
    } else if (args[1] === "ambiance" || args[1] === "play") {
        ambiance(message).then(() => "");
    } else if (args[1] === "admin") {
        admin(message);
    } else if (args[1] === "plan" || args[1] === "planify") {
        planify(message);
    } else if (args[1] === "destin") {
        destin(message);
    } else if (args[1] === "roll") {
        roll(message);
    }
}

module.exports = {
    execute
}