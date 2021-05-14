const neatBranch = async () => {
  const fs = require('fs');
  console.log(`neatBranch: Checking for Untracked/outdated Branches files`);
  fs.readdir(`./assets/branches`, (err, files) => {
    if (err) return console.log(err);
    //
    let loadedFiles = [];
    files.forEach((file) => {
      let filename = file.split('.json');
      loadedFiles.push(filename[0]);
    });

    // Now except the main delete all other files
    fs.readFile(`./assets/watching.json`, (err, content) => {
      if (err) return console.log(err);
      let watchBranches = JSON.parse(content);

      // all files
      // console.log(loadedFiles);
      // files we need
      // console.log(watchBranches.branch);
      let br = watchBranches.branch;
      var deleteBranches = loadedFiles.filter((i) => br.indexOf(i) === -1);

      // var array1 = [1, 2, 3, 4, 5];
      // var array2 = [3, 4];
      // var array3 = array1.filter((i) => array2.indexOf(i) === -1);
      // console.log(array3);

      for (delbr of deleteBranches) {
        // console.log(delbr);
        if (delbr !== '.gitkeep')
          fs.unlink(`./assets/branches/${delbr}.json`, (err) => {
            if (err) return console.log(err);
            console.log(`neatBranch: ${delbr}.json removed`);
          });
        console.log(`neatBranch: found .gitkeep but it was saved by master.`);
      }
      console.log(`neatBranch: all clean`);
    });
  });
};

module.exports = neatBranch;
