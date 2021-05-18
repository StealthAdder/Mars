const messenger = async (client, repo, branch, Channel) => {
  // console.log(`commitFetcher: ${repo}/${branch}`);
  const { MessageEmbed } = require('discord.js');
  const { Octokit } = require('@octokit/core');
  const fs = require('fs');
  const dotenv = require('dotenv').config();
  const auth_token = process.env['auth_token'];
  const octokit = new Octokit({
    auth: auth_token,
  });
  const embed = new MessageEmbed();

  const commitInfo = await octokit.request(
    'GET /repos/{owner}/{repo}/commits/{branch}',
    {
      owner: 'StealthAdder',
      repo: repo,
      branch: branch,
    }
  );
  const res = await commitInfo.data;
  const { sha, parents, commit, stats, files, author, html_url } = await res;

  // console.log(sha);
  // console.log(parents);
  const currentSha = sha;
  let parentSha;
  if (parents.length === 0) {
    parentSha = null;
  } else {
    parentSha = parents[0].sha;
  }
  // console.log(parentSha);
  // console.log(currentSha);
  //
  let fileList = [];
  for (file of files) {
    // console.log(file.filename);
    fileList.push(file.filename);
  }
  // console.log(fileList);
  let Files = fileList.join('\n');
  // console.log(Files);
  let timestamp = new Date(commit.author.date);
  // console.log(timestamp.toLocaleString());

  function emoji(id) {
    return client.emojis.cache.get(id).toString();
  }

  // Test
  // EMO_BRANCH = emoji('844325217756512307');
  // EMO_COMMIT = emoji('844326674123456592');
  // EMO_BOT = emoji('844323728405299201');

  // Deployment
  EMO_BRANCH = emoji('844335612084879410');
  EMO_COMMIT = emoji('844335564785844254');
  EMO_BOT = emoji('844335684868505640');

  let splitUrl = author.avatar_url.split('?');
  embed
    .setTitle(`Committed to ${EMO_BRANCH}\`${branch}\``)
    .setAuthor(`${commit.author.name}`, `${splitUrl[0]}`)
    .setDescription(`**${EMO_COMMIT} Commit message:** ${commit.message}`)
    .addField(
      `🔒 SHA: \`${sha.substring(0, 7)}\``,
      `**⛓️ Changes** : ${stats.total}\n**📁 Files Changed** : \n${Files}\n`
    )
    .setColor(
      `#${Math.floor((Math.random() * 0xffffff) << 0)
        .toString(16)
        .padStart(6, '0')}`
    )
    .addField(
      `${EMO_BOT}Mars${EMO_COMMIT}GitHub API`,
      `**Commit URL**: [${sha.substring(0, 7)}](${html_url})`
    )
    .setFooter(
      `Timestamp: ${timestamp.toLocaleString(undefined, {
        timeZone: 'Asia/Kolkata',
      })}`
    );
  let seed = await Channel.send(embed);
};

module.exports = messenger;
