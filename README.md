# Jdr-bot

## Discord bot for fun and testing dev skills

### For a personal use
You need to create a .env file were you put the token linked to your bot.\
Your .env file need to look like this :

```js
BOT_TOKEN="YOUR_TOKEN"
```

### Available commands for now
ping : to test\
roll : to roll dices\
config : to change some parameters\
help: list the commands and explains them\
ub : to start a game of ultimate bravery for League of Legends\
play : play a youtube video to your channel

There are also actions with voice channels, you can use ```config channels help``` to get more information about that.

### How to use ```play``` commands

#### First method
Create a directory named ```.data``` with a ```youtube.data``` file in it.\
The file should look like this : 
```
{
    "cookie": {
        ...
    },
    "file": true
}
```
To fill up the cookie section you need to go on a Youtube video. Then open the developper console (F12)\
Search for the Network tab and look at the first row. The name should be something like : ```watch?v=***```\
Open it and fin the Request Headers, it should look like this : 
```
:authority: www.youtube.com
:method: GET
:path: /watch?v=***
```

find the cookie sections and copy paste it to your cookie section

#### Second method
Create a file or a section like this : 
```js
const play = require('play-dl');
play.authorization();
```
Then follow the instructions. To find the cookies information just check the first method.
