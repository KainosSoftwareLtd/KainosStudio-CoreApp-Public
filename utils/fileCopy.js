const fs = require('fs-extra');
const argv = require('minimist')(process.argv.slice(2));
 
async function copyFile(originFilePath, targetFilePath) {
  await fs.copy(originFilePath, targetFilePath);
}

console.log("Copying file: %s, target: %s", argv['originFilePath'], argv['targetFilePath']);
copyFile(argv['originFilePath'], argv['targetFilePath']);