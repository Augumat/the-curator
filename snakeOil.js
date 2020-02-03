// bot stuff
const Discord = require('discord.js');
const bot = new Discord.Client();
const secrets = require('./cfg/secrets.json');

// the state of the game
var gamestate = {
  phase: '',
  clients: require('./res/snakeOil/clients.json'),
  words: require('./res/snakeOil/words.json'),
  players: [],
  current: {
    activePlayer: 0,
    client: '',
    submissions: []
  },
  history: []
};
shuffleDecks();





// Input Handling
bot.on('message', msg => {
  // Make sure the message is of interest
  if (msg.author.bot || msg.author === bot.user || msg.content[0] != '!') {
    return;
  }

  // Ryan clause
  if (!(msg.author.id === secrets.adminId) && !(gamestate.players.find(x => x.id === msg.author.id))) {
    msg.author.send('nice try');
  }

  // Handle real commands
  let args = msg.content.substring(1).split(' ');
  switch (args[0]) {
    case 'debug':
      if (msg.author.id === secrets.adminId) {
        msg.channel
          .send("```json\n" + gamestate + "\n```");
      }
      break;

    case 'start':
      if (msg.author.id === secrets.adminId && msg.guild && args.length > 1 && gamestate.phase === '') {
        console.log('running the start command\n' + args);
        start(msg, args.slice(1));
      } else {
        msg.channel
          .send(`Don't even try...\n[DELETING...]`)
          .then(msg => msg.delete(1000));
      }
      break;

    case 'play':
      if (gamestate.phase != 'play') {
        msg.delete();
        msg.channel
          .send(`You can only play a card in your DMs with me while the game is in the play phase.\n[DELETING...]`)
          .then(msg => msg.delete(5000));
      } else if (msg.channel.id === gamestate.channel.id) {
        msg.delete();
        gamestate.channel
          .send(`DM the bot commands like this that you don't want other players to see! Don't want to spoil your amazing reveal, do you?\n[DELETING...]`)
          .then(msg => msg.delete(5000));
      } else if (playerIsReady(msg.author.id)) {
        msg.delete();
        author.send(`You've already chosen your product for this turn!`);
      } else if (msg.author.id === gamestate.players[gamestate.current.activePlayer].id) {
        msg.delete();
        gamestate.channel
          .send(`You're the client right now, your job is to vote when the brainstorming phase is over.  Just wait for a minute...\n[DELETING...]`)
          .then(msg => msg.delete(5000));
      } else if (args.length == 3) {
        console.log('running the play command\n' + args);
        play(msg.author, args[1], args[2]);
      } else {
        msg.channel
          .send('Invalid syntax - try `!play <word1> <word2>`\n[DELETING...]')
          .then(msg => msg.delete(5000));
      }
      break;

    case 'vote':
      if (false/*gamestate.phase != 'vote'*/) {
        msg.delete();
        msg.channel
          .send(`Voting can only be done by the player whose turn it is to be the client in the main game channel.\n[DELETING...]`)
          .then(msg => msg.delete(5000));
      } else if (msg.channel.id != gamestate.channel.id) {
        msg.delete();
        msg.channel.send(`This is an important announcement, you should really make it in the main game channel here\n`
          + `https://discordapp.com/channels/` + gamestate.channel.guild.id + `/` + gamestate.channel.id
        );
      } else if (args.length == 2) {
        console.log('running the vote command\n' + args);
        vote(msg, args[1]);
      } else {
        msg.channel
          .send('Invalid syntax - try `!vote <player>`\n[DELETING...]')
          .then(msg => msg.delete(5000));
      }
      break;

    case 'status':
      if (!gamestate.phase) {
        msg.delete();
        msg.channel
          .send(`There is no status to see!  The game has not even begun...\n[DELETING...]`)
          .then(msg => msg.delete(5000));
      } else {
        console.log('running the status command\n' + args);
        status(msg.author);
      }
      break;

    case 'history':
      if (!gamestate.phase) {
        msg.delete();
        gamestate.channel
          .send(`What history do you seek!  The game has not yet begun...\n[DELETING...]`)
          .then(msg => msg.delete(5000));
      } else {
        console.log('running the history command\n' + args);
        history(msg.channel);
      }
      break;

    default:
      msg.channel
        .send(`I've never heard that spell before...\n[DELETING...]`)
        .then(msg => msg.delete(2500));
      break;
  }
});





// start command
function start(msg, players) {
  // Set channel based on the initialization channel
  gamestate.channel = msg.channel;
  // Initialize player list based on passed player ids
  gamestate.players = players
    .map(plyr => msg.guild.members.find(x => `<@!${x.user.id}>` === plyr))
    .map(plyr => {
      plyr.hand = dealWords(8);
      return plyr;
    });
  // Start the first phase of the game
  gamestate.current.activePlayer = 0;
  phasePlaying();
  // Update the players and begin
  msg.channel.send('Game started!\nTry using the command `!status` to begin!');
}
function phasePlaying() {
  // Choose the starting client player
  gamestate.current.client = dealClients(1);
  (gamestate.current.activePlayer === gamestate.players.length - 1) ? gamestate.current.activePlayer = 0
                                                                    : gamestate.current.activePlayer++;
  // Mark the game as started
  gamestate.phase = 'play';
}

