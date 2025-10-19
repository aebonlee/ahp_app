const fs = require('fs-extra');
const path = require('path');

const source = path.join(__dirname, 'build');
const destination = path.join(__dirname, 'ahp_frontend_public');

console.log('Copying from:', source);
console.log('Copying to:', destination);

fs.copySync(source, destination, { overwrite: true });

console.log('✅ Build files copied successfully!');