const {
  Client,
  MessageEmbed,
  WebSocketManager,
  Collection,
} = require('discord.js');
const client = new Client();
const embed = new MessageEmbed();
const { Octokit } = require('@octokit/core');
const fs = require('fs');
const dotenv = require('dotenv').config();
const prefix = require('./prefix.json');
const PREFIX = prefix.PREFIX;
const path = require('path');
const express = require('express');

const mars_token = process.env['mars_token'];
const notify_channel = process.env['notify_channel'];
const repository = process.env['repository'];
// console.log(mars_token);

// init Server
const app = express();
const server = require('http').createServer(app);
const PORT = process.env['PORT'];

app.get('/', (req, res) => {
  console.log(Date.now() + ' Ping Received');
  res.sendStatus(200);
});

server.listen(PORT, () => {
  console.log(`Your app is listening on port ${server.address().port}`);
});

app.listen(3000, () => {
  console.log(`Express Server Running on port 3000`);
});

// git Events
const gitCommitFetcher = require('./helper/gitCommitFetcher');
const branchWatcher = require('./helper/branchWatcher');
const neatBranch = require('./helper/neatBranch');

client.commands = new Collection();
const Commands = fs
  .readdirSync('./commands')
  .filter((file) => file.endsWith('.js'));

for (const file of Commands) {
  const commandList = require(`./commands/${file}`);
  client.commands.set(commandList.help.name, commandList);
  client.commands.set(commandList.help.aliases, commandList);
}
console.log(Commands.length + ' files loaded in [ commands ] folder');

client.on('ready', () => {
  // client.user.setActivity('Valorant Crate opening', { type: 'Listening' });
  const Channel = client.channels.cache.get('831359264504545321');
  if (!Channel) return console.log('Invalid channel.');

  // Channel.send('Bot startup.');
  console.log(`${client.user.tag} has Powered Up!!!`);
});

client.on('message', (message) => {
  if (message.author.bot) return;
  let messageArray = message.content.split(' ');
  let cmd = messageArray[0];
  let args = messageArray.slice(1);

  const CommandHandler = () => {
    let commandfile_1 = client.commands.get(cmd.slice(PREFIX.length));
    if (commandfile_1) {
      commandfile_1.run(client, message, args);
    }
  };

  CommandHandler();
});

client.on('ready', () => {
  const Channel = client.channels.cache.get(notify_channel);

  let repo = repository;

  setInterval(async () => {
    // update with api
    await branchWatcher(repo);
    setTimeout(async () => {
      await neatBranch();
    }, 1500);
  }, 19000);

  setInterval(() => {
    fs.access(`./assets/watching.json`, (err) => {
      if (err) {
        console.log(err);
      } else {
        // found
        fs.readFile(`./assets/watching.json`, async (err, content) => {
          let data = JSON.parse(content);
          let branches = data.branch;
          // console.log(branches);
          for (branch of branches) {
            await gitCommitFetcher(repo, branch, Channel);
          }
        });
      }
    });
  }, 100000);
});

client.login(mars_token);
