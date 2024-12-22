const {EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
const { catchPokemon, drawPokemon } = require("./handlePokemon");
const { setTimeExplore } = require("./handlePlayer");

async function explore(interaction, player)  {
    let res = await exploreGrass(player);
    if (res[0]) {
        let row = new ActionRowBuilder();

        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Vous avez croisé 3 pokémons dans les hautes herbes !");
        msgEmbed.setColor("Aqua");

        for (let i = 0; i < res[1].length; i++) {
            let pokemon = res[1][i]["pokemon"];
            let types = res[1][i]["types"];

            let typeStr = "";
            for (let type of types) {
                typeStr += type["name"][0].toUpperCase() + type["name"].substring(1);
                typeStr += " - ";
            }
            typeStr = typeStr.substring(0, typeStr.length - 2);

            let button = new ButtonBuilder()
                .setCustomId("pokemon" + i)
                .setLabel("Attraper " + pokemon["name"] + " !")
                .setStyle(ButtonStyle.Secondary);

            row.addComponents(button);
            msgEmbed.addFields({name: pokemon["name"], value: typeStr, inline: true});
        }

        let response = await interaction.reply({
            content: '',
            components: [row],
            embeds: [msgEmbed]
        });

        const collectorFilter = i => i.user.id === interaction.user.id;

        try {
            const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

            for (let i = 0; i < res[1].length; i++) {
                if (confirmation.customId === ('pokemon' + i)) {
                    let msgEmbed = new EmbedBuilder();
                    msgEmbed.setTitle("Bravo vous avez attrapé un : " + res[1][i]['pokemon']["name"] + " !");
                    msgEmbed.setColor("Green");

                    await catchPokemon(player, res[1][i]['pokemon'], res[1][i]['types']);
                    await setTimeExplore(player);

                    await interaction.editReply({
                        content: '',
                        components: [],
                        embeds: [msgEmbed]
                    });

                    // @TODO : choix des compétences pour le nouveau pokémon si y'a plus de 4 compétences au niv 1
                }
            }
        } catch (e) {
            await interaction.editReply({
                content: 'Aucune confirmation après 1 minute, annulation de la commande.',
                components: [],
                embeds: []
            });

            console.error(e);
        }
    } else {
        interaction.reply({embeds: [res[1]]});
    }
}

async function exploreGrass(player) {
    let timeStamp = new Date().getTime();

    if (((timeStamp - player["lastExplore"]) / (1000 * 60 * 60)) < 1) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Vous ne pouvez explorer les hautes herbes qu'une fois par heure");
        msgEmbed.setDescription("Votre prochaine exploration sera disponible dans : " + getWaitingTime(player));
        msgEmbed.setColor("#ff0000");

        return [false, msgEmbed];
    }

    let pokemons = await drawPokemon(3);

    return [true, pokemons];
}

function getWaitingTime(player) {
    let diff = new Date().getTime() - player["lastExplore"];

    let finalDiff = 3600000 - diff //3600000 === 1 heure

    const seconds = Math.floor(finalDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    return `${hours % 24} heure(s), ${minutes % 60} minute(s) et ${seconds % 60} seconde(s)`;
}

module.exports = {
    explore
};