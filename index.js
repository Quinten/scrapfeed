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
    //console.log('Empty pub dir success...');
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
                //if (info) {
                    //console.log(info);
                //}
            });
            gitlog.file = fileName + '.webp'; // todo: allow multiple files
        }
        //console.log(gitlog);
        posts.push(gitlog);
    });
    posts.sort((a, b) => (a.timestamp < b.timestamp) ? 1 : -1);
    //console.log(posts);
    let content = '';
    posts.forEach(post => {
        let imgHtml = '';
        if (post.file) {
            imgHtml = `<div class="image-wrapper"><img src="${post.file}" alt="${post.subject}" /></div>`;
        }
        let bodyHtml = '';
        if (post.body) {
            bodyHtml = `<p>${post.body}</p>`;
        }
        content += `<div class="post">${imgHtml}<div class="date-wrapper"><span class="date">${post.day}</span> <span class="time">${post.time}</span></div><h3>${post.subject}</h3>${bodyHtml}</div>`;
    });
    //console.log(content);
    let htmlTemplate = './assets/index.html';
    if (fs.existsSync(htmlTemplate)) {
        let html = fs.readFileSync(htmlTemplate, 'utf8');
        html = html.replace('{{content}}', content);
        fs.writeFileSync('./pub/index.html', html, {flag: 'w'});
    } else {
        console.log('No ./assets/index.html found');
    }
})
.catch(err => {
  console.error(err)
});
