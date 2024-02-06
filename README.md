# Jdr-bot

## Discord bot for fun

### How to use it
You need to download the following files then, you need to create a .env file where you'll put the token linked to your bot.\
Your .env file needs to look like this :

```js
BOT_TOKEN="YOUR_TOKEN"
```
Then run ```npm install``` to install the correct dependencies the bot need to have to work. When it's done you'll just have to do a ```npm start``` or ```node main.js``` to start the bot.\
When it's started, if everything works correctly, you're supposed to have a message that look like this in your console :

```plain text
Connected to Discord server
----------------
Configuration :
- prefix : *
- language : fr
- voice channels :
-- secret tunnel E : tunnel secret E    
-- secret tunnel S : tunnel secret S    
-- kick channel : vide
-- safety net : filet de sécurité       
-- mystery machine : The Mystery Machine
-- bong channel: très grand bâton       
----------------
```

### Available commands for now
 - help : display a help message on the channel
 - ping : test the bot connection via Discord
 - roll : roll dices
 - config : change the bot configuration like the prefix
 - League of legends related commands :
   - ub : start a game of Ultimate Bravery
   - rank : find someone rank with his in-game pseudo and region
   - update : update the Riot API key
 - Music related commands :
   - play : start to play a sing with a youtube link or key terms
   - pause : pause the playing
   - resume : resume the playing
   - queue : display the playing queue
   - skip : skip the current song that is played
   - remove : remove a song from the queue
   - loop : start to loop the queue
   - stop : stop the playing and disconnect the bot from the vocal channel
 - log : manage logs via Discord
 - meme : share meme with the Discord server
 - movie : share movie with the Discord server
 - jdr : special commands created for personal uses, described lower
 - game : a little game where you can loot weapons and try to kill your friend on the server

There is also what I call "voice commands", these are special voice channel that you can interact with for specific behaviour. \
Here the list :
 - kick channel : instant kick you out of the server when you enter it
 - Mystery Machine channel : when someone enters the channel it will move around in the server with everyone in it
 - safety net channel : when you try to leave the channel it will remove you in unless you disconnect
 - bong : when entering it disconnect someone stuck in the safety net channel
 - tunnels : when entering the entry of the tunnel moved you in one of the exits

All of these "commands" are configurable with the ```config``` command.

##  How is the bot working

All the data that it might have to store are stored in local in JSON files. Those files are located in ```./json_files```.

There is also a logging system that logs every command used by the bot with a time code and the author of the command. Those logs are stored in the ```logs.txt``` file.

