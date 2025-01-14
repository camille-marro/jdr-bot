const {Pokemon, PokemonTypes, Types, PokemonGenerated, PokemonCapacities, Capacity} = require("../db");
const {EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder, ComponentType
} = require("discord.js");

async function genXPokemon(x) {
    let pokemons = [];

    for (let i = 0; i < x; i++) {
        let randInt = Math.floor(Math.random() * 151);
        let pokemon = await Pokemon.findOne({
            where: {
                ID: randInt
            }
        });

        let randSize = Math.random() * (1.99 - 0.01) + 0.01;
        let randWeight = Math.random() * (1.99 - 0.01) + 0.01;

        let shiny = ((Math.floor(Math.random() * (8192 - 1 + 1)) + 1) === 15);

        let IV1 = Math.floor(Math.random() * (31 - 1 + 1)) + 1;
        let IV2 = Math.floor(Math.random() * (31 - 1 + 1)) + 1;
        let IV3 = Math.floor(Math.random() * (31 - 1 + 1)) + 1;
        let IV4 = Math.floor(Math.random() * (31 - 1 + 1)) + 1;
        let IV5 = Math.floor(Math.random() * (31 - 1 + 1)) + 1;
        let IV6 = Math.floor(Math.random() * (31 - 1 + 1)) + 1;

        let size = pokemon.size*randSize;
        let weight = pokemon.weight*randWeight;

        let sex;
        if (pokemon.sex != null) {
            if (pokemon.sex <= (Math.floor(Math.random() * (1000 - 1 + 1)) + 1)) sex = "M";
            else sex = "F";
        } else sex = "/";

        let types = await getPokemonTypes(pokemon);
        let type1 = types[0].name;
        let type2 = "/"
        if (types.length > 1) type2 = types[1].name;

        let finalPokemon = {
            IDPokemon: pokemon.ID,
            name: pokemon.name,
            sex: sex,
            size: size,
            weight: weight,
            level: 1,
            xp: 0,
            type1: type1,
            type2: type2,
            currentHp: pokemon.hp,
            maxHp: pokemon.hp,
            attack: pokemon.attack,
            defense: pokemon.defense,
            speAttack: pokemon.speAttack,
            speDefense: pokemon.speDefense,
            speed: pokemon.speed,
            IVHp: IV1,
            IVAttack: IV2,
            IVDefense: IV3,
            IVSpeAttack: IV4,
            IVSpeDefense: IV5,
            IVSpeed: IV6,
            shiny: shiny
        }

        pokemons.push(finalPokemon);
    }

    return pokemons;
}

async function catchPokemon(player, pokemon) {
    pokemon.IDPlayer = player.ID;
    return PokemonGenerated.create(pokemon);
}

async function getPokemonTypes(pokemon) {
    let typesID = await PokemonTypes.findAll({
        where: {
            pokemonID: pokemon.ID
        }
    });

    let types = [];
    for (let typeID of typesID) {
        let type = await Types.findOne({
            where: {
                ID: typeID.typeID
            }
        });

        types.push(type);
    }

    return types;
}

async function getNewComp(pokemon) {
    let level;
    if (pokemon.level === 1) level = 0;
    else level = pokemon.level;

    let capacitiesID = await PokemonCapacities.findAll({
        where: {
            pokemonID: pokemon.IDPokemon,
            level: level,
        }
    });

    let capacities = [];
    for (let capacityID of capacitiesID) {
        let capacity = await Capacity.findOne({
            where: {
                ID: capacityID.capacityID,
            }
        });

        capacities.push(capacity);
    }

    return capacities;
}

