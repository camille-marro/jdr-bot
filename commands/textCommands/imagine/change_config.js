const { loadData, updateData } = require("./utils");

function change_config(message) {
    let args = message.content.split(" ");
    if (!args[2]) {
        message.channel.send("Bah frérot faut mettre des trucs après");
        return;
    }

    let parameters = loadData();

    if (args[2] === "width") {
        parameters["width"] = parseInt(args[3]);
        message.channel.send("Largueur mise à jour !");
    } else if (args[2] === "height") {
        parameters["height"] = parseInt(args[3]);
        message.channel.send("Hauteur mise à jour !");
    } else if (args[2] === "steps") {
        parameters["steps"] = parseInt(args[3]);
        message.channel.send("Sampling steps mis à jour !");
    } else if (args[2] === "cfg_scale") {
        parameters["cfg_scale"] = parseFloat(args[3]);
        message.channel.send("CFG Scale mis à jour !");
    } else if (args[2] === "sampler_name") {
        let name = "";
        for (let i = 3; i < args.length; i += 1) {
            name += (args[i] + " ");
        }
        name = name.slice(0, -1);
        console.log(name);
        parameters["sampler_name"] = name;
        message.channel.send("Sampler mis à jour !");
    }

    updateData(parameters);
}

module.exports = {
    change_config
}