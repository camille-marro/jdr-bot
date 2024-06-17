const {EmbedBuilder, AttachmentBuilder} = require("discord.js");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const {loadData, updateProgressBar} = require("./utils");

function upscale(channel, image_name) {
    let parameters = loadData();

    let image = {image: fs.readFileSync(path.resolve(__dirname, "./images/" + image_name + ".base64"), {encoding: "utf-8"})};
    let seed;
    axios.post("http://127.0.0.1:7860/sdapi/v1/png-info", image)
        .then(async res => {
            seed = parseInt(res.data.parameters["Seed"]);
            let payload = {
                "prompt": res.data.parameters["Prompt"],
                "negative_prompt": res.data.parameters["Negative prompt"],
                "seed": seed,
                "steps": parameters["steps"],
                "sampler_name": parameters["sampler_name"],
                "cfg_scale": parameters["cfg_scale"],
                "batch_size": 1,
                "width": parseInt(res.data.parameters["Size-1"]),
                "height": parseInt(res.data.parameters["Size-2"]),
                "enable_hr": true,
                "denoising_strength": parameters["denoising_strength"],
                "hr_scale": parameters["hr_scale"],
                "hr_upscaler": parameters["hr_upscaler"],
                "hr_second_pass_steps": parameters["hr_second_pass_steps"]
            }

            let msgEmbed = new EmbedBuilder();
            msgEmbed.setTitle("Up scaling image : 0%");
            msgEmbed.setColor("#ffffff")

            let messageSent = await channel.send({embeds: [msgEmbed]});
            let interval = updateProgressBar(messageSent, "Up scaling image : ");

            axios.post('http://127.0.0.1:7860/sdapi/v1/txt2img', payload)
                .then(async res => {
                    clearInterval(interval);

                    let image_link = path.resolve(__dirname, "./images/" + image_name + "_up_scaled.png");
                    fs.writeFileSync(image_link, res.data.images[0], {encoding: "base64"});

                    let file = new AttachmentBuilder(image_link);
                    msgEmbed.setTitle("Voici votre image : ");
                    msgEmbed.setImage('attachment://' + image_name + '_up_scaled.png');
                    msgEmbed.setFooter({text: "seed : " + seed});

                    messageSent.edit({ embeds: [msgEmbed], files: [file] });
                })
                .catch(e => {
                    console.error(e);
                });
        })
        .catch(e => {
            console.error(e);
        })
}

module.exports = {
    upscale
}