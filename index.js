const Discord = require('discord.js');
const bot = new Discord.Client();

const secrets = require('./cfg/secrets.json');

bot.on('ready', () => console.log(`Logged in as ${bot.user.tag}!`));

bot.on('message', msg => msg.content === 'ping' ? msg.reply('pong') : {});

console.log(JSON.stringify(secrets));

bot.login(secrets.token);
