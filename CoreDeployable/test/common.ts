
import * as http from 'http';
import * as dotenv from 'dotenv';

import { After, AfterAll, BeforeAll, setDefaultTimeout } from '@cucumber/cucumber';
import { Builder, ThenableWebDriver } from 'selenium-webdriver';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

import { Options } from 'selenium-webdriver/firefox.js';
import { createLocalApp } from '../src/index.js';
import fs from 'fs/promises';

export const port = 8888;
export let driver: ThenableWebDriver;

setDefaultTimeout(15 * 1000);
dotenv.config();

let server: http.Server;

BeforeAll(async function () {
  if (process.env.TEST_ENVIRONMENT === 'local') {
  console.log("Using local services for testing.");
  process.env.USE_LOCAL_SERVICES = 'false';
  const app = createLocalApp();
  server = app.listen(port);
  }
  else {
    console.log("Using deployed services for testing.");
  }
  const firefoxOptions = new Options();
  firefoxOptions.addArguments('--headless');

  driver = new Builder().forBrowser('firefox').setFirefoxOptions(firefoxOptions).build();
  await driver.manage().window().maximize();
  await uploadingKfdTestFiles();
});

After(async function (scenario) {
  if (scenario.result?.status === 'FAILED' && driver) {
    try {
      const image = await driver.takeScreenshot();
      await this.attach(Buffer.from(image, 'base64'), 'image/png');
    } catch (err) {
      console.error('Failed to capture screenshot:', err);
    }
  }
});

AfterAll(async function () {
  server.close();
  await driver.quit();
});

async function uploadingKfdTestFiles() {
  console.log('Uploading KFD test files to S3 bucket.');
  try {
    const client = new S3Client({});
    const bucketName = process.env.BUCKET_NAME;

    if (!bucketName) {
      console.log('No BUCKET_NAME environment variable found, skipping S3 upload.');
      return;
    }

    const rootFolder = './test/kfd-test-files/';

    const folders = await fs.readdir(rootFolder);
    for (const folder of folders) {
      const kfdFolder = `${rootFolder}${folder}/`;
      const files = await fs.readdir(kfdFolder);
      for (const fileName of files) {
        const filePath = `${kfdFolder}${fileName}`;
        console.log(`Uploading ${filePath} file.`);
        const fileContent = await fs.readFile(filePath, 'utf8');
        const updatedContent = updateContentIfNeeded(fileContent, fileName);

        const putCommand = new PutObjectCommand({
          Bucket: bucketName,
          Key: `${folder.toLowerCase()}/${fileName.toLowerCase()}`,
          Body: updatedContent,
          ContentType: 'application/json',
        });
        await client.send(putCommand);
      }
    }
    console.log('Completed uploading KFD test files to S3 bucket.');
  } catch (error) {
    console.error('Error uploading KFD test files:', error);
    throw error;
  }
}

function updateContentIfNeeded(fileContent: string, fileName: string) {
  const apiUrl = process.env.TEST_API_URL;
  switch (fileName) {
    case 'multi-buttons-automatic-test.json': {
      if (!apiUrl) return fileContent;
      try {
        const json = JSON.parse(fileContent);
        json.apiServiceDefinition.servers[0].url = `${apiUrl}/{basePath}`;
        json.apiServiceDefinition.paths['/submit-form/service'].servers[0].url = `${apiUrl}/dev`;
        json.apiServiceDefinition.paths['/save-form/service'].put.servers[0].url = `${apiUrl}/dev`;
        json.apiServiceDefinition.paths['/save-form/service'].patch.servers[0].url = `${apiUrl}/dev`;

        return JSON.stringify(json, null, 2);
      } catch (e) {
        console.error('Failed to update values in multi-buttons-automatic-test.json:', e);
        return fileContent;
      }
    }
    case 'upload-file-automatic-test.json':
      if (!apiUrl) return fileContent;
      try {
        const json = JSON.parse(fileContent);
        json.apiServiceDefinition.paths['/dev/submit-form/service'].servers[0].url = `${apiUrl}`;
        return JSON.stringify(json, null, 2);
      } catch (e) {
        console.error('Failed to update values in upload file.json:', e);
        return fileContent;
      }
    case 'error-handling-automatic-test.json': {
      if (!apiUrl) return fileContent;
      try {
        const json = JSON.parse(fileContent);
        json.apiServiceDefinition.servers[0].url = `${apiUrl}/{basePath}`;
        return JSON.stringify(json, null, 2);
      } catch (e) {
        console.error('Failed to update values in error-handling-automatic-test.json:', e);
        return fileContent;
      }
    }
    case 'homepage-redirect-happy-automatic-test.json': {
      const homePageUrl = process.env.TEST_HOME_PAGE_URL;
      if (!apiUrl || !homePageUrl) return fileContent;
      try {
        const json = JSON.parse(fileContent);
        json.apiEndpoint = `${apiUrl}/dev/submit-form/service`;
        json.homePageUrl = homePageUrl;
        return JSON.stringify(json, null, 2);
      } catch (e) {
        console.error(`Failed to update values in ${fileName}:`, e);
        return fileContent;
      }
    }
    case 'homepage-redirect-unhappy-automatic-test.json': {
      const apiUrl = process.env.TEST_API_URL;
      if (!apiUrl) return fileContent;
      try {
        const json = JSON.parse(fileContent);
        json.apiEndpoint = `${apiUrl}/dev/submit-form/service`;
        return JSON.stringify(json, null, 2);
      } catch (e) {
        console.error(`Failed to update values in ${fileName}:`, e);
        return fileContent;
      }
    }
    case 'report-demo-test.json': {
      try {
        const json = JSON.parse(fileContent);
        json.apiServiceDefinition.servers[0].url = `${apiUrl}/{basePath}`;
        json.apiServiceDefinition.paths['/submit-form/service'].servers[0].url = `${apiUrl}/dev`;
        return JSON.stringify(json, null, 2);
      } catch (e) {
        console.error('Failed to update values in multi-buttons-automatic-test.json:', e);
        return fileContent;
      }
    }
    case 'auth.json': {
      const issuer = process.env.TEST_AUTH_ISSUER;
      const callback = process.env.TEST_AUTH_CALLBACK;
      const idpCert = process.env.TEST_AUTH_IDP_CERT;
      const audience = process.env.TEST_AUTH_AUDIENCE;
      const entryPoint = process.env.TEST_AUTH_ENTRY_POINT;
      console.log('Updating auth.json file content.');
      if (!issuer) return fileContent;
      try {
        const json = JSON.parse(fileContent);
        json.issuer = issuer;
        json.callback = callback;
        json.idpCert = idpCert;
        json.audience = audience;
        json.entryPoint = entryPoint;
        return JSON.stringify(json, null, 2);
      } catch (e) {
        console.error('Failed to update values in auth.json:', e);
        return fileContent;
      }
    }
    default:
      return fileContent;
  }
}
