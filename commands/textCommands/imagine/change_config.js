const { loadData, updateData } = require("./utils");
const log = require("../../../assets/log");

const {EmbedBuilder} = require("discord.js");
const axios = require("axios");

function change_config(message) {
    let args = message.content.split(" ");
    if (!args[2]) {
        message.channel.send("Bah frérot faut mettre des trucs après");
        return;
    }

    let parameters = loadData();

    if (args[2] === "width") {
        if (!args[3]) {
            sendErrorMessage("Spécifiez une largeur !", message);
            return;
        }
        parameters["width"] = parseInt(args[3]);
        sendSuccessMessage("Largeur modifiée", message);
    } else if (args[2] === "height") {
        if (!args[3]) {
            sendErrorMessage("Spécifiez une hauteur !", message);
            return;
        }
        parameters["height"] = parseInt(args[3]);
        sendSuccessMessage("Hauteur modifiée", message);
    } else if (args[2] === "steps") {
        if (!args[3]) {
            sendErrorMessage("Spécifiez les sampling steps !", message);
            return;
        }
        parameters["steps"] = parseInt(args[3]);
        sendSuccessMessage("Sampling steps modifiés", message);
    } else if (args[2] === "cfg_scale") {
        if (!args[3]) {
            sendErrorMessage("Spécifiez le CFG Scale !", message);
            return;
        }
        parameters["cfg_scale"] = parseFloat(args[3]);
        sendSuccessMessage("CFG Scale modifié", message);
    } else if (args[2] === "sampler_name") {
        if (!args[3]) {
            sendErrorMessage("Spécifiez le sampler !", message);
            return;
        }
        let name = "";
        for (let i = 3; i < args.length; i += 1) {
            name += (args[i] + " ");
        }
        name = name.slice(0, -1);
        parameters["sampler_name"] = name;
        sendSuccessMessage("Sampler modifié", message);
    } else if (args[2] === "model") {
        if (!args[3]) {
            sendErrorMessage("Spécifiez un model !", message);
            return;
        }
        let model_name = args[3];
        axios.get("http://127.0.0.1:7860/sdapi/v1/sd-models")
            .then(res => {
                //console.log(res.data);
                let title;
                res.data.forEach(model => {
                    if (model["model_name"] === model_name) title = model["title"];
                });
                if (!title) {
                    sendErrorMessage("Model introuvable !", message)
                    return;
                }

                let msgEmbed = new EmbedBuilder();
                msgEmbed.setColor("#0293af");
                msgEmbed.setTitle("Chargement du nouveau modèle en cours ...");
                msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"imagine help\""});

                message.channel.send({embeds: [msgEmbed]});

                axios.post("http://127.0.0.1:7860/sdapi/v1/options",
                    {"sd_model_checkpoint": title})
                    .then(res => {
                        sendSuccessMessage("Model modifié", message);
                    })
                    .catch(e => {
                        console.error(e);
                    });
            })
            .catch(e => {
                console.error(e);
            });
    } else {
        sendErrorMessage("Paramètre introuvable!", message);
    }

    updateData(parameters);
}

function sendSuccessMessage(text, message) {
    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#08ff00");
    msgEmbed.setTitle(text + " avec succès !");
    msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"imagine help\""});

    message.channel.send({embeds: [msgEmbed]});
    log.print("Sending success message", 1);
}

function sendErrorMessage(text, message) {
    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("#ff0000");
    msgEmbed.setTitle("Erreur : " + text);
    msgEmbed.setFooter({text: "Pour plus d'informations utilisez la commande \"imagine help\""});

    message.channel.send({embeds: [msgEmbed]});
    log.print("Sending error message", 1);
}

module.exports = {
    change_config
}