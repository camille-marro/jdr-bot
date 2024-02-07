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

All of those "commands" are configurable with the ```config``` command.

##  How is the bot working ?

The bot is using the [DiscordJS](https://discord.js.org/#/) node module to interact with the Discord API. To play sounds the bot uses the [discord-player](https://www.npmjs.com/package/discord-player) framework. To interact with the Riot API it uses [Axios](https://www.npmjs.com/package/axios) node module.

All the data that might have to be stored, are stored in local  JSON files. Those files are located in ```./json_files```. If you want to use a database, you will have to use a NoSQL one to store the data.

There is also a logging system that logs every command used by the bot with a time code and the author of the command. Those logs are stored in the ```logs.txt``` file.

## Why did I develop this bot ?

In first place I just needed to have a bot that can simulate dice rolling and be used by more people than just myself. But with the developing going on, I just liked it and so I started to improve the bot depending on my friends and my problems.

Currently, the bot have a lot of commands and just a few of them are used often and I want to focus on keeping the development of those commands (jdr, music).

## What's next ?

Because this bot is not meant to be publicly used, I'll just keep developing commands linked to my ideas and my friends ones.