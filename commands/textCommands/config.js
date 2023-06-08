let fs = require('fs');
let path = require('path');

let config = require('../../assets/config.js');
const createEmbed = require('../../assets/createEmbed.js');

function configCommand (message) {
    let rawJSONEmbed = fs.readFileSync(path.resolve(__dirname, '../../json_files/embed_msg/' + config['config']['lang'] + '.json'));
    let JSONEmbed = JSON.parse(rawJSONEmbed);

    let msg = message.content;

    let options = msg.split(" ")
    if (options[1] === "print") {
        if (options[2] === "help") {
            let msgConfigPrintHelpEmbed = createEmbed(JSONEmbed['msgConfigPrintHelpEmbed']['color'], JSONEmbed['msgConfigPrintHelpEmbed']['title'], JSONEmbed['msgConfigPrintHelpEmbed']['thumbnail'], JSONEmbed['msgConfigPrintHelpEmbed']['description'], JSONEmbed['msgConfigPrintHelpEmbed']['field'], []);
            message.channel.send({embeds: [msgConfigPrintHelpEmbed]});
            console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for config print command.");
        }
        else {
            config.printConfigEmbed(message.channel);
            config.printConfig();
            console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") printed config");
        }
    }
    else if (options[1] === "lang") {
        if (options[2] === "fr" || options[2] === "en") {
            let prevLang = config['config']['lang'];
            config['config']['lang'] = options[2];
            config.changeConfig(config.config);

            let embedOptions = [];
            embedOptions['!strConfig'] = "prefix : " + config['config']['prefix'] + " - lang : " + config['config']['lang'];

            let msgConfigLangSuccessEmbed = createEmbed(JSONEmbed['msgConfigLangSuccessEmbed']['color'], JSONEmbed['msgConfigLangSuccessEmbed']['title'], JSONEmbed['msgConfigLangSuccessEmbed']['thumbnail'], JSONEmbed['msgConfigLangSuccessEmbed']['description'], JSONEmbed['msgConfigLangSuccessEmbed']['field'], embedOptions)
            message.channel.send({embeds: [msgConfigLangSuccessEmbed]});
            console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") changed language from " + prevLang + " to " + config['config']['lang']);
        }
        else if (options[2] === "help") {
            let msgConfigLangHelpEmbed = createEmbed(JSONEmbed['msgConfigLangHelpEmbed']['color'], JSONEmbed['msgConfigLangHelpEmbed']['title'], JSONEmbed['msgConfigLangHelpEmbed']['thumbnail'], JSONEmbed['msgConfigLangHelpEmbed']['description'], JSONEmbed['msgConfigLangHelpEmbed']['field'], []);
            message.channel.send({embeds: [msgConfigLangHelpEmbed]});
            console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for config lang command.");
        }
        else {
            let msgConfigLangErrorLangEmbed = createEmbed(JSONEmbed['msgConfigLangErrorLangEmbed']['color'], JSONEmbed['msgConfigLangErrorLangEmbed']['title'], JSONEmbed['msgConfigLangErrorLangEmbed']['thumbnail'], JSONEmbed['msgConfigLangErrorLangEmbed']['description'], JSONEmbed['msgConfigLangErrorLangEmbed']['field'], [])
            message.channel.send({embeds: [msgConfigLangErrorLangEmbed]});
            console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to change language");
        }
    }
    else if (options[1] === "prefix") {
        if (options[2] === "help") {
            let msgConfigPrefixHelpEmbed = createEmbed(JSONEmbed['msgConfigPrefixHelpEmbed']['color'], JSONEmbed['msgConfigPrefixHelpEmbed']['title'], JSONEmbed['msgConfigPrefixHelpEmbed']['thumbnail'], JSONEmbed['msgConfigPrefixHelpEmbed']['description'], JSONEmbed['msgConfigPrefixHelpEmbed']['field'], []);
            message.channel.send({embeds: [msgConfigPrefixHelpEmbed]});
            console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for config prefix command.");
            return;
        }
        if (options[2] === undefined) {
            let msgConfigLangErrorPrefixEmbed = createEmbed(JSONEmbed['msgConfigLangErrorPrefixEmbed']['color'], JSONEmbed['msgConfigLangErrorPrefixEmbed']['title'], JSONEmbed['msgConfigLangErrorPrefixEmbed']['thumbnail'], JSONEmbed['msgConfigLangErrorPrefixEmbed']['description'], JSONEmbed['msgConfigLangErrorPrefixEmbed']['field'], [])
            message.channel.send({embeds: [msgConfigLangErrorPrefixEmbed]});
            console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to change prefix with an empty one");
            return;
        }
        if (options[2].length > 1) {
            let msgConfigLangErrorPrefixLengthEmbed= createEmbed(JSONEmbed['msgConfigLangErrorPrefixLengthEmbed']['color'], JSONEmbed['msgConfigLangErrorPrefixLengthEmbed']['title'], JSONEmbed['msgConfigLangErrorPrefixLengthEmbed']['thumbnail'], JSONEmbed['msgConfigLangErrorPrefixLengthEmbed']['description'], JSONEmbed['msgConfigLangErrorPrefixLengthEmbed']['field'], [])
            message.channel.send({embeds: [msgConfigLangErrorPrefixLengthEmbed]});
            console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to change prefix with a too long one");
            return;
        }
        let prevPrefix = config['config']['prefix'];
        config['config']['prefix'] = options[2];
        config.changeConfig(config.config);

        let embedOptions = [];
        embedOptions['!strConfig'] = "prefix : " + config['config']['prefix'] + " - lang : " + config['config']['lang'];

        let msgConfigLangSuccessEmbed = createEmbed(JSONEmbed['msgConfigLangSuccessEmbed']['color'], JSONEmbed['msgConfigLangSuccessEmbed']['title'], JSONEmbed['msgConfigLangSuccessEmbed']['thumbnail'], JSONEmbed['msgConfigLangSuccessEmbed']['description'], JSONEmbed['msgConfigLangSuccessEmbed']['field'], embedOptions)
        message.channel.send({embeds: [msgConfigLangSuccessEmbed]});
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") chhanged prefix from " + prevPrefix + " to " + config['config']['prefix']);
    }
    else if (options[1] === "channels") {
        let rawJSONEmbed = fs.readFileSync("json_files/embed_msg/" + config['config']['lang'] + ".json");
        let JSONEmbed = JSON.parse(rawJSONEmbed);

        if (options[2] === "help") {
            let msgConfigChannelsHelpEmbed = createEmbed(JSONEmbed['msgConfigChannelsHelpEmbed']['color'], JSONEmbed['msgConfigChannelsHelpEmbed']['title'], JSONEmbed['msgConfigChannelsHelpEmbed']['thumbnail'], JSONEmbed['msgConfigChannelsHelpEmbed']['description'], JSONEmbed['msgConfigChannelsHelpEmbed']['field'], []);
            message.channel.send({embeds: [msgConfigChannelsHelpEmbed]});
            console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for config channels command.");
        }
        else if (options[2] === "secret_tunnel") {
            if (options[3] === "help") {
                let msgConfigChannelsSTHelpEmbed = createEmbed(JSONEmbed['msgConfigChannelsSTHelpEmbed']['color'], JSONEmbed['msgConfigChannelsSTHelpEmbed']['title'], JSONEmbed['msgConfigChannelsSTHelpEmbed']['thumbnail'], JSONEmbed['msgConfigChannelsSTHelpEmbed']['description'], JSONEmbed['msgConfigChannelsSTHelpEmbed']['field'], []);
                message.channel.send({embeds: [msgConfigChannelsSTHelpEmbed]});
                console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for config channels secret_tunnel command.");
            }
            else if (options[3] === "E") {
                for (let i = 5; i < options.length; i++) {
                    options[4] += " " + options[i];
                }
                let new_channel = message.guild.channels.cache.find(channel => channel.name === options[4]);
                if (new_channel) {
                    let prevName = config['config']['voice channels']['secret tunnel']['E']['name'];
                    let prevID = config['config']['voice channels']['secret tunnel']['E']['id'];
                    config['config']['voice channels']['secret tunnel']['E']['name'] = new_channel.name;
                    config['config']['voice channels']['secret tunnel']['E']['id'] = new_channel.id;
                    config.changeConfig(config.config);

                    let embedOptions = [];
                    if (config['config']['lang'] === "fr") {
                        embedOptions['!str1'] = "Changement du salon secret_tunnel E";
                        embedOptions['!str2'] = "Le salon d'entrée du tunnel secret est désormais le salon avec le nom " + new_channel.name;
                    } else if (config['config']['lang'] === "en") {
                        embedOptions['!str1'] = "Changing secret_tunnel E channel";
                        embedOptions['!str2'] = "The new name of the secret tunnel entrace is " + new_channel.name;
                    }

                    let msgSuccessConfigVoiceChannelsEmbed = createEmbed(JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['color'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['title'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['thumbnail'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['description'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['field'], embedOptions)
                    message.channel.send({embeds: [msgSuccessConfigVoiceChannelsEmbed]});


                    console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") changed secret tunnel entrace");
                    console.log("|-- from " + prevName + "(#" + prevID + ") for " + config['config']['voice channels']['secret tunnel']['E']['name'] + "(#" + config['config']['voice channels']['secret tunnel']['E']['id'] + ")");
                } else {
                    //console.log("channel existe pas starf");
                    let msgSyntaxErrorConfigVoiceChannelsEmbed = createEmbed(JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['color'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['title'],  JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['thumbnail'],JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['description'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['field'], [])
                    message.channel.send({embeds: [msgSyntaxErrorConfigVoiceChannelsEmbed]});
                    console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to change secret tunnel entrace with an unexisting channel");
                }
            }
            else if (options[3] === "S") {
                for (let i = 5; i < options.length; i++) {
                    options[4] += " " + options[i];
                }
                let new_channel = message.guild.channels.cache.filter(channel => channel.name === options[4]);
                if (new_channel.size == 0) {
                    console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to change secret tunnel exit with an unexisting channel");
                    let msgSyntaxErrorConfigVoiceChannelsEmbed = createEmbed(JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['color'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['title'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['thumbnail'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['description'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['field'], [])
                    message.channel.send({embeds: [msgSyntaxErrorConfigVoiceChannelsEmbed]});
                    return
                }
                let new_channel_ids = [];
                let prevName = config['config']['voice channels']['secret tunnel']['S']['name'];
                let prevIDs = config['config']['voice channels']['secret tunnel']['S']['ids'];
                new_channel.forEach((channel) => {
                    config['config']['voice channels']['secret tunnel']['S']['name'] = channel.name;
                    new_channel_ids.push(channel.id.toString());
                });
                config['config']['voice channels']['secret tunnel']['S']['ids'] = new_channel_ids;
                config.changeConfig(config.config);

                let embedOptions = [];
                if (config['config']['lang'] === "fr") {
                    embedOptions['!str1'] = "Changement du salon secret_tunnel S";
                    embedOptions['!str2'] = "Le ou les salon(s) de sortie du tunnel seccret est/sont désormais le/les salon(s) avec le(s) nom(s) " + config['config']['voice channels']['secret tunnel']['S']['name'];
                } else if (config['config']['lang'] === "en") {
                    embedOptions['!str1'] = "Changing secret_tunnel S channel";
                    embedOptions['!str2'] = "The new name(s) of the secret tunnel exit(s) is/are " + config['config']['voice channels']['secret tunnel']['S']['name'];
                }
                let msgSuccessConfigVoiceChannelsEmbed = createEmbed(JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['color'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['title'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['thumbnail'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['description'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['field'], embedOptions)
                message.channel.send({embeds: [msgSuccessConfigVoiceChannelsEmbed]});


                console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") change secret tunnel exit");
                console.log("|-- from " + prevName + "(" + prevIDs + ")");
                console.log("|-- for " + config['config']['voice channels']['secret tunnel']['S']['name'] + " (" + config['config']['voice channels']['secret tunnel']['S']['ids'] + ")");
            }
            else {
                console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to change secrets tunnels");
                let msgSyntaxErrorConfigVoiceChannelsEmbed = createEmbed(JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['color'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['title'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['thumbnail'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['description'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['field'], [])
                message.channel.send({embeds: [msgSyntaxErrorConfigVoiceChannelsEmbed]});
            }
        }
        else if (options[2] === "kick_channel") {
            if (options[3] === "help") {
                let msgConfigChannelsKCHelpEmbed = createEmbed(JSONEmbed['msgConfigChannelsKCHelpEmbed']['color'], JSONEmbed['msgConfigChannelsKCHelpEmbed']['title'], JSONEmbed['msgConfigChannelsKCHelpEmbed']['thumbnail'], JSONEmbed['msgConfigChannelsKCHelpEmbed']['description'], JSONEmbed['msgConfigChannelsKCHelpEmbed']['field'], []);
                message.channel.send({embeds: [msgConfigChannelsKCHelpEmbed]});
                console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for config channels kick_channel command.");
                return;
            }
            for (let i = 4; i < options.length; i++) {
                options[3] += " " + options[i];
            }
            let new_channel = message.guild.channels.cache.find(channel => channel.name === options[3]);
            if (new_channel) {
                let prevName = config['config']['voice channels']['kick channel']['name'];
                let prevID = config['config']['voice channels']['kick channel']['id'];
                config['config']['voice channels']['kick channel']['name'] = new_channel.name;
                config['config']['voice channels']['kick channel']['id'] = new_channel.id;
                config.changeConfig(config.config);

                let embedOptions = [];
                if (config['config']['lang'] === "fr") {
                    embedOptions['!str1'] = "Changement du salon kick_channel";
                    embedOptions['!str2'] = "Le salon kick est désormais le salon avec le nom " + new_channel.name;
                } else if (config['config']['lang'] === "en") {
                    embedOptions['!str1'] = "Changing kick_channel";
                    embedOptions['!str2'] = "The new name of the kick channel is " + new_channel.name;
                }

                let msgSuccessConfigVoiceChannelsEmbed = createEmbed(JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['color'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['title'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['thumbnail'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['description'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['field'], embedOptions)
                message.channel.send({embeds: [msgSuccessConfigVoiceChannelsEmbed]});


                console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") changed kick channel");
                console.log("|-- from " + prevName + "(#" + prevID + ") to " + config['config']['voice channels']['kick channel']['name'] + "(#" + config['config']['voice channels']['kick channel']['id'] + ")");
            } else {
                //console.log("channel existe pas starf");
                console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to change kick channel with an unexisting channel");
                let msgSyntaxErrorConfigVoiceChannelsEmbed = createEmbed(JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['color'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['title'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['thumbnail'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['description'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['field'], [])
                message.channel.send({embeds: [msgSyntaxErrorConfigVoiceChannelsEmbed]});
            }
        }
        else if (options[2] === "safety_net") {
            if (options[3] === "help") {
                let msgConfigChannelsSNHelpEmbed = createEmbed(JSONEmbed['msgConfigChannelsSNHelpEmbed']['color'], JSONEmbed['msgConfigChannelsSNHelpEmbed']['title'], JSONEmbed['msgConfigChannelsSNHelpEmbed']['thumbnail'], JSONEmbed['msgConfigChannelsSNHelpEmbed']['description'], JSONEmbed['msgConfigChannelsSNHelpEmbed']['field'], []);
                message.channel.send({embeds: [msgConfigChannelsSNHelpEmbed]});
                console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for config channels safety_net command.");
                return;
            }
            for (let i = 4; i < options.length; i++) {
                options[3] += " " + options[i];
            }
            let new_channel = message.guild.channels.cache.find(channel => channel.name === options[3]);
            if (new_channel) {
                let prevName = config['config']['voice channels']['safety net']['name'];
                let prevID = config['config']['voice channels']['safety net']['id'];
                config['config']['voice channels']['safety net']['name'] = new_channel.name;
                config['config']['voice channels']['safety net']['id'] = new_channel.id;
                config.changeConfig(config.config);

                let embedOptions = [];
                if (config['config']['lang'] === "fr") {
                    embedOptions['!str1'] = "Changement du salon safety_net";
                    embedOptions['!str2'] = "Le salon filet de sécurité est désormais le salon avec le nom " + new_channel.name;
                } else if (config['config']['lang'] === "en") {
                    embedOptions['!str1'] = "Changing safety_net channel";
                    embedOptions['!str2'] = "The new name of the safety net channel is " + new_channel.name;
                }
                let msgSuccessConfigVoiceChannelsEmbed = createEmbed(JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['color'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['title'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['thumbnail'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['description'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['field'], embedOptions)
                message.channel.send({embeds: [msgSuccessConfigVoiceChannelsEmbed]});


                console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") change safety net");
                console.log("|-- from " + prevName + "(#" + prevID + ") to " + config['config']['voice channels']['safety net']['name'] + "(#" + config['config']['voice channels']['safety net']['id'] + ")");
            } else {
                //console.log("channel existe pas starf");
                console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to change safety net with an unexisting channel");
                let msgSyntaxErrorConfigVoiceChannelsEmbed = createEmbed(JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['color'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['title'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['thumbnail'],JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['description'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['field'], [])
                message.channel.send({embeds: [msgSyntaxErrorConfigVoiceChannelsEmbed]});
            }
        }
        else if (options[2] === "mystery_machine") {
            if (options[3] === "help") {
                let msgConfigChannelsMMHelpEmbed = createEmbed(JSONEmbed['msgConfigChannelsMMHelpEmbed']['color'], JSONEmbed['msgConfigChannelsMMHelpEmbed']['title'], JSONEmbed['msgConfigChannelsMMHelpEmbed']['thumbnail'], JSONEmbed['msgConfigChannelsMMHelpEmbed']['description'], JSONEmbed['msgConfigChannelsMMHelpEmbed']['field'], []);
                message.channel.send({embeds: [msgConfigChannelsMMHelpEmbed]});
                console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for config channels mystery_machine command.");
                return;
            }
            for (let i = 4; i < options.length; i++) {
                options[3] += " " + options[i];
            }
            let new_channel = message.guild.channels.cache.find(channel => channel.name === options[3]);
            if (new_channel) {
                let prevName = config['config']['voice channels']['mystery machine']['name'];
                let prevID = config['config']['voice channels']['mystery machine']['id'];
                config['config']['voice channels']['mystery machine']['name'] = new_channel.name;
                config['config']['voice channels']['mystery machine']['id'] = new_channel.id;
                config.changeConfig(config.config);

                let embedOptions = [];
                if (config['config']['lang'] === "fr") {
                    embedOptions['!str1'] = "Changement du salon mystery machine";
                    embedOptions['!str2'] = "Le salon mystery machine est désormais le salon avec le nom " + new_channel.name;
                } else if (config['config']['lang'] === "en") {
                    embedOptions['!str1'] = "Changing mystery_machine channel";
                    embedOptions['!str2'] = "The new name of mystery machine channel is " + new_channel.name;
                }

                let msgSuccessConfigVoiceChannelsEmbed = createEmbed(JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['color'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['title'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['thumbnail'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['description'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['field'], embedOptions)
                message.channel.send({embeds: [msgSuccessConfigVoiceChannelsEmbed]});


                console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") change mystery machine");
                console.log("|-- from " + prevName + "(#" + prevID + ") to " + config['config']['voice channels']['mystery machine']['name'] + "(#" + config['config']['voice channels']['mystery machine']['id'] + ")");
            } else {
                //console.log("channel existe pas starf");
                console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to mystery machine net with an unexisting channel");
                let msgSyntaxErrorConfigVoiceChannelsEmbed = createEmbed(JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['color'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['title'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['thumbnail'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['description'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['field'], [])
                message.channel.send({embeds: [msgSyntaxErrorConfigVoiceChannelsEmbed]});
            }
        }
        else if (options[2] === "bong_channel") {
            if (options[3] === "help") {
                let msgConfigChannelsBCHelpEmbed = createEmbed(JSONEmbed['msgConfigChannelsBCHelpEmbed']['color'], JSONEmbed['msgConfigChannelsBCHelpEmbed']['title'], JSONEmbed['msgConfigChannelsBCHelpEmbed']['thumbnail'], JSONEmbed['msgConfigChannelsBCHelpEmbed']['description'], JSONEmbed['msgConfigChannelsBCHelpEmbed']['field'], []);
                message.channel.send({embeds: [msgConfigChannelsBCHelpEmbed]});
                console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for config channels bong_channel command.");
                return;
            }
            for (let i = 4; i < options.length; i++) {
                options[3] += " " + options[i];
            }
            let new_channel = message.guild.channels.cache.find(channel => channel.name === options[3]);
            if (new_channel) {
                let prevName = config['config']['voice channels']['bong']['name'];
                let prevID = config['config']['voice channels']['bong']['id'];
                config['config']['voice channels']['bong']['name'] = new_channel.name;
                config['config']['voice channels']['bong']['id'] = new_channel.id;
                config.changeConfig(config.config);

                let embedOptions = [];
                if (config['config']['lang'] === "fr") {
                    embedOptions['!str1'] = "Changement du salon bong_channel";
                    embedOptions['!str2'] = "Le salon bong est désormais le salon avec le nom " + new_channel.name;
                } else if (config['config']['lang'] === "en") {
                    embedOptions['!str1'] = "Changing bong_channel";
                    embedOptions['!str2'] = "The new name of the bong channel is " + new_channel.name;
                }

                let msgSuccessConfigVoiceChannelsEmbed = createEmbed(JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['color'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['title'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['thumbnail'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['description'], JSONEmbed['msgSuccessConfigVoiceChannelsEmbed']['field'], embedOptions)
                message.channel.send({embeds: [msgSuccessConfigVoiceChannelsEmbed]});


                console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") change bong");
                console.log("|-- from " + prevName + "(#" + prevID + ") to " + config['config']['voice channels']['bong']['name'] + "(#" + config['config']['voice channels']['bong']['id'] + ")");
            } else {
                console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to change bong with an unexisting channel");
                let msgSyntaxErrorConfigVoiceChannelsEmbed = createEmbed(JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['color'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['title'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['thumbnail'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['description'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['field'], [])
                message.channel.send({embeds: [msgSyntaxErrorConfigVoiceChannelsEmbed]});
            }
        }
        else {
            console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to change an unexisting voice channel");
            let msgSyntaxErrorConfigVoiceChannelsEmbed = createEmbed(JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['color'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['title'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['thumbnail'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['description'], JSONEmbed['msgSyntaxErrorConfigVoiceChannelsEmbed']['field'], [])
            message.channel.send({embeds: [msgSyntaxErrorConfigVoiceChannelsEmbed]});
        }
    }
    else if (options[1] === "help") {
        let msgConfigHelpEmbed = createEmbed(JSONEmbed['msgConfigHelpEmbed']['color'], JSONEmbed['msgConfigHelpEmbed']['title'],  JSONEmbed['msgConfigHelpEmbed']['thumbnail'], JSONEmbed['msgConfigHelpEmbed']['description'], JSONEmbed['msgConfigHelpEmbed']['field'], []);
        message.channel.send({embeds: [msgConfigHelpEmbed]});
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") asked help for config command.");
    }
    else {
        let msgConfigLangErrorEmbed = createEmbed(JSONEmbed['msgConfigLangErrorEmbed']['color'], JSONEmbed['msgConfigLangErrorEmbed']['title'], JSONEmbed['msgConfigLangErrorEmbed']['thumbnail'], JSONEmbed['msgConfigLangErrorEmbed']['description'], JSONEmbed['msgConfigLangErrorEmbed']['field'], [])
        message.channel.send({embeds: [msgConfigLangErrorEmbed]});
        console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to change configuration");
    }
}

module.exports = {
    configCommand
}