import { Then, When } from '@cucumber/cucumber';

import { By } from 'selenium-webdriver';
import assert from 'assert';
import { driver } from '../../common.js';

let expectedError: string;

When('I leave the name and phone number field blank', async function () {
  const phoneNumberTextBox = driver.findElement(By.name('f_text_5'));
  await phoneNumberTextBox.clear();
  const nameTextBox = driver.findElement(By.name('f_text_1'));
  await nameTextBox.clear();
});

When('I press the error button on the bottom of the page', async function () {
  await driver.findElement(By.name('action')).click();
});

Then('I should get a {string}', async function (error: string) {
  expectedError = error;
  let actualError = await driver.findElement(By.className('govuk-error-summary__title')).getText();
  assert.equal(actualError, expectedError);
});