// play command
function play(author, word1, word2) {
  // Check for validity and send the submission
  if (playerHasCard(author.id, word1)
   && playerHasCard(author.id, word2)
   && word1 != word2
  ) {
    // Add the submission to the list in current
    gamestate.current.submissions.push({
      playerId: author.id,
      product: word1 + ' ' + word2
    });
    // Remove the cards used from the player's hand
    gamestate.players.find(x => author.id).hand = gamestate.players
      .find(x => author.id)
      .hand
      .filter(x => x != word1 && x != word2)
      .concat(dealWords(2));
    // Update the player on the new state of the game
    status(author);
    // Move on to voting phase if there are enough submissions
    if (gamestate.current.submissions.length === gamestate.players.length - 1) {
      phaseVoting();
    }
  } else {
    //TODO tell player they can't do that
  }
}
function playerHasCard(id, word) {
  return gamestate.players
    .find(x => x.id === id)
    .hand
    .includes(word);
}
function phaseVoting() {
  // Send the summary message to the main player and wait for them to choose after hearing each pitch
  gamestate.players[gamestate.current.activePlayer].send({
    "embed": {
      "title": "Time to choose the product you like the most as a **" + gamestate.current.client + "**!",
      "description": "*Use the command* `!vote <player>` *to choose that person's product.*",
      "url": 'https://discordapp.com/channels/' + gamestate.channel.guild.id + '/' + gamestate.channel.id,
      "color": 14377728,
      "fields": [
        {
          "name": "**Everyone's Choices;**",
          "value": genPlayersStatus(author.id, true)
        }
      ]
    }
  });
  // Mark the game as started
  gamestate.phase = 'vote';
}

// vote command
function vote(author, target) {
  // Check that the target is in the game and / or a valid product
  let winner = gamestate.current.submissions.find(x => x.player === target.substring(3, target.length - 2) || x.product === target);
  if (winner) {
    // Set history episode
    gamestate.history.push({
      client: {
        name: gamestate.current.client,
        username: gamestate.players[gamestate.current.activePlayer].user.username
      },
      product: {
        name: winner.product,
        username: winner.player
      }
    })
    // Reset the submissions
    gamestate.current.submissions = [];
    // Then reset the game to the playing phase
    phasePlaying();
  } else {
    //TODO error
  }
}

// status command
function status(author) {
  author.send({
    "embed": {
      "title": "You're creating a product for a **" + gamestate.current.client + "**!",
      "description": "*Use the command* `!play <word1> <word2>` *to play the specified combination of your word cards (in that order) or the command `!vote <person>` to choose that person's product.*",
      "url": 'https://discordapp.com/channels/' + gamestate.channel.guild.id + '/' + gamestate.channel.id,
      "color": 14377728,
      "fields": [
        {
          "name": "**Your Words;**",
          "value": genHandStatus(author.id)
        },
        {
          "name": "**Player Status;**",
          "value": genPlayersStatus(author.id, false)
        }
      ]
    }
  });
}
function genHandStatus(id) {
  return gamestate.players
    .filter(x => x.id === id)
    .map(x => x.hand)[0]
    .reduce((acc, cur) => acc + '\n' + cur);
}
function genPlayersStatus(id, master) {
  return gamestate.players
    .map(plyr => {
      if (playerIsReady(plyr.id)) {
        return (master || plyr.id === id) ? ':white_check_mark: **' + plyr.user.username + '** [' + gamestate.current.submissions.find(x => x.playerId === id).product + ']'
                                          : ':white_check_mark: ' + plyr.user.username + ' [?????]';
      } else if (gamestate.players[gamestate.current.activePlayer].id === plyr.id) {
        return ':mag: ' + plyr.user.username;
      } else {
        return ':x: ' + plyr.user.username;
      }
    })
    .reduce((acc, cur) => acc + '\n' + cur);
}

// history command
function history(channel) {
  channel.send({
    "embed": {
      "title": "What a memorable session! (I remember everything)",
      "url": 'https://discordapp.com/channels/' + gamestate.channel.guild.id + '/' + gamestate.channel.id,
      "color": 14377728,
      "fields": genBodyHistory()
    }
  });
}
function genBodyHistory() {
  return gamestate.history.map(x => {
    return {
      name: '**' + x.client.username + ' was a ' + x.client.name + '**',
      value: '' + x.product.username + ' sold them a ' + x.product.name + '!'
    };
  });
}

// card helper methods
function shuffleDecks() {
  // Shuffle the clients
  let swap = '';
  for (let i = gamestate.clients.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    swap                 = gamestate.clients[i];
    gamestate.clients[i] = gamestate.clients[j];
    gamestate.clients[j] = swap                ;
  }
  // Shuffle the words
  for (let i = gamestate.words.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    swap               = gamestate.words[i];
    gamestate.words[i] = gamestate.words[j];
    gamestate.words[j] = swap              ;
  }
}
function dealClients(num) {
  if (gamestate.clients.length >= num) {
    return gamestate.clients.splice(0, num);
  } else {
    return console.log('[ERROR] : snakeOil.dealClients() attempt failed, num larger than clients array');
  }
}
function dealWords(num) {
  if (gamestate.words.length >= num) {
    return gamestate.words.splice(0, num);
  } else {
    return console.log('[ERROR] : snakeOil.dealWords() attempt failed, num larger than words array');
  }
}

// player status helper methods
function playerIsReady(id) {
  return gamestate.current.submissions
    .find(x => x.playerId === id);
}





// Bot initialization junk
bot.on('ready', () => console.log(`Logged in as ${bot.user.tag} and awaiting game initialization!`));
bot.login(secrets.token);
