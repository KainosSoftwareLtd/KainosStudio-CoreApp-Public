import { By, until } from 'selenium-webdriver';
import { Given, Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';

import assert from 'assert';

let formId: string;
let page: string;

Given('I have a form service open with the id of {string}', function (id: string) {
  formId = id;
});

When('I open that page', async function () {
  await driver.get(`http://localhost:${port}/${formId}`);
});

When('I press the save and continue button', async function () {
  const buttonPath = By.xpath('/html/body/div/main/div/div/form/button[2]');
  await driver.wait(until.elementLocated(buttonPath));
  await driver.findElement(buttonPath).click();
});

Then('I should be taken to {string}', async function (pageId: string) {
  page = pageId;
  let expectedUrl: string = `http://localhost:${port}/${formId}/${page}`;
  let actualUrl = await driver.getCurrentUrl();
  assert.equal(actualUrl, expectedUrl);
});
