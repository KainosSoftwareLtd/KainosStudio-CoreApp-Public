import { By } from 'selenium-webdriver';
import { Given, Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';
import assert from 'assert';

let formId: string;
let page: string;

Given('I am on the {string} service which is without a custom page not found message', async function (id: string) {
  formId = id;
  await driver.get(`${process.env.TEST_URL}/${formId}`);
});

When('I try to go on the page {string} which does not exist in the kfd and has extra sections in the URL', async function (pageId: string) {
  page = pageId;
  await driver.get(`${process.env.TEST_URL}/${formId}/${page}/extra/extra`);
});

Then('I should see the default not-found page with the message {string}', async function (errorMessage: string) {
  const errorElement = await driver.findElement(By.className('govuk-heading-xl')).getText();
  assert.strictEqual(errorElement, errorMessage);
});