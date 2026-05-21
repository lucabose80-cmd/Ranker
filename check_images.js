const fs = require('fs');
const content = fs.readFileSync('data-starwars.js', 'utf8');
const filesInDir = fs.readdirSync('starwars.bilder');

const regex = /img:\s*['"]starwars\.bilder\/(.*?)['"]/g;
let match;
const missing = [];
const caseMismatch = [];

while ((match = regex.exec(content)) !== null) {
  const filename = match[1];
  if (!filesInDir.includes(filename)) {
    const lowerFileName = filename.toLowerCase();
    const actualFile = filesInDir.find(f => f.toLowerCase() === lowerFileName);
    if (actualFile) {
      caseMismatch.push({ expected: filename, actual: actualFile });
    } else {
      missing.push(filename);
    }
  }
}

console.log('Missing:', missing);
console.log('Case Mismatches:', caseMismatch);
