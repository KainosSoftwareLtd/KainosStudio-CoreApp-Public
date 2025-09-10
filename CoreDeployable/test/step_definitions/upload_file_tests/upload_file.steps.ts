import { By, until } from 'selenium-webdriver';
import { Given, Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';
import path from 'path';

import assert from 'assert';

let formId: string;
let page: string;

When('I upload an jpeg file {string}', async function (filename: string) {
  const filePath = path.resolve('./test/resources/', filename);
  const fileInput = await driver.findElement(By.id('f-file-upload-upload-control-input'));
  await fileInput.sendKeys(filePath);

  const fileUpload = await driver.findElement(By.id('f-file-upload-upload-button'));
  await fileUpload.click();
  await driver.wait(until.elementLocated(By.id('f-file-upload-uploaded-file')), 2000);
});

