const fetchBranch = async (client, repository, Channel) => {
  const fs = require('fs');
  const branch = require('../models/branch');
  const messenger = require('./messenger');
  const { Octokit } = require('@octokit/core');
  const auth_token = process.env['auth_token'];
  const octokit = new Octokit({
    auth: auth_token,
  });

  const response = await octokit.request('GET /repos/{owner}/{repo}/branches', {
    owner: 'StealthAdder',
    repo: repository,
  });

  // console.log(response.data);
  // br ~ branch
  for (br of response.data) {
    try {
      const result = await branch.find({ branchName: br.name });
      if (result.length === 0) {
        console.log(`new branch found`);
        let asset = {
          branchName: br.name,
          currentSha: br.commit.sha,
        };
        const createBranch = await branch.create(asset);
        // msg user about the new addition.

        await messenger(client, repository, br.name, Channel);
        // console.log(createBranch);
      } else {
        // console.log(result);
        // check if currenctSha and responseSha are same
        if (result[0].currentSha === br.commit.sha) {
          console.log(`${result[0].branchName}: up to date`);
        } else {
          console.log(`${result[0].branchName}: outdated`);
          let _id = result[0]._id;
          let updates = {
            $set: { currentSha: br.commit.sha },
          };
          let options = { new: true };
          const updateSha = await branch.findByIdAndUpdate(
            _id,
            updates,
            options
          );
          await messenger(client, repository, br.name, Channel);
          // console.log(updateSha);
          if (updateSha.currentSha === br.commit.sha) {
            console.log(`${updateSha.branchName}: updated`);
          }
        }
        // console.log(result[0].currentSha);
      }
    } catch (error) {
      console.log(error);
    }
  }
  // console.log();
};

module.exports = fetchBranch;
