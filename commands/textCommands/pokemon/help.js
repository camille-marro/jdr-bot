const {EmbedBuilder} = require('discord.js');

/**
 * Fonction pour choisir et afficher le bon message d'aide
 * @param message
 */
function help(message) {
    let args = message.content.split(" ");

    let msgEmbed;
    if (args[2] === "start") {
        msgEmbed = helpStart();
    } else if (args[2] === "list" || args[2] === "liste" || args[2] === "inv") {
        msgEmbed = helpList();
    } else if (args[2] === "info") {
        msgEmbed = helpInfo();
    } else if (args[2] === "explore") {
        msgEmbed = helpExplore();
    } else if (args[2] === "train") {
        msgEmbed = helpTrain();
    } else if (args[2] === "trainPVE") {
        msgEmbed = helpTrainPVE();
    } else if (args[2] === "heal") {
        msgEmbed = helpHeal();
    } else if (args[2] === "team") {
        if (args[3] === "print") {
            msgEmbed = helpTeamPrint();
        } else if (args[3] === "add") {
            msgEmbed = helpTeamAdd();
        } else if (args[3] === "remove") {
            msgEmbed = helpTeamRemove();
        } else if (args[3] === "create") {
            msgEmbed = helpTeamCreate();
        } else {
            msgEmbed = helpTeam();
        }
    } else if (args[2] === "release") {
        msgEmbed = helpRelease();
    } else {
        msgEmbed = helpGlobal();
    }

    message.channel.send({embeds: [msgEmbed]});
}

/**
 * Message d'aide pour la commande start
 * @returns {EmbedBuilder}
 */
function helpStart() {
    let msgEmbed = new EmbedBuilder();

    msgEmbed.setTitle("Pokémon - Start");
    msgEmbed.setDescription("Permet de commencer son aventure pokémon !");
    msgEmbed.setFooter({text: "pour plus d'informations utilisez la commande \"pokemon help\"."});
    msgEmbed.setColor("#6e0e91");
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "pokemon start"});
    msgEmbed.addFields({name: "Exemple de commande", value: "pokemon start"});

    return msgEmbed;
}

/**
 * Message d'aide pour la commande list
 * @returns {EmbedBuilder}
 */
function helpList() {
    let msgEmbed = new EmbedBuilder();

    msgEmbed.setTitle("Pokémon - Liste");
    msgEmbed.setDescription("Permet d'afficher la liste de ses pokémons !");
    msgEmbed.setFooter({text: "pour plus d'informations utilisez la commande \"pokemon help\"."});
    msgEmbed.setColor("#6e0e91");
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "pokemon list"});
    msgEmbed.addFields({name: "Alias", value: " ", inline: true});
    msgEmbed.addFields({name: "list", value: "list, liste, inv", inline: true});
    msgEmbed.addFields({name: "Exemple de commande", value: "pokemon liste"});

    return msgEmbed;
}

/**
 * Message d'aide pour la commande info
 * @returns {EmbedBuilder}
 */
function helpInfo() {
    let msgEmbed = new EmbedBuilder();

    msgEmbed.setTitle("Pokémon - Info");
    msgEmbed.setDescription("Permet d'afficher les informations d'un pokémon !");
    msgEmbed.setFooter({text: "pour plus d'informations utilisez la commande \"pokemon help\"."});
    msgEmbed.setColor("#6e0e91");
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "pokemon info [nom_du_pokemon]"});
    msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
    msgEmbed.addFields({name: "nom_du_pokemon", value: "Nom du pokémon dont il faut afficher les informations", inline: true});
    msgEmbed.addFields({name: "Exemple de commande", value: "pokemon info évoli"});

    return msgEmbed;
}

/**
 * Message d'aide pour la commande explore
 * @returns {EmbedBuilder}
 */
function helpExplore() {
    let msgEmbed = new EmbedBuilder();

    msgEmbed.setTitle("Pokémon - Explore");
    msgEmbed.setDescription("Permet d'explorer les hautes herbes pour attraper un nouveau pokémon. Vous pouvez utiliser la commande une fois toutes les heures.");
    msgEmbed.setFooter({text: "pour plus d'informations utilisez la commande \"pokemon help\"."});
    msgEmbed.setColor("#6e0e91");
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "pokemon explore"});
    msgEmbed.addFields({name: "Exemple de commande", value: "pokemon explore"});

    return msgEmbed;
}

/**
 * Message d'aide pour la commande train
 * @returns {EmbedBuilder}
 */
