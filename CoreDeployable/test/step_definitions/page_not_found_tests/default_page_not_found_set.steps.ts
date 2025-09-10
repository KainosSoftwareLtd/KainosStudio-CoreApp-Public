import { By } from 'selenium-webdriver';
import { Given, Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';

import assert from 'assert';

let formId: string;
let page: string;

Given('I am on the {string} service which has no custom page not found message set', async function (id: string) {
  formId = id;
  await driver.get(`http://localhost:${port}/${formId}`);
});

When('I try to go on the page {string} which does not exist in the kfd', async function (pageId: string) {
    page = pageId;
    await driver.get(`http://localhost:${port}/${formId}/${page}`);  
});

Then('I should see the default page not found message {string}', async function (errorMessage: string) {
    const errorElement = await driver.findElement(By.className('govuk-heading-xl')).getText();
    assert.strictEqual(errorElement, errorMessage);
});
