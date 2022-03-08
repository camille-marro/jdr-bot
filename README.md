# Jdr-bot

## Discord bot that can help you to play RPG Games

### First of all
You need to create a token.js file were you put the token liked to your bot.
token.js need to look like :

```js
const token = 'TOKEN'
exports.token = token
```
You also need to connect the database via an external file named db_connect.js in assets directory\
It have to look like this :
```js
const mysql = require("mysql");

let connection = mysql.createConnection({
    host: 'HOST',
    user: 'USER',
    password: 'PASSWORD',
    database: 'DATABASE'
});

connection.connect(function(err) {
    if (err) {
        return console.error('error: ' + err.message);
    }
    console.log('Connected to database');
});

module.exports = connection;
```
### Available commands for now 
roll : to roll dices\
infos : to get information about personages with his name or ID\
reload : to reload the database infos\
config : to change some parameters\
help: list the commands and explains them

