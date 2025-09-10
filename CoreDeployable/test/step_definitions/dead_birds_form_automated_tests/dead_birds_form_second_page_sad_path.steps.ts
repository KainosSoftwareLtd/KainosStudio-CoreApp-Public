import { Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';

import { By } from 'selenium-webdriver';
import assert from 'assert';

let formId: string;
let page: string;
let expectedError: string;

When('I confirm I am on the {string} of the form service {string}', async function (pageId: string, id: string) {
  formId = id;
  page = pageId;
  let expectedUrl: string = `http://localhost:${port}/${formId}/${page}`;
  let actualUrl = await driver.getCurrentUrl();
  assert.equal(actualUrl, expectedUrl);
});

When('I do not fill out the radio fields on the specified page and click the continue button', async function () {
  await driver.findElement(By.name('action')).click();
});

Then('I should see an error at the top of the page {string}', async function (error: string) {
  expectedError = error;
  let actualError = await driver
    .findElement(By.xpath('/html/body/div/main/div/div/form/div[1]/div/h2'))
    .getText();

  assert.equal(actualError, expectedError);
});