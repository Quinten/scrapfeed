#!/usr/bin/env node

const fs = require('fs-extra');
const util = require('util');
const { execSync } = require('child_process');
const sharp = require('sharp');

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
        let dateObj = new Date(gitlog.date);
        gitlog.timestamp = dateObj.getTime();
        gitlog.day = dateObj.toDateString();
        gitlog.time = padTime(dateObj.getHours()) + ':' + padTime(dateObj.getMinutes());
        let fileName = file.replace(/\.[^/.]+$/, '');
        if (file.indexOf('.png') > -1 || file.indexOf('.jpg') > -1 || file.indexOf('.jpeg') > -1) {
            sharp(contentFile)
            .resize(512, 512)
            .toFile('./pub/' + fileName + '.webp', (err, info) => {
                if (err) {
                    console.log(err);
                }
                if (info) {
                    console.log(info);
                }
            });
            gitlog.file = fileName + '.webp'; // todo: allow multiple files
        }
        console.log(gitlog);
        posts.push(gitlog);
    });
})
.catch(err => {
  console.error(err)
});

//console.log(process.cwd());
