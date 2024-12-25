const { PokemonGenerated, PokemonCapacities, Pokemon, PokemonTypes, Types, Capacity} = require("../db");
const {Op} = require("sequelize");
const {EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags} = require("discord.js");

async function catchPokemon(player, pokemon, types) {
    let randSize = Math.random() * (1.99 - 0.01) + 0.01;
    let randWeight = Math.random() * (1.99 - 0.01) + 0.01;

    let randShiny = Math.floor(Math.random() * (8192 - 1 + 1)) + 1;

    let IV1 = Math.floor(Math.random() * (31 - 1 + 1)) + 1;
    let IV2 = Math.floor(Math.random() * (31 - 1 + 1)) + 1;
    let IV3 = Math.floor(Math.random() * (31 - 1 + 1)) + 1;
    let IV4 = Math.floor(Math.random() * (31 - 1 + 1)) + 1;
    let IV5 = Math.floor(Math.random() * (31 - 1 + 1)) + 1;
    let IV6 = Math.floor(Math.random() * (31 - 1 + 1)) + 1;

    let size = pokemon["size"]*randSize;
    let weight = pokemon["weight"]*randWeight;

    let shiny = (randShiny === 1);

    let type1 = types[0]["name"];
    let type2 = "/"
    if (types.length > 1) type2 = types[1]["name"];

    let sex;
    if (pokemon["sex"] != null) {
        if (pokemon["sex"] <= (Math.floor(Math.random() * (1000 - 1 + 1)) + 1)) sex = "M";
        else sex = "F";
    } else sex = "/";

    return await PokemonGenerated.create({
        IDPokemon: pokemon["ID"],
        IDPlayer: player["ID"],
        name: pokemon["name"],
        sex: sex,
        size: size,
        weight: weight,
        level: 1,
        xp: 0,
        type1: type1,
        type2: type2,
        currentHp: pokemon["hp"],
        maxHp: pokemon["hp"],
        attack: pokemon["attack"],
        defense: pokemon["defense"],
        speAttack: pokemon["speAttack"],
        speDefense: pokemon["speDefense"],
        speed: pokemon["speed"],
        IVHp: IV1,
        IVAttack: IV2,
        IVDefense: IV3,
        IVSpeAttack: IV4,
        IVSpeDefense: IV5,
        IVSpeed: IV6,
        shiny: shiny
    });
}

async function getCompsAtLevel(pokemonID, level) {
    let rawCapacities = await PokemonCapacities.findAll({
        where: {
            pokemonID: pokemonID,
            level: {[Op.lte]: level}
        }
    });

    let capacities = [];
    for (let capacity of rawCapacities) {
        let fullCapacity = await Capacity.findOne({
            where: {
                ID: capacity["capacityID"],
            }
        });

        capacities.push(fullCapacity["dataValues"]);
    }

    return capacities;
}

async function drawPokemon(nb) {
    let pokemons = [];
    for (let i = 0; i < nb; i++) {
        let randInt = Math.floor(Math.random() * 151);
        let pokemon = await Pokemon.findOne({
            where: {
                ID: randInt
            }
        });

        let typesID = await PokemonTypes.findAll({
            where: {
                pokemonID: pokemon["dataValues"]["ID"]
            }
        });

        let types = [];
        for (let typeID of typesID) {
            let type = await Types.findOne({
                where: {
                    ID: typeID["dataValues"]["typeID"]
                }
            });

            types.push(type["dataValues"]);
        }

        pokemons.push({pokemon: pokemon["dataValues"], types: types});
    }

    return pokemons;
}

/*
    check new comp only for new generated pokemon not for level up
 */
async function checkNewComp(interaction, pokemon) {
    let capacities = await getCompsAtLevel(pokemon["IDPokemon"], pokemon["level"]);
    let comps = [{ID: null}, {ID: null}, {ID: null}, {ID: null}];

    if (capacities.length > 4) {
        // choisir la capacité à enlever
        comps[0] = capacities[0];
        comps[1] = capacities[1];
        comps[2] = capacities[2];
        comps[3] = capacities[3];
        for (let i = 4; i < capacities.length; i++) {
            let res = await replaceCapacity(interaction, pokemon, capacities[i], comps);
            if (res) {
                comps[res] = capacities[i];
            }

        }
    } else {
        for (let i = 0; i < comps.length; i++) {
            if (capacities[i]) {
                comps[i] = capacities[i];
            }
        }
    }

    await PokemonGenerated.update(
        {
            IDComp1: comps[0]["ID"],
            IDComp2: comps[1]["ID"],
            IDComp3: comps[2]["ID"],
            IDComp4: comps[3]["ID"],
        },
        {
            where: {
                IDPokemon: pokemon["IDPokemon"],
            }
        }
    );
}

