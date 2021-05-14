const gitCommitFetcher = async (repo, branch, Channel) => {
  console.log(`commitFetcher: ${repo}/${branch}`);
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
  const { sha, parents, commit, stats, files, author, html_url } = res;

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

  fs.access(`./assets/branches/${branch}.json`, (err) => {
    if (err) {
      // First Time Commits storage
      console.log(
        `commitFetcher: branch file doesnt exist so created ${branch}.json`
      );
      let mainobj = {};
      /* format
        {
          previousCommit: {
            "sha": "asdasd98qu198ue1982ew9qun9qn"
          }
        }
      */
      let previousCommit = {
        sha: parentSha,
      };
      let recentCommit = {
        sha: currentSha,
      };
      mainobj.previousCommit = previousCommit;
      mainobj.recentCommit = recentCommit;
      // console.log(mainobj);
      let data = JSON.stringify(mainobj);
      // console.log(data);
      fs.writeFile(`./assets/branches/${branch}.json`, data, async (err) => {
        if (err) return console.log(err);
        console.log(`commitFetcher: ${branch} file written`);

        let splitUrl = author.avatar_url.split('?');
        embed
          .setTitle(`📍 Committed to #\`${branch}\``)
          .setAuthor(`@${commit.author.name}`, `${splitUrl[0]}`)
          .setDescription(`**📨 Commit message:** ${commit.message}`)
          .addField(
            `🔒 SHA: \`${sha.substring(0, 8)}\``,
            `**⛓️ Changes** : ${stats.total}\n**📁 Files Changed** : \n${Files}\n`
          )
          .setColor(
            `#${Math.floor((Math.random() * 0xffffff) << 0)
              .toString(16)
              .padStart(6, '0')}`
          )
          .addField(
            `🌐 GitHub API`,
            `**Commit URL**: [${sha.substring(0, 8)}](${html_url})`
          )
          .setFooter(`Timestamp: ${timestamp}`);
        let seed = await Channel.send(embed);
      });
    } else {
      console.log(`commitFetcher: ${branch} file exists`);
      fs.readFile(`./assets/branches/${branch}.json`, (err, content) => {
        if (err) return console.log(err);
        let data = JSON.parse(content);
        // console.log(data);
        // console.log(parentSha);
        // console.log(data.previousCommit.sha);
        if (parentSha === data.recentCommit.sha || null) {
          // new commit avaiable
          // change recentCommit.sha to sha
          // change previousCommit.sha to parentSha
          // send a embed
          data.recentCommit.sha = currentSha;
          data.previousCommit.sha = parentSha;
          let update = JSON.stringify(data);
          fs.writeFile(
            `./assets/branches/${branch}.json`,
            update,
            async (err) => {
              if (err) return console.log(err);
              console.log(`commitFetcher: ${branch} file updated`);
              console.log(author.avatar_url);
              let splitUrl = author.avatar_url.split('?');
              embed
                .setTitle(`📍 Committed to #\`${branch}\``)
                .setAuthor(`@${commit.author.name}`, `${splitUrl[0]}`)
                .setDescription(`**📨 Commit message:** ${commit.message}`)
                .addField(
                  `🔒 SHA: \`${sha.substring(0, 8)}\``,
                  `**⛓️ Changes** : ${stats.total}\n**📁 Files Changed** : \n${Files}\n`
                )
                .setColor(
                  `#${Math.floor((Math.random() * 0xffffff) << 0)
                    .toString(16)
                    .padStart(6, '0')}`
                )
                .addField(
                  `🌐 GitHub API`,
                  `**Commit URL**: [${sha.substring(0, 8)}](${html_url})`
                )
                .setFooter(`Timestamp: ${timestamp}`);
              let seed = await Channel.send(embed);
            }
          );
        } else {
          console.log(`commitFetcher: No change in ${branch} detected`);
        }
      });
    }
  });
};

module.exports = gitCommitFetcher;
