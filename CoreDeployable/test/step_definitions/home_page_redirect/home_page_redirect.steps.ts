import { By, until } from 'selenium-webdriver';
import { Given, Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';

import assert from 'assert';

let formId: string;

Given('I have a form service with an id {string}', function (id: string) {
  formId = id;
});

When('I open the specified page', async function () {
  await driver.get(`${process.env.TEST_URL}/${formId}`);
});

When('I click on the home button', async function () {
  const buttonPath = By.className('govuk-header__link govuk-header__link--homepage');
  await driver.wait(until.elementLocated(buttonPath));
  await driver.findElement(buttonPath).click();
});

Then('Then I should be taken to the page defined in the "homePageUrl" field', async function () {
  const expectedUrl = process.env.TEST_HOME_PAGE_URL;
  if (!expectedUrl) {
    throw new Error('TEST_HOME_PAGE_URL environment variable is not defined');
  }
  await driver.wait(until.urlIs(expectedUrl));
  let actualUrl = await driver.getCurrentUrl();
  assert.equal(actualUrl, expectedUrl);
});
