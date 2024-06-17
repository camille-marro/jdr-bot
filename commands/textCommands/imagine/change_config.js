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
        message.channel.send("Largeur mise à jour !");
    } else if (args[2] === "height") {
        if (!args[3]) {
            sendErrorMessage("Spécifiez une hauteur !", message);
            return;
        }
        parameters["height"] = parseInt(args[3]);
        message.channel.send("Hauteur mise à jour !");
    } else if (args[2] === "steps") {
        if (!args[3]) {
            sendErrorMessage("Spécifiez les sampling steps !", message);
            return;
        }
        parameters["steps"] = parseInt(args[3]);
        message.channel.send("Sampling steps mis à jour !");
    } else if (args[2] === "cfg_scale") {
        if (!args[3]) {
            sendErrorMessage("Spécifiez le CFG Scale !", message);
            return;
        }
        parameters["cfg_scale"] = parseFloat(args[3]);
        message.channel.send("CFG Scale mis à jour !");
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
        message.channel.send("Sampler mis à jour !");
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
                    message.channel.send("Model introuvable !");
                    return;
                }

                message.channel.send("Changing model ...");

                axios.post("http://127.0.0.1:7860/sdapi/v1/options",
                    {"sd_model_checkpoint": title})
                    .then(res => {
                        console.log(res);
                        message.channel.send("Model chargé avec succès !");
                    })
                    .catch(e => {
                        console.error(e);
                    });
            })
            .catch(e => {
                console.error(e);
            });
    }

    updateData(parameters);
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