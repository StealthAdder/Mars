module.exports.run = async (client, message, args) => {
  console.log(args);
  if (message.author.bot) return;
  const { MessageEmbed } = require('discord.js');
  const embed = new MessageEmbed();

  // Ping
  const pg = Math.round(client.ws.ping);
  let emj;
  if (pg <= 100) {
    emj = ':green_circle:';
  } else {
    emj = ':red_circle:';
  }
  embed
    .setTitle('')
    .setColor(0x4c8dcf)
    .setDescription(`**🛰️ Mars Responed ${emj} ${pg}ms**`);
  message.channel.send(embed);
};
module.exports.help = {
  name: 'ping',
  desc: 'Pinging Discord Bot',
  aliases: 'p',
};
