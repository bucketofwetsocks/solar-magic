/**
 * A build script that copies all dependencies into the dist folder.
 * Edit FILELIST as needed.
 */

const fs = require('fs');
const path = require('path');

const FILELIST = [
    './node_modules/materialize-css/dist/css/materialize.min.css',
    './node_modules/materialize-css/dist/js/materialize.min.js',
];

const DEST = `./solar-magic/dist/solar-magic`;

for (const file of FILELIST) {
    const filename = path.basename(file);
    const dest = `${DEST}/${filename}`;
    fs.copyFileSync(file, dest);
    console.log(`Copied '${file}' --> '${dest}'`)
}