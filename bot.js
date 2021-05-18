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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = require('http').createServer(app);
const PORT = process.env['PORT'];

app.get('/', (req, res) => {
  console.log(Date.now() + ' Ping Received');
  res.sendStatus(200);
});

server.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${server.address().port}`);
});

app.listen(3000, () => {
  console.log(`Express Server Running..`);
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
  client.user.setStatus('dnd');
  client.user.setActivity('Commits & Patch Updates', {
    type: 'WATCHING',
  });
  // Channel.send('Bot Started.');
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

  if (
    message.content.startsWith(PREFIX) ||
    message.content.startsWith(PREFIX.toUpperCase())
  ) {
    CommandHandler();
  }
});

client.on('ready', () => {
  const Channel = client.channels.cache.get(notify_channel);

  setInterval(async () => {
    // update with api
    let branchList = await branchWatcher(repository);
    // console.log(branchList);
    for (const branch of branchList) {
      await gitCommitFetcher(repository, branch, Channel);
    }
    await neatBranch();
  }, 20000);
});

client.login(mars_token);
