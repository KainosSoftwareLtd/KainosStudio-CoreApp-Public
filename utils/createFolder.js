const fs = require('fs-extra');
const argv = require('minimist')(process.argv.slice(2));
 
async function createDirTree(dirPath) {
  if (!fs.existsSync(dirPath)) {
    await fs.mkdirSync(dirPath, {recursive: true});
  }
}

console.log("Create folder: %s if it does not exist", argv['dirPath']);
createDirTree(argv['dirPath']);