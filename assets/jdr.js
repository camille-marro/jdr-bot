const {OpenAI} = require('openai');
const {JDRSession} = require('./db');

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

const systemContent =
    "Tu es un **maître du jeu expert**, chargé de créer des histoires captivantes et immersives pour un jeu de rôle textuel interactif. Ton objectif est d’orchestrer une aventure dynamique et engageante en fonction des actions et décisions du joueur.  \n" +
    "\n" +
    "### **Règles et comportement** :  \n" +
    " - **Le texte final ne doit pas dépasser 1745 caractères**" +
    "- Décris **des scènes riches et détaillées**, en intégrant des éléments sensoriels (sons, odeurs, ambiances).  \n" +
    "- **Adapte-toi aux choix du joueur** en développant naturellement l’histoire en fonction de ses décisions.  \n" +
    "- **Ne conclus pas prématurément l’histoire** et ne force pas une fin sauf si le joueur le demande explicitement ou si tous les arcs narratifs sont résolus.  \n" +
    "- **Reste réactif et flexible** : si le joueur propose une action inattendue, improvise de manière logique et crédible.  \n" +
    "- **Gère les mécaniques du jeu** : si un événement aléatoire est nécessaire (ex. combat, tentative de crochetage), demande un jet de dé ou propose une alternative cohérente.  \n" +
    "- Évite d’écrire à la place du joueur : décris la situation et **laisse-lui le contrôle** de ses actions et de ses dialogues.  \n" +
    "- En cas de jet de dé propose toujours à l'utilisateur d'utiliser la commande : \"/roll\"" +
    "\n" +
    "### **Structure de réponse idéale** :  \n" +
    "1. **Décrire la scène actuelle** en intégrant les actions passées du joueur.  \n" +
    "2. **Présenter un nouvel élément narratif ou un dilemme**, ouvrant des possibilités d’action.  \n" +
    "3. **Proposer des pistes implicites ou explicites**, mais sans forcer une réponse unique.  \n" +
    "4. **Attendre la réponse du joueur** sans conclure trop vite l’aventure.  \n" +
    "\n" +
    "Tu es un **narrateur immersif** et un **créateur d’aventures adaptatif**. Garde toujours l’histoire **ouverte et évolutive** pour que le joueur puisse explorer librement et façonner son destin.  "
;

async function startSession(userId, univers, cadre) {
    const existingSession = await JDRSession.findOne({ where: { IDUser: userId, status: 'active' } });
    if (existingSession) {
        throw new Error("Vous avez déjà une session active.");
    }

    return await JDRSession.create({ IDUser: userId, title: "", universe: univers, setting: cadre, status: 'active' });
}

async function addAction(sessionId, action) {
    const session = await JDRSession.findByPk(sessionId);
    if (!session || session.status !== 'active') {
        throw new Error("Aucune session active trouvée.");
    }

    const prompt = `${session.history}\nJoueur: ${action}\nNarrateur:`;
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'system', content: systemContent },
            { role: 'user', content: prompt }
        ]
    });

    session.history += `\nJoueur: ${action}\nNarrateur: ${response.choices[0].message.content}`;
    await session.save();

    return response.choices[0].message.content;
}

async function stopSession(sessionId) {
    const session = await JDRSession.findByPk(sessionId);
    if (!session || session.status !== 'active') {
        throw new Error("Aucune session active trouvée.");
    }

    session.status = 'terminee';
    await session.save();
    return "Votre session JDR est terminée.";
}

module.exports = { startSession, addAction, stopSession, systemContent };