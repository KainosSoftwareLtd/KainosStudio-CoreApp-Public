import { Given, Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';

import { By } from 'selenium-webdriver';
import assert from 'assert';

let formId: string;
let expectedError: string;

Given('User navigates to the form service with an id {string}', async function (id: string) {
  formId = id;
  await driver.get(`http://localhost:${port}/${formId}`);
});

When('I fill out the name field with an unaccepted character {string}', async function (wrongChar: string) {
  const nameTextBox = driver.findElement(By.name('f_text_1'));
  await nameTextBox.clear();
  await nameTextBox.sendKeys(wrongChar);
});

When('I press the error button', async function () {
  await driver.findElement(By.name('action')).click();
});

Then('I should get an error that {string}', async function (error: string) {
  expectedError = error;
  let actualError = await driver
    .findElement(By.xpath('//ul[@class="govuk-list govuk-error-summary__list"]/li[1]/a'))
    .getText();
  assert.equal(actualError, expectedError);
});
