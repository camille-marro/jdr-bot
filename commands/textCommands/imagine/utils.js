const fs = require("fs");
const path = require("path");
const axios = require("axios");
const {EmbedBuilder} = require("discord.js");

function loadData() {
    const rawData = fs.readFileSync(path.resolve(__dirname, "../../../json_files/ia_params.json"));
    return JSON.parse(rawData);
}

function updateData(data) {
    fs.writeFileSync(path.resolve(__dirname, "../../../json_files/ia_params.json"), JSON.stringify(data));
}

function updateProgressBar(message, title) {
    return setInterval(() => {
        axios.get("http://127.0.0.1:7860/sdapi/v1/progress")
            .then(res => {
                let progress = res.data.progress;
                let eta = res.data["eta_relative"];
                progress = Math.round(progress * 100);
                if (progress <= 0) progress = 100;

                let msgEmbed = new EmbedBuilder();
                msgEmbed.setTitle(title + progress + " % - ~" + Math.round(eta) + " seconds remaining");
                msgEmbed.setColor("#ffffff");

                message.edit({embeds: [msgEmbed]});
            });
    }, 1000);
}

module.exports = {
    loadData,
    updateData,
    updateProgressBar
}