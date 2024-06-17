const axios = require("axios");

const { imagine } = require('./gen_image');
const { change_config } = require('./change_config');

function test(message) {
    let args = message.content.split(" ");
    if (!args[2]) {
        message.channel.send("Spécifiez un model !");
        return;
    }
    let model_name = args[2];
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

function execute(message) {
    let args = message.content.split(" ");

    if (args[1] === "modify") {
        change_config(message);
        return;
    } else if (args[1] === "test") {
        test(message);
        return;
    }

    let msg = "";
    for (let i = 0; i < args.length - 1; i++) {
        msg += args[i + 1] + " ";
    }
    imagine(msg, message).then();

}
module.exports = {
    execute
}