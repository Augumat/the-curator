const Discord = require('discord.js');
const bot = new Discord.Client();

const secrets = require('./cfg/secrets.json');
const cfg = require('./cfg/config.json');


bot.on('ready', () => console.log(`Logged in as ${bot.user.tag}!`));
bot.on('message', respond);

function respond(msg)
{
  if (msg.author === bot.user // ignore if the sender is this bot
   || msg.author.bot // ignore if the message is from another bot
   || msg.content.length <= cfg.prefix.length // ignore if the message is too short to have the command prefix
   || msg.content.substring(0, cfg.prefix.length) != cfg.prefix // ignore if the message does not use the command prefix
  ) { return; }



  // msg.content[0] === cfg.prefix ? console.log(msg.content) : console.log("fail");
  // msg.content === '!ping' ? msg.reply('pong') : {};

  // since the message is a command, attempt to parse it
  let args = msg.content.substring(cfg.prefix.length).split(' ');
  switch (args[0]) {
    case 'ping': msg.reply('pong'); break;
    default: break;
  }
}

bot.login(secrets.token);
