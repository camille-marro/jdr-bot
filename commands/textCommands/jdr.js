let fs = require('fs');
const path = require("path");

const log = require('../../assets/log');

const { EmbedBuilder } = require('discord.js');

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
    msgEmbed.addFields({name: "Age", value: personnage["age"] + " ans", inline: true});
    msgEmbed.addFields({name: "Sexe", value: personnage["sex"], inline: true});
    msgEmbed.addFields({name: "Métier", value: personnage["job"], inline: true});
    msgEmbed.addFields({name: "Magie", value: personnage["magic"], inline: true});
    msgEmbed.setFooter({text: "Pour plus d'infos utiliser la commande \"jdr help\""});

    return msgEmbed;
}

function printFullPersonnage(personnage) {
    log.print("preparing message with detailed characters information", 1);
    let msgEmbed = printPersonnage(personnage);

    msgEmbed.addFields({name: "\u200B", value: "\u200B"});
    msgEmbed.addFields({name: "Compétences", value: " "});

    msgEmbed.addFields({name: "Intelligence", value: personnage["stats"]["Int"], inline: true});
    msgEmbed.addFields({name: "Force", value: personnage["stats"]["For"], inline: true});
    msgEmbed.addFields({name: " ", value: " "});

    msgEmbed.addFields({name: "Charisme", value: personnage["stats"]["Cha"], inline: true});
    msgEmbed.addFields({name: "Dextérité", value: personnage["stats"]["Dex"], inline: true});
    msgEmbed.addFields({name: " ", value: " "});

    msgEmbed.addFields({name: "Courir / Sauter", value: personnage["stats"]["CS"], inline: true});
    msgEmbed.addFields({name: "Mentir / Convaicnre", value: personnage["stats"]["MC"], inline: true});
    msgEmbed.addFields({name: "Discrétion", value: personnage["stats"]["Dis"], inline: true});

    msgEmbed.addFields({name: "Intimidation", value: personnage["stats"]["Inti"], inline: true});
    msgEmbed.addFields({name: "Survie", value: personnage["stats"]["Sur"], inline: true});
    msgEmbed.addFields({name: "Perception", value: personnage["stats"]["Per"], inline: true});

    msgEmbed.addFields({name: "Soigner", value: personnage["stats"]["Soi"], inline: true});
    msgEmbed.addFields({name: "Combat rapproché", value: personnage["stats"]["CAC"], inline: true});
    msgEmbed.addFields({name: "Combat à distance", value: personnage["stats"]["CAD"], inline: true});

    msgEmbed.addFields({name: "Magie", value: personnage["stats"]["Mag"], inline: true});
    msgEmbed.addFields({name: "Talent", value: personnage["stats"]["Tal"], inline: true});

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
        msgEmbed.addFields({name: nameField, value: objet["desc"]});
    })

    msgEmbed.setFooter({text: "Pour plus d'infos utiliser la commande \"jdr help\""});
    return msgEmbed;
}

