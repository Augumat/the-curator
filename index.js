const Discord = require('discord.js');
const bot = new Discord.Client();

const secrets = require('./cfg/secrets.json');
const cfg = require('./cfg/config.json');

bot.on('ready', () => console.log(`Logged in as ${bot.user.tag}!`));
bot.on('message', onMessage);

function onMessage(msg)
{
    //if (!msg.author === bot.user && !msg.author.bot) {

        // msg.content[0] === cfg.prefix ? console.log(msg.content) : console.log("fail");
        // msg.content === '!ping' ? msg.reply('pong') : {};
        if (msg.content[0] != '!') {
            return;
        }

        var args = msg.content.split(' ');
        if (args[0] === '!addEmote') {
            if (args.length != 3) {
                msg.reply('Correct usage is `!addEmote <name> <link>`');
                return;
            }
            msg.guild.createEmoji(args[2], args[1])
                .then(emoji => {
                    console.log(`Created new emote with name ${emoji.name}`);
                    msg.reply(`Created new emote with name ${emoji.name}`);
                })
                .catch(console.error);

        } else if (args[0] === '!react') {
            if (!(args.length == 2 || args.length == 3)) {
                msg.reply('Correct usage is `!react <emote>` or `!react <emote> <messageLink>`');
                return;
            }
            if (args.length == 2) {
                msg.channel.fetchMessages({ limit: 2 })
                    .then(msgs => msgs.last().react(bot.emojis.find(emoji => emoji.name === args[1])))
                    .then(() => msg.delete());
            } else if (args.length == 3) {
                let location = args[2]
                    .substring(32)
                    .split("\/");
                if (location.length != 3) {
                    return;
                }
                console.log(location[1]);
                try {
                    msg.channel
                        .fetchMessage(location[2])
                        .then(msg => msg.react(bot.emojis.find(emoji => emoji.name === args[1])))
                        .then(() => msg.delete());

                } catch (err) {
                    console.log(err);
                }

            }
        } else if (args[0] === '!emote') {
            if (args.length != 2) {
                msg.reply('Correct usage is `!emote <name>`');
                return;
            }
            // let tempEmote = ;
            msg.reply(
                '<' + ((bot.emojis.find(emoji => emoji.name === args[1]).animated) ? "a:" : ":") +
                bot.emojis.find(emoji => emoji.name === args[1]).identifier +
                '>'
            ).then(() => msg.delete());
        }
    //}
}

bot.login(secrets.token);