function helpTrain() {
    let msgEmbed = new EmbedBuilder();

    msgEmbed.setTitle("Pokémon - Train");
    msgEmbed.setDescription("Permet d'entrainer un pokémon. Vous avez 5 entrainements disponibles toutes les heures.");
    msgEmbed.setFooter({text: "pour plus d'informations utilisez la commande \"pokemon help\"."});
    msgEmbed.setColor("#6e0e91");
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "pokemon train [nom_du_pokemon]"});
    msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
    msgEmbed.addFields({name: "nom_du_pokemon", value: "Nom du pokémon à entrainer", inline: true});
    msgEmbed.addFields({name: "Exemple de commande", value: "pokemon train évoli"});

    return msgEmbed;
}

/**
 * Message d'aide pour la commande trainPVE
 * @returns {EmbedBuilder}
 */
function helpTrainPVE() {
    let msgEmbed = new EmbedBuilder();

    msgEmbed.setTitle("Pokémon - TrainPVE");
    msgEmbed.setDescription("Permet de faire des combats contre un pokémon sauvage ! Il existe plusieurs niveaux de difficultés." +
        "Les niveaux de difficultés influent sur le niveau des pokémons sauvages rencontrés : \n" +
        "- easy/facile : entre -3 et 0 niveaux de différence\n" +
        "- medium : entre -2 et +3 niveaux de différence\n" +
        "- hard/difficile : entre 0 et +10 niveaux de différence.\n\n" +
        "Les combats gagnés rapportent de l'expérience, et la difficulté ajoute un multiplicateur sur la quantité d'expérience gagnée : \n" +
        "- easy/facile : x1\n" +
        "- medium : x2\n" +
        "- hard/difficile: x3\n\n" +
        "De plus chaque combat rapport 1.5 fois plus d'expérience qu'un entrainement normal.\n\n" +
        "**Les points de vie perdus de votre pokémon ne sont pas restaurés à la fin des combats !** " +
        "\nFaites attention à bien vérifier ces derniers si vous ne voulez pas que votre pokémon tombe K.O.");
    msgEmbed.setFooter({text: "pour plus d'informations utilisez la commande \"pokemon help\"."});
    msgEmbed.setColor("#6e0e91");
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "pokemon trainPVE [difficulty] [nom_du_pokemon]"});
    msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
    msgEmbed.addFields({name: "difficulty", value: "Difficulté de la rencontre : easy/facile, medium, hard/difficile", inline: true});
    msgEmbed.addFields({name: "nom_du_pokemon", value: "Nom du pokémon à envoyer combattre", inline: true});
    msgEmbed.addFields({name: "Exemple de commande", value: "pokemon trainPVE medium évoli"});

    return msgEmbed;
}

/**
 * Message d'aide pour la commande heal
 * @returns {EmbedBuilder}
 */
function helpHeal() {
    let msgEmbed = new EmbedBuilder();

    msgEmbed.setTitle("Pokémon - Heal");
    msgEmbed.setDescription("Permet de soigner ses pokémons ! Vous ne pouvez soigner vos pokémons qu'une fois toutes les heures");
    msgEmbed.setFooter({text: "pour plus d'informations utilisez la commande \"pokemon help\"."});
    msgEmbed.setColor("#6e0e91");
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "pokemon heal"});
    msgEmbed.addFields({name: "Exemple de commande", value: "pokemon heal"});

    return msgEmbed;
}

/**
 * Message d'aide pour la commande team
 * @returns {EmbedBuilder}
 */
function helpTeam() {
    let msgEmbed = new EmbedBuilder();

    msgEmbed.setTitle("Pokémon - Team");
    msgEmbed.setDescription("Permet de gérer sa team de pokémon !\nPar défaut la commande affiche la team si elle existe.");
    msgEmbed.setFooter({text: "pour plus d'informations utilisez la commande \"pokemon help\"."});
    msgEmbed.setColor("#6e0e91");
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "pokemon team [commande] [options:optionnel]"});
    msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
    msgEmbed.addFields({name: "commande", value: "Commande à faire pour gérer sa team : create, print, add, remove", inline: true});
    msgEmbed.addFields({name: "options", value: "Options des différentes commandes", inline: true});
    msgEmbed.addFields({name: "Exemple de commande", value: "pokemon team print"});

    return msgEmbed;
}

/**
 * Message d'aide pour la commande team create
 * @returns {EmbedBuilder}
 */
function helpTeamCreate() {
    let msgEmbed = new EmbedBuilder();

    msgEmbed.setTitle("Pokémon - Team - Create");
    msgEmbed.setDescription("Permet de créer sa team de pokémon !");
    msgEmbed.setFooter({text: "pour plus d'informations utilisez la commande \"pokemon help\"."});
    msgEmbed.setColor("#6e0e91");
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "pokemon team create [nom_du_pokemon_1] [nom_du_pokemon_2] ..."});
    msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
    msgEmbed.addFields({name: "nom_du_pokemon_x", value: "Nom du pokémon à ajouter à sa team", inline: true});
    msgEmbed.addFields({name: "Exemple de commande", value: "pokemon team create évoli roucool léviator arcanin"});

    return msgEmbed;
}

