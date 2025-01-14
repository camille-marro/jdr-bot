const { REST, Routes } = require('discord.js');
require('dotenv').config();

const rest = new REST().setToken(process.env.BOT_TOKEN);

(async () => {
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID),{body: []})
        .then(() => console.log('Successfully deleted all application commands.'))
        .catch(error => console.error(error));
})();
