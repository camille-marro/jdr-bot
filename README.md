# Jdr-bot

## Discord bot for fun

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
play : play a youtube video on your voice channel\
stop : stop the playing\
pause : pause the playing\
resume : resume the playing\
queue : print the queue\
loop : activate or disable a loop on the queue

There are also actions with voice channels, you can use `config channels help` to get more information about that.

## Comment installer le bot
### Installer node sur le pc
Télécharger le ficher `node-v16.20.0-x64.msi` (lien juste en dessous) :\
https://nodejs.org/download/release/v16.20.0/node-v16.20.0-x86.msi \
Installer node (il faut juste cliquer sur le fichier et suivre les instructions)
### Installer les fichiers du bot
Sur GitHub cliquer sur `<> Code` et `Download ZIP`\
Mettre l'archive dans un dossier et l'extraire (clique droit -> extraire ici)

### Ajouter les fichiers manquant du bot
Dans le dossier principal (là où il ya les fichiers `assets`, `commands`, `json_files`, `main.js`) créer un fichier appelé `.env`\
Faire clique droit sur le fichier puis modifier (ça doit ouvrir le bloc note ou un truc de traitement de texte)\
Ajouter le texte suivant :
```plain text
BOT_TOKEN="TOKEN"
```
Remplacer `TOKEN` par le texte que j'ai mis dans le channel `#installer-bot` sur Discord

### Installer les extensions pour faire marcher le bot
Revenir sur le dossier et faire clique droit puis propriété\
Copier la ligne `Emplacement`\
Ensuite ouvrir l'application `CMD` ou `Invite de commandes` de windows (touche windows puis chercher cmd)\
Faire la suite de commande suivante : 
`cd emplacement` remplacer emplacement par ce que vous avez copié juste avant (l'emplacement du dossier contenant l'archive et maintenant tous les fichiers du bot)\
`npm install` : ça peut prendre du temps, mais il faut juste attendre

### Créer le fichier pour lancer le bot d'un clique
Ensuite n'importe où il faut créer un fichier avec le nom que vous voulez, mais l'extension `.bat` exemple : un fichier appelé `bot.bat`\
Faire clique droit sur le fichier puis modifier (ça doit ouvrir le bloc note ou un truc de traitement de texte)\
Ajouter ce code dans le fichier en remplaçant `emplacement` par ce que vous avez copié tout à l'heure
```plain text
@echo off
cd emplacement
start cmd /k node main.js
```

### Lancer le bot
Pour lancer le bot si vous avez tout bien fait il suffit de double-cliquer sur le fichier `machin.bat`\
Ça devrait ouvrir une console où après quelques secondes vous avez ce texte qui s'affiche :
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
Vous pouvez maintenant utiliser le bot librement sur discord