const axios = require("axios");
const path = require("path");
const fs = require("fs");
const {EmbedBuilder, AttachmentBuilder} = require("discord.js");

const {loadData, updateProgressBar} = require("./utils");
const {upscale} = require("./upscale");

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function imagine(description, message) {
    return new Promise(async (resolve) => {
        axios.get("http://127.0.0.1:7860/sdapi/v1/progress")
            .then(async res => {
                if (res.status !== 200) {
                    let msgEmbed = new EmbedBuilder();
                    msgEmbed.setColor("#ff0000");
                    msgEmbed.setTitle("Erreur : la génération d'image n'est pas disponible pour le moment !");
                    msgEmbed.setDescription("Code d'erreur : " + res.status);

                    message.channel.send({embeds: [msgEmbed]});
                    resolve(false);
                    return;
                }

                let progress = res.data.progress;
                progress = Math.round(progress * 100);
                if (progress > 0) {
                    let msgEmbed = new EmbedBuilder();
                    msgEmbed.setColor("#ff0000");
                    msgEmbed.setTitle("Erreur : Génération déjà en cours !");
                    msgEmbed.setDescription("Veuillez attendre que la génération précédente soit terminée avant d'en commencer une nouvelle.");

                    let msgSent = await message.channel.send({embeds: [msgEmbed]});
                    await sleep(3000);

                    msgSent.delete();

                    resolve(false);
                } else {
                    gen_image(description, message).then(res => resolve(res));
                }
            });
    });
}

async function gen_image(description, message) {
    if (!description) description = "puppy on a surf board"

    let parameters = loadData();

    let payload = {
        "prompt": description + "<lora:add-detail-xl:0.8>",
        "negative_prompt": "FastNegativeV2, easynegative",
        "steps": parameters["steps"],
        "sampler_name": parameters["sampler_name"],
        "cfg_scale": parameters["cfg_scale"],
        "batch_size": parameters["batch_size"],
        "width": parameters["width"],
        "height": parameters["height"],
        "save_images": true
    }

    let msgEmbed = new EmbedBuilder();
    msgEmbed.setTitle("Generating images : 0%");
    msgEmbed.setColor("#ffffff");

    let messageSent = await message.channel.send({embeds: [msgEmbed]});

    let interval = updateProgressBar(messageSent, "Generating images : ");
    axios.post('http://127.0.0.1:7860/sdapi/v1/txt2img', payload)
        .then(async res => {
            clearInterval(interval);

            console.log(messageSent.id);

            for (let i = 0; i < res.data.images.length; i++) {
                let image_link = path.resolve(__dirname, "./images/" + messageSent.id + "_" + (i + 1) + ".png");
                fs.writeFileSync(image_link, res.data.images[i], {encoding: "base64"});
                fs.writeFileSync(path.resolve(__dirname, "./images/"+ messageSent.id + "_" + (i + 1) + ".base64"), res.data.images[i], {encoding: "utf-8"});
            }

            await sendResult(message, messageSent, JSON.parse(res.data.info)["seed"], description);
        })
        .catch(e => {
            console.error(e);
        });
}

async function sendResult(message, messageSent, seed, description) {
    return new Promise(async (resolve) => {
        let emojis = [
            "🔄",
            "1️⃣",
            "2️⃣",
            "3️⃣",
            "4️⃣"
        ];

        let file = new AttachmentBuilder(path.resolve(__dirname, './images/' + messageSent.id.toString() + "_1.png"));
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Voici vos images : ");
        msgEmbed.setImage('attachment://' + messageSent.id.toString() + "_1.png");
        msgEmbed.setFooter({text: "seed : " + seed});

        messageSent.edit({ embeds: [msgEmbed], files: [file] });
        for (let i = 0; i < emojis.length; i++) {
            await messageSent.react(emojis[i]);
        }

        const filter = (reaction, user) => {
            return emojis.includes(reaction.emoji.name) && !user.bot;
        };

        let collector = messageSent.createReactionCollector(filter, {time: 15000});

        collector.on('collect', (reaction, user) => {
            if (user.id === message.author.id) {
                collector.stop();
                if (reaction.emoji.name === emojis[0]) gen_image(description, message).then(res => resolve(res));
                else {
                    let i = 1;
                    while (i < emojis.length) {
                        if (reaction.emoji.name === emojis[i]) {
                            let image_name = messageSent.id.toString() + "_" + (i+1);
                            upscale(message.channel, image_name);
                        }
                        i++;
                    }
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

module.exports = {
    imagine
}