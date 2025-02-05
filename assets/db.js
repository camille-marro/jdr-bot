const { Sequelize, DataTypes} = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mariadb',
    logging: false,
});

const Pokemon = sequelize.define('Pokemon', {
    ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    captureRate: { type: DataTypes.INTEGER, allowNull: false },
    sex: { type: DataTypes.STRING, allowNull: true },
    eggHatchTime: { type: DataTypes.INTEGER, allowNull: false },
    stade: { type: DataTypes.STRING, allowNull: false },
    evolveID: { type: DataTypes.INTEGER, allowNull: true },
    evolveLvl: { type: DataTypes.INTEGER, allowNull: true },
    size: { type: DataTypes.FLOAT, allowNull: false },
    weight: { type: DataTypes.FLOAT, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    hp: { type: DataTypes.INTEGER, allowNull: false },
    attack: { type: DataTypes.INTEGER, allowNull: false },
    defense: { type: DataTypes.INTEGER, allowNull: false },
    speAttack: { type: DataTypes.INTEGER, allowNull: false },
    speDefense: { type: DataTypes.INTEGER, allowNull: false },
    speed: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'pokemons', timestamps: false, });

const Capacity = sequelize.define('Capacity', {
    ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    pp: { type: DataTypes.INTEGER, allowNull: false },
    power: { type: DataTypes.INTEGER, allowNull: false },
    preci: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'capacities', timestamps: false, });

const Types = sequelize.define('Type', {
    ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
}, { tableName: 'types', timestamps: false, });

const PokemonCapacities = sequelize.define('PokemonCapacity', {
    ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    pokemonID: { type: DataTypes.INTEGER, allowNull: false },
    capacityID: { type: DataTypes.INTEGER, allowNull: false },
    level: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'pokemonCapacities', timestamps: false, });

const PokemonTypes = sequelize.define('PokemonType', {
    ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    pokemonID: { type: DataTypes.INTEGER, allowNull: false },
    typeID: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'pokemonTypes', timestamps: false, });

const PokemonPlayers = sequelize.define('PokemonPlayers', {
    ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    IDDiscord: { type: DataTypes.INTEGER, allowNull: false },
    lastExplore: { type: DataTypes.DATE, allowNull: false },
    lastTraining: { type: DataTypes.DATE, allowNull: false },
    trainingLeft: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'pokemonPlayers', timestamps: false, });

const PokemonPokedex = sequelize.define('PokemonPokedex', {
    ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    IDPlayer: { type: DataTypes.STRING, allowNull: false },
    IDPokemon: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'pokemonPokedex', timestamps: false, });

const PokemonGenerated = sequelize.define('PokemonGenerated', {
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    IDPokemon: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    IDPlayer: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    sex: {
        type: DataTypes.STRING,
        allowNull: false
    },
    size: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    weight: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    level: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    xp: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    type1: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type2: {
        type: DataTypes.STRING,
        allowNull: true
    },
    currentHp: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    maxHp: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    attack: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    defense: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    speAttack: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    speDefense: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    speed: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    IDComp1: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    IDComp2: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    IDComp3: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    IDComp4: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    IVHp: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    IVAttack: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    IVDefense: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    IVSpeAttack: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    IVSpeDefense: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    IVSpeed: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    shiny: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
}, { tableName: 'pokemonGenerated', timestamps: false, });

const JDRSession = sequelize.define('JDRSession', {
    ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    IDUser: {
        type: DataTypes.STRING,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    universe: {
        type: DataTypes.STRING,
        allowNull: false
    },
    setting: {
        type: DataTypes.STRING,
        allowNull: false
    },
    history: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ""
    },
    status: {
        type: DataTypes.ENUM('active', 'terminee'),
        allowNull: false,
        defaultValue: 'active'
    }
}, {tableName: 'JDRSession', timestamps: false});

module.exports = {
    sequelize, Pokemon, Capacity, Types, PokemonCapacities, PokemonTypes, PokemonPlayers, PokemonPokedex, PokemonGenerated, JDRSession
}