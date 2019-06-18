#!/usr/bin/env node

const fs = require('fs-extra');
const util = require('util');
const { execSync } = require('child_process');

const contentDir = './content/';

function padTime(num) {
    return (('' + num).length == 2) ? ('' + num) : ('0' + num);
}

fs.emptyDir('pub')
.then(() => {
    console.log('Empty pub dir success...');
    let posts = [];
    fs.readdirSync(contentDir).forEach(file => {
        let contentFile = contentDir + file;
        let gitlog = execSync(`git log --pretty=format:'{"hash":"%H","date":"%aI","subject":"%s","body":"%b","author":{"name":"%an","email":"%ae"}},' ${contentFile}`);
        gitlog = gitlog.toString();
        if (!gitlog) {
            return;
        }
        gitlog = gitlog.slice(0, -1);
        gitlog = gitlog.replace('\n', '');
        gitlog = '[' + gitlog + ']';
        gitlog = JSON.parse(gitlog);
        gitlog = gitlog[0];
        gitlog.file = file; // todo: allow multiple files
        let dateObj = new Date(gitlog.date);
        gitlog.timestamp = dateObj.getTime();
        gitlog.day = dateObj.toDateString();
        gitlog.time = padTime(dateObj.getHours()) + ':' + padTime(dateObj.getMinutes());
        console.log(gitlog);
        posts.push(gitlog);
    });
})
.catch(err => {
  console.error(err)
});

//console.log(process.cwd());
