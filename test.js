const Discord = require('discord.js');
const bot = new Discord.Client();
const secrets = require('./cfg/secrets.json');
const cfg = require('./cfg/config.json');

const roleify = require('./cmd/roleify.js');
const hand = require('./cmd/snakeOil/hand.js');
const play = require('./cmd/snakeOil/play.js');
const startGame = require('./cmd/snakeOil/hand.js');



bot.on('ready', () => console.log(`Logged in as ${bot.user.tag}!`));
bot.on('message', onMessage);

function onMessage(msg) {
  if (msg.author.bot || msg.author === bot.user) {
    return;
  } else {
    // msg.content[0] === cfg.prefix ? console.log(msg.content) : console.log("fail");
    // msg.content === '!ping' ? msg.reply('pong') : {};
    // roleify(msg, [
    //   msg.content,
    //   [0,50,10],
    //   'testing'
    // ]);
    hand(msg, []);
  }
  //msg.content[0] === cfg.prefix ? console.log(msg.content) : console.log("fail");
  //msg.content === '!ping' ? msg.reply('pong') : {};
  // roleify(msg, [
  //   msg.content,
  //   [0,50,10],
  //   'testing'
  // ]);
}



bot.login(secrets.token);
