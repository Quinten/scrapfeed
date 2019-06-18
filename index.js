#!/usr/bin/env node

const fs = require('fs-extra');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

fs.emptyDir('pub')
.then(() => {
    console.log('Empty pub dir success...');
    exec(`git log --pretty=format:'{"hash":"%H","date":"%aI","subject":"%s","body":"%b","author":{"name":"%an","email":"%ae"}},' ./content/the-very-first-test-scrap.png`)
    .then(({stdout, stderr}) => {
        if (stderr) {
            console.log(stderr);
            return;
        }
        console.log(stdout);
    })
    .catch(err => {
        console.log(err);
    });
})
.catch(err => {
  console.error(err)
});

//console.log(process.cwd());
