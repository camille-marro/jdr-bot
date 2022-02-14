const {MessageEmbed} = require("discord.js");

let createEmbed = function (color, title, description, fields, values) {
    let msgEmbed = new MessageEmbed();

    if (color !== "") {
        if (color.indexOf("!") === 0) msgEmbed.setColor(values[color]);
        else msgEmbed.setColor(color);
    }
    else msgEmbed.setColor("#555555");

    if (title !== "") {
        if (title.indexOf("!") === 0) msgEmbed.setTitle(values[title]);
        else msgEmbed.setTitle(title.toString());
    }
    else msgEmbed.setTitle("Default");

    if (description !== "") {
        if (description.indexOf("!") === 0) msgEmbed.setDescription(values[description])
        else msgEmbed.setDescription(description);
    }
    else msgEmbed.setDescription("Default description");

    if (values !== undefined) {
        for (let i = 0; i < fields.length; i++) {
            if (fields[i]['name'].indexOf("!") === 0) fields[i]['name'] = values[fields[i]['name']];
            if (fields[i]['value'].indexOf("!") === 0) fields[i]['value'] = values[fields[i]['value']];
            msgEmbed.addFields(fields[i]);
        }
    }

    return msgEmbed;
}

module.exports = createEmbed;