async function chooseNewComp(interaction, pokemon, comp) {
    let msgEmbed = new EmbedBuilder();
    msgEmbed.setColor("Green");
    msgEmbed.setTitle("Oh votre " + pokemon.name + " peut apprendre une nouvelle compétence !");
    msgEmbed.setDescription(
        "Mais il connait déjà 4 capacités. Par quelle capacité remplacer : \n" +
        "**" + comp.name + " (" + comp.type + ")**\n" +
        "Attaque " + comp.category + " avec une puissance de " + comp.power + " et une précision de " + comp.preci + "."
    );

    let capacities = [];
    let capacity = await Capacity.findOne({
        where: {
            ID: pokemon.IDComp1
        }
    });
    capacities.push(capacity);

    capacity = await Capacity.findOne({
        where: {
            ID: pokemon.IDComp2
        }
    });
    capacities.push(capacity);

    capacity = await Capacity.findOne({
        where: {
            ID: pokemon.IDComp3
        }
    });
    capacities.push(capacity);

    capacity = await Capacity.findOne({
        where: {
            ID: pokemon.IDComp4
        }
    });
    capacities.push(capacity);
    let row = new ActionRowBuilder();

    for (let i = 0; i < capacities.length; i++) {
        msgEmbed.addFields({name: capacities[i].name + " (" + capacities[i].type + ")", value: "Attaque " + capacities[i].category + " avec une puissance de " + capacities[i].power + " et une précision de " + capacities[i].preci + ".", inline: true});
        if ((i < 2) && (i % 2 === 1)) msgEmbed.addFields({name: " ", value: " "});
        let button = new ButtonBuilder()
            .setCustomId("comp" + i)
            .setLabel(capacities[i].name)
            .setStyle(ButtonStyle.Secondary);

        row.addComponents(button);
    }

    let button = new ButtonBuilder()
        .setCustomId("none")
        .setLabel("Aucune")
        .setStyle(ButtonStyle.Danger);
    row.addComponents(button);

    let response;
    if (interaction.replied) {
        response = await interaction.editReply({
            content: "",
            components: [row],
            embeds: [msgEmbed],
        });
    } else {
        response = await interaction.reply({
            content: "",
            components: [row],
            embeds: [msgEmbed],
        });
    }

    const collectorFilter = i => i.user.id === interaction.user.id;

    try {
        const confirmation = await response.awaitMessageComponent({filter: collectorFilter, time: 60_000});
        let msgEmbed = new EmbedBuilder();

        if (confirmation.customId === "none"){
            msgEmbed.setTitle("Très bien, " + pokemon.name + " n'apprendra pas " + comp.name + " !");
            msgEmbed.setColor("Aqua");
        } else {
            for (let i = 0; i < 4; i++) {
                if (confirmation.customId === ("comp" + i)) {
                    msgEmbed.setTitle("Félicitations, " + pokemon.name + " a appris " + comp.name + " !");
                    msgEmbed.setColor("Green");

                    pokemon["IDComp" + (i+1)] = comp.ID;
                    pokemon.save();
                }
            }
        }

        await interaction.editReply({
            content: "",
            components: [],
            embeds: [msgEmbed],
        });
    } catch (e) {
        await interaction.editReply({
            content: 'Aucune confirmation après 1 minute, annulation de la commande.',
            components: [],
            embeds: []
        });

        console.error(e);
    }
}

async function choosePokemon(interaction, pokemons) {
    const select = new StringSelectMenuBuilder()
        .setCustomId("choosePokemon")
        .setPlaceholder("Choisir le pokémon");

    for (let i = 0; i < pokemons.length; i++) {
        let pokemon = pokemons[i];

        let option = new StringSelectMenuOptionBuilder()
            .setDescription("Niveau : " + pokemon.level)
            .setValue(i.toString())
            .setLabel(pokemon.name + " (" + pokemon.sex + ")")

        if (pokemon.shiny) option.setEmoji("✨")

        select.addOptions(option);
    }

    const row = new ActionRowBuilder()
        .addComponents(select);

    let response = await interaction.reply({
        components: [row],
    });

    const collector = response.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 3_600_000
    });

    return new Promise((resolve, reject) => {
        collector.on('collect', async i => {
            if (i.user.id === interaction.user.id) {

                collector.stop();

                resolve(pokemons[parseInt(i.values[0])]);
            } else {
                await i.reply({ content: "Ce menu ne vous appartient pas.", ephemeral: true });
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason !== 'user') {
                reject(new Error("Le temps pour choisir un Pokémon est écoulé."));
            }
        });
    });


}

function addXp(pokemon, xp) {
    let maxXP = Math.pow(pokemon.level, 2);
    let lvlUp = 0;

    pokemon.xp += xp;
    while (pokemon.xp >= maxXP) {
        pokemon.xp -= maxXP;
        pokemon.level++;
        lvlUp++;
        maxXP = Math.pow(pokemon.level, 2);
    }

    pokemon.save();
    return lvlUp;
}

module.exports = {
    genXPokemon, catchPokemon, getNewComp, chooseNewComp, choosePokemon, addXp
}