/**
 * Message d'aide pour la commande team print
 * @returns {EmbedBuilder}
 */
function helpTeamPrint() {
    let msgEmbed = new EmbedBuilder();

    msgEmbed.setTitle("Pokémon - Team - Print");
    msgEmbed.setDescription("Permet d'afficher sa team de pokémon !");
    msgEmbed.setFooter({text: "pour plus d'informations utilisez la commande \"pokemon help\"."});
    msgEmbed.setColor("#6e0e91");
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "pokemon team print"});
    msgEmbed.addFields({name: "Exemple de commande", value: "pokemon team print"});

    return msgEmbed;
}

/**
 * Message d'aide pour la commande team add
 * @returns {EmbedBuilder}
 */
function helpTeamAdd() {
    let msgEmbed = new EmbedBuilder();

    msgEmbed.setTitle("Pokémon - Team - Add");
    msgEmbed.setDescription("Permet d'ajouter un pokémon à sa team' !");
    msgEmbed.setFooter({text: "pour plus d'informations utilisez la commande \"pokemon help\"."});
    msgEmbed.setColor("#6e0e91");
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "pokemon team add [nom_du_pokemon]"});
    msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
    msgEmbed.addFields({name: "nom_du_pokemon", value: "Nom du pokémon à ajouter à sa team", inline: true});
    msgEmbed.addFields({name: "Exemple de commande", value: "pokemon team add évoli"});

    return msgEmbed;
}

/**
 * Message d'aide pour la commande team remove
 * @returns {EmbedBuilder}
 */
function helpTeamRemove() {
    let msgEmbed = new EmbedBuilder();

    msgEmbed.setTitle("Pokémon - Team - Remove");
    msgEmbed.setDescription("Permet de supprimer un pokémon à sa team' !");
    msgEmbed.setFooter({text: "pour plus d'informations utilisez la commande \"pokemon help\"."});
    msgEmbed.setColor("#6e0e91");
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "pokemon team remove [nom_du_pokemon]"});
    msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
    msgEmbed.addFields({name: "nom_du_pokemon", value: "Nom du pokémon à supprimer de sa team", inline: true});
    msgEmbed.addFields({name: "Exemple de commande", value: "pokemon team remove évoli"});

    return msgEmbed;
}

/**
 * Message d'aide pour la commande release
 * @returns {EmbedBuilder}
 */
function helpRelease() {
    let msgEmbed = new EmbedBuilder();

    msgEmbed.setTitle("Pokémon - Release");
    msgEmbed.setDescription("Permet de relâche un pokémon !");
    msgEmbed.setFooter({text: "pour plus d'informations utilisez la commande \"pokemon help\"."});
    msgEmbed.setColor("#6e0e91");
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "pokemon release [nom_du_pokemon]"});
    msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
    msgEmbed.addFields({name: "nom_du_pokemon", value: "Nom du pokémon à relâcher", inline: true});
    msgEmbed.addFields({name: "Exemple de commande", value: "pokemon release évoli"});

    return msgEmbed;
}

/**
 * Message d'aide global
 * @returns {EmbedBuilder}
 */
function helpGlobal() {
    let msgEmbed = new EmbedBuilder();

    msgEmbed.setTitle("Help - Pokémon");
    msgEmbed.setDescription("Commandes pour jouer au pokémon grâce au bot wouhou ! Pour chaque commande il y existe un menu help pour l'afficher utiliser la commande *pokemon [commande] help*.");
    msgEmbed.setFooter({text: "pour plus d'informations utilisez la commande \"pokemon help\"."});
    msgEmbed.setColor("#6e0e91");
    msgEmbed.addFields({name: "start", value: "Pour commencer l'aventure pokémon"});
    msgEmbed.addFields({name: "list/lsite/inv", value: "Affiche la liste de tous ses pokémons"});
    msgEmbed.addFields({name: "info", value: "Affiche les informations d'un de ses pokémons"});
    msgEmbed.addFields({name: "explore", value: "Permet d'explorer les hautes herbes pour attraper des nouveau pokémons"});
    msgEmbed.addFields({name: "train", value: "Permet d'entrainer un de vos pokémons"});
    msgEmbed.addFields({name: "trainPVE", value: "Permet de faire des combats contre des pokémons sauvages"});
    msgEmbed.addFields({name: "heal", value: "Permet de soigner tous ses pokémons"});
    msgEmbed.addFields({name: "team", value: "Permet de gérer son équipe de pokémon"});
    msgEmbed.addFields({name: "release", value: "Permet de relâcher un pokémon"});
    msgEmbed.addFields({name: "help", value: "Affiche ce message"});

    return msgEmbed;
}

module.exports = {
    help
}