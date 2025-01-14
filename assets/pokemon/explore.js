const {canExplore, setTimeExplore} = require("./player");
const {EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder} = require("discord.js");
const {genXPokemon, catchPokemon, getNewComp, chooseNewComp} = require("./pokemon");

async function explore(interaction, player) {
    if (!canExplore(player)) {
        let msgEmbed = new EmbedBuilder();
        msgEmbed.setTitle("Vous ne pouvez explorer les hautes herbes qu'une fois par heure");
        msgEmbed.setDescription("Votre prochaine exploration sera disponible dans : " + getWaitingTime(player));
        msgEmbed.setColor("#ff0000");

        interaction.reply({
            content: "",
            components: [],
            embeds: [msgEmbed],
        });

        return;
    }

    let randInt = Math.floor(Math.random() * 2) + 3;

    let pokemons = await genXPokemon(randInt);
    let msgEmbed = new EmbedBuilder();
    msgEmbed.setTitle("Vous avez croisé " + randInt + " pokémons dans les hautes herbes !");
    msgEmbed.setColor("Aqua");

    let row = new ActionRowBuilder();

    for (let i = 0; i < pokemons.length; i++) {
        let pokemon = pokemons[i];

        let button = new ButtonBuilder()
            .setCustomId("pokemon" + i)
            .setLabel("Attraper " + pokemon.name)
            .setStyle(ButtonStyle.Secondary);

        row.addComponents(button);

        let title;
        if (pokemon.shiny) title = ":sparkles: " + pokemon.name;
        else title = pokemon.name;

        let types = pokemon.type1 + " - " + pokemon.type2;

        msgEmbed.addFields({name: title, value: types, inline: true});
    }

    let response = await interaction.reply({
        content: '',
        components: [row],
        embeds: [msgEmbed]
    });

    const collectorFilter = i => i.user.id === interaction.user.id;

    try {
        const confirmation = await response.awaitMessageComponent({filter: collectorFilter, time: 60_000});

        for (let i = 0; i < pokemons.length; i++) {
            if (confirmation.customId === ('pokemon' + i)) {
                let msgEmbed = new EmbedBuilder();
                msgEmbed.setTitle("Bravo vous avez attrapé un " + pokemons[i].name + " !");
                msgEmbed.setColor("Yellow");

                let newPokemon = await catchPokemon(player, pokemons[i]);
                setTimeExplore(player);

                await interaction.editReply({
                    content: '',
                    components: [],
                    embeds: [msgEmbed]
                });

                let newComps = await getNewComp(newPokemon);
                // ajouter les new comps et si +4 replace
                for (let i = 0; i < newComps.length; i++) {
                    // if i >=4
                    if (i >= 4) {
                        // choose comp
                        await chooseNewComp(interaction, newPokemon, newComps[i]);
                    } else {
                        let newComp = newComps[i];
                        let key = "IDComp" + (i + 1);
                        newPokemon[key] = newComp.ID;
                    }
                }

                newPokemon.save();
            }
        }
    } catch (e) {
        console.error(e);

        await interaction.editReply({
            content: 'Aucune confirmation après 1 minute, annulation de la commande.',
            components: [],
            embeds: []
        });
    }
}

function getWaitingTime(player) {
    let diff = new Date().getTime() - player.lastExplore;

    let finalDiff = 3600000 - diff //3600000 === 1 heure

    const seconds = Math.floor(finalDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    return `${hours % 24} heure(s), ${minutes % 60} minute(s) et ${seconds % 60} seconde(s)`;
}

module.exports = {
    explore
}