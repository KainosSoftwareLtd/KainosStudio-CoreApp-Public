import { Then, When } from '@cucumber/cucumber';

import { By } from 'selenium-webdriver';
import assert from 'assert';
import { driver } from '../../common.js';

let expectedError: string;

When('I enter an invalid phone number {string} in the phone number field', async function (invalidPhoneNumber: string) {
  const phoneNumberTextBox = await driver.findElement(By.id('telephone_number'));
  await phoneNumberTextBox.clear();
  await phoneNumberTextBox.sendKeys(invalidPhoneNumber);
});

When('I pick the continue button', async function () {
  await driver.findElement(By.name('action')).click();
});

Then('this error, {string} comes up', async function (error: string) {
  expectedError = error;
  let actualError = await driver.findElement(By.css('a[href="#telephone_number"]')).getText();
  assert.equal(actualError, expectedError);
});
