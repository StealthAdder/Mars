const branchWatcher = async (repository) => {
  // console.log(`watcher: syncing branches from api`);
  const fs = require('fs');
  const { Octokit } = require('@octokit/core');
  const auth_token = process.env['auth_token'];
  const octokit = new Octokit({
    auth: auth_token,
  });

  const commitInfo = await octokit.request(
    'GET /repos/{owner}/{repo}/branches',
    {
      owner: 'StealthAdder',
      repo: repository,
    }
  );

  const res = commitInfo.data;
  let branchList = [];
  for (branch of res) {
    await branchList.push(branch.name);
  }
  // console.log(branchList);
  let obj = {
    branch: branchList,
  };
  let data = await JSON.stringify(obj);
  fs.access(`./assets/watching.json`, (err) => {
    if (err) {
      // no found
      // console.log(`watcher: new file created`);
      fs.writeFile(`./assets/watching.json`, data, (err) => {
        if (err) return console.log(err);
      });
    } else {
      // console.log(`watcher: all in sync`);
      fs.writeFile(`./assets/watching.json`, data, (err) => {
        if (err) return console.log(err);
      });
    }
  });
  return branchList;
};

module.exports = branchWatcher;
