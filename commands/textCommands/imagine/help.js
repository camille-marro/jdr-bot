const {EmbedBuilder} = require('discord.js');

function help(message) {
    let args = message.content.split(' ');

    let msgEmbed;
    if (args[2] === "modify") {
        msgEmbed = helpModify();
    } else {
        msgEmbed = helpGlobal();
    }

    message.channel.send({embeds: [msgEmbed]});
}

function helpModify() {
    let msgEmbed = new EmbedBuilder();

    msgEmbed.setTitle("Imagine - Modify");
    msgEmbed.setDescription("Permet de modifier les paramètres de génération !");
    msgEmbed.setFooter({text: "pour plus d'informations utilisez la commande \"imagine help\"."});
    msgEmbed.setColor("#6e0e91");
    msgEmbed.addFields({name: "Syntaxe de la commande", value: "imagine modify [option] [valeur]"});
    msgEmbed.addFields({name: "Paramètres", value: " ", inline: true});
    msgEmbed.addFields({name: "option", value: "Paramètres à modifier parmi : width, height, steps, cfg_scale, sampler_name, model", inline: true});
    msgEmbed.addFields({name: "valeur", value: "Valeur du paramètre à modifier", inline: true});
    msgEmbed.addFields({name: "Exemple de commande", value: "imagine modify height 768"});

    return msgEmbed;
}

function helpGlobal() {
    let msgEmbed = new EmbedBuilder();

    msgEmbed.setTitle("Help - Imagine");
    msgEmbed.setDescription("Permet de générer des images grâce à une IA.\nPar défaut en utilisant simplement la commande **imagine** vous pouvez générer des images.");
    msgEmbed.setFooter({text: "pour plus d'informations utilisez la commande \"imagine help\"."});
    msgEmbed.setColor("#6e0e91");
    msgEmbed.addFields({name: "modify", value: "Permet de modifier les paramètres de génération. **/!\\ A n'utiliser que si vous savez ce que vous faites !**"});

    return msgEmbed;
}

module.exports = {
    help
}