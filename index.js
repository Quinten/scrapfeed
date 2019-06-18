#!/usr/bin/env node

const fs = require('fs-extra');

fs.emptyDir('pub')
.then(() => {
    console.log('Empty pub dir success...');
})
.catch(err => {
  console.error(err)
});

console.log('Done!');
//console.log(process.cwd());