async function replaceCapacity(interaction, pokemon, capacity, comps) {
    let msgEmbed = new EmbedBuilder();

    console.log(comps)

    msgEmbed.setTitle("Oh votre " + pokemon["name"] + " peut apprendre une nouvelle capacité !");
    msgEmbed.setColor("Yellow");
    msgEmbed.setDescription("Sélectionner la compétence à remplacer par " + capacity["name"]);
    msgEmbed.addFields({name: capacity["name"] + " (" + capacity["type"] + ")", value: "Attaque " + capacity['category'] + " avec  une puissance de " + capacity["power"] + " et une précision de " +  capacity["preci"] + "."});
    msgEmbed.addFields({name: "Capacités à oublier : ", value: " "});

    let capacities = [];
    let fullCapacity = await Capacity.findOne({
        where: {
            ID: comps[0]["ID"]
        }
    });

    capacities.push(fullCapacity["dataValues"]);
    fullCapacity = await Capacity.findOne({
        where: {
            ID: comps[1]["ID"]
        }
    });

    capacities.push(fullCapacity["dataValues"]);
    fullCapacity = await Capacity.findOne({
        where: {
            ID: comps[2]["ID"]
        }
    });

    capacities.push(fullCapacity["dataValues"]);
    fullCapacity = await Capacity.findOne({
        where: {
            ID: comps[3]["ID"]
        }
    });

    capacities.push(fullCapacity["dataValues"]);

    msgEmbed.addFields({name: capacities[0]["name"] + "  (" + capacities[0]["type"] + ")", value: "Attaque " + capacities[0]['category'] + " avec  une puissance de " + capacities[0]["power"] + " et une précision de " +  capacities[0]["preci"] + ".", inline: true});
    msgEmbed.addFields({name: capacities[1]["name"] + "  (" + capacities[1]["type"] + ")", value: "Attaque " + capacities[1]['category'] + " avec  une puissance de " + capacities[1]["power"] + " et une précision de " +  capacities[1]["preci"] + ".", inline: true});
    msgEmbed.addFields({name: " ", value: " "});
    msgEmbed.addFields({name: capacities[2]["name"] + "  (" + capacities[2]["type"] + ")", value: "Attaque " + capacities[2]['category'] + " avec  une puissance de " + capacities[2]["power"] + " et une précision de " +  capacities[2]["preci"] + ".", inline: true});
    msgEmbed.addFields({name: capacities[3]["name"] + "  (" + capacities[3]["type"] + ")", value: "Attaque " + capacities[3]['category'] + " avec  une puissance de " + capacities[3]["power"] + " et une précision de " +  capacities[3]["preci"] + ".", inline: true});

    let row = new ActionRowBuilder();
    for (let i = 0; i < 4; i++) {
        let button = new ButtonBuilder()
            .setCustomId("comp" + i)
            .setLabel(capacities[i]["name"])
            .setStyle(ButtonStyle.Secondary);

        row.addComponents(button);
    }
    let button = new ButtonBuilder()
        .setCustomId("none")
        .setLabel("Aucune")
        .setStyle(ButtonStyle.Danger);
    row.addComponents(button);

    let response = await interaction.editReply({
        content: "",
        components: [row],
        embeds: [msgEmbed],
    });

    const collectorFilter = i => i.user.id === interaction.user.id;

    try {
        const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 })
        let msgEmbed = new EmbedBuilder();
        let res;
        if (confirmation.customId === "none") {
            msgEmbed.setTitle("Très bien, " + pokemon["name"] + " n'apprendra pas " + capacity["name"] + " !");
            msgEmbed.setColor("Aqua");

            res = false;
        } else {
            for (let i = 0; i < 4; i++) {
                if (confirmation.customId === ("comp" + i)) {
                    res = i;

                    msgEmbed.setTitle("Félicitations, " + pokemon["name"] + " a appris " + capacity["name"] + " !");
                    msgEmbed.setColor("Green");
                }
            }
        }

        /*

        await interaction.followUp({
            content: '',
            components: [],
            embeds: [msgEmbed],
            flags: MessageFlags.Ephemeral
        });

        */

        return res;

    } catch (e) {
        await interaction.editReply({
            content: 'Aucune confirmation après 1 minute, annulation de la commande.',
            components: [],
            embeds: []
        });

        console.error(e);
    }
}

module.exports = { catchPokemon, drawPokemon, checkNewComp }