function searchPersonnageByName(personnageToFind, id) {
    log.print("searching character with his name", 1);
    // plus de 30% bon si plusieurs il te sort celui qui a le plus
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
            if (personnage["percent"] > basePercent) {
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
                console.log("|--- character found !");
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
    message.channel.send({embeds: [msgEmbed]});
    log.print("info about his/her character has been printed", 1);
}

function getInventory(message) {
    log.print("tried to get inventory of his/her rpg character", message.author, message.content);
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
    message.channel.send({embeds: [msgEmbed]});
    log.print("inventory successfully printed", 1);
}

function createPerso(message) {
    console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") launch a new rpg character");
    log.print("tried to create an new rpg character", message.author, message.content);

    let numbers = [];

    for (let i = 0; i < 16; i++) {
        let number = Math.floor(Math.random() * 100 + 1);
        numbers.push(number);
    }

    console.log("|-- raw stats are : ");
    console.log("|-- " + numbers.toString())

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

    console.log("|-- rectify stats are : ");
    console.log("|-- " + numbers.toString())

    let int = "Intelligence : " + numbers[0] + "\n";
    msgEmbed.addFields({name: "Intelligence", value: numbers[0].toString(), inline: true});
    let force = "Force : " + numbers[1] + "\n";
    msgEmbed.addFields({name: "Force", value: numbers[1].toString(), inline: true});
    let cha = "Charisme : " + numbers[2] + "\n";
    msgEmbed.addFields({name: "Charisme", value: numbers[2].toString(), inline: true});
    let dex = "Dextérité : " + numbers[3] + "\n\n";
    msgEmbed.addFields({name: "Dextérité", value: numbers[3].toString(), inline: true});
    let coursaut = "Courir, sauter : " + numbers[4] + "\n";
    msgEmbed.addFields({name: "Courir / Sauter", value: numbers[4].toString(), inline: true});
    let mentir = "Mentir, convaincre : " + numbers[5]+ "\n";
    msgEmbed.addFields({name: "Mentir / Convaincre", value: numbers[5].toString(), inline: true});
    let disc = "Discrétion : " + numbers[6]+ "\n";
    msgEmbed.addFields({name: "Discrétion", value: numbers[6].toString()});
    let refl = "Réflexes : " + numbers[7]+ "\n";
    msgEmbed.addFields({name: "Réflexes", value: numbers[7].toString()});
    let inti = "Intimidation : " + numbers[8]+ "\n";
    msgEmbed.addFields({name: "Intimidation", value: numbers[8].toString()});
    let surv = "Survie : " + numbers[9]+ "\n";
    msgEmbed.addFields({name: "Survie", value: numbers[9].toString()});
    let perc = "Perception : " + numbers[10] + "\n";
    msgEmbed.addFields({name: "Perception", value: numbers[10].toString()});
    let soin = "Soigner : " + numbers[11] + "\n";
    msgEmbed.addFields({name: "Soigner", value: numbers[11].toString()});
    let cmbr = "Combat rapproché : " + numbers[12] + "\n";
    msgEmbed.addFields({name: "Combat rapproché", value: numbers[12].toString()});
    let cmbd = "Combat à distance : " + numbers[13] + "\n";
    msgEmbed.addFields({name: "Combat à distance", value: numbers[13].toString()});
    let talent = "Talent : " + numbers[14] + "\n\n";
    msgEmbed.addFields({name: "Talent", value: numbers[14].toString()});
    let magie = "Magie : " + numbers[15] + "\n\n";
    msgEmbed.addFields({name: "Magie", value: numbers[15].toString()});

    //let msg = "Perso tiré : \n" + int + force + cha + dex + coursaut + mentir + disc + refl + inti + surv + perc + soin + cmbr + cmbd + talent + magie + "Bonne chance :)"
    //message.channel.send(msg);
    message.channel.send({embeds: [msgEmbed]});
    log.print("character successfully created", 1);
}

function updateData() {
    fs.writeFileSync(path.resolve(__dirname, "../../json_files/jdr.json"), JSON.stringify(jdrData));
    console.log("|-- data successfully upadated");
    log.print("jdrData has been successfully updated", 1);
}

// @TODO : check si inv vide ajouté
function addInventory(message) {
    log.print("tried to add an item to his/her rpg character inventory", message.author, message.content);
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

    let args = message.content.split(" ");
    let newItemRaw = "";
    for(let i = 2; i < args.length; i++) newItemRaw += args[i] + " ";
    newItemRaw = newItemRaw.slice(0,-1); // supprime le dernier " "
    let newItemFields = parseNewItem(newItemRaw);

    let newItem = {};
    newItem["name"] = newItemFields[0];
    if(newItemFields.length > 1) newItem["desc"] = newItemFields[1];
    if(newItemFields.length > 2) newItem["size"] = parseInt(newItemFields[2]);
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

// @TODO : check si rien supprimé
function removeInventory(message) {
    log.print("tried to remove an item from his/her rpg character inventory", message.author, message.content);
    let args = message.content.split(" ");

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

    const regex = /\d+/g;
    if (regex.test(args[2])) {
        let item = "";
        for (let i = 3; i < args.length; i++) {
            item += args[i] + " ";
        }
        item = item.slice(0,-1);
        removeXItems(parseInt(args[2]), item, personnage);
    } else {
        removeXItems(0, args[2], personnage);
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

    items.forEach((item) => {
        if (item["name"] === itemToFind) {
            if (quantity > 0) {
                item["size"] = item["size"] - quantity;
                // si la quantité est 0 ou moins on supprime l'item
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
    personnage["inv"] = finalItems;
    log.print("character inventory has been updated in local", 1);
    updateData();
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
    } else if (args[1] === "remove") {
        removeInventory(message);
    }
}

module.exports = {
    execute
}