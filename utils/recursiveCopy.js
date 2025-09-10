const fs = require('fs-extra');
const argv = require('minimist')(process.argv.slice(2));
 
async function copyDir(originFolderPath, targetFolderPath) {
  await fs.cpSync(originFolderPath, targetFolderPath, { recursive: true });
}

console.log("Copying files from: %s, target: %s", argv['originFolderPath'], argv['targetFolderPath']);
copyDir(argv['originFolderPath'], argv['targetFolderPath']);