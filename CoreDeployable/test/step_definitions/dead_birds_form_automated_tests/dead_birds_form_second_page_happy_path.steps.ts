import { Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';

import { By } from 'selenium-webdriver';
import assert from 'assert';

let formId: string;
let page: string;

When('I select all the radio fields on the page', async function () {
  await driver.findElement(By.name('location_choice')).click();
  await driver.findElement(By.name('bird_reachable')).click();
  await driver.findElement(By.id('additional_info')).clear();
});

When('I press the continue button at the bottom of the page', async function () {
  await driver.findElement(By.name('action')).click();
});

Then('I should be taken to the next page {string} on the {string} form', async function (pageId: string, form: string) {
  formId = form;
  page = pageId;
  let expectedUrl: string = `http://localhost:${port}/${formId}/${page}`;
  let actualUrl = await driver.getCurrentUrl();
  assert.equal(actualUrl, expectedUrl);
});
