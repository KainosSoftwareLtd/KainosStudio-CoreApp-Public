import { Then, When } from '@cucumber/cucumber';

import { By } from 'selenium-webdriver';
import assert from 'assert';
import { driver } from '../../common.js';

let expectedError: string;

When('I give an invalid email {string} in the email field', async function (invalidEmail: string) {
  const emailTextBox = await driver.findElement(By.id('email_address'));
  await emailTextBox.clear();
  await emailTextBox.sendKeys(invalidEmail);
});

When('I choose the continue button after I enter that', async function () {
  await driver.findElement(By.name('action')).click();
});

Then('error, {string} is displayed', async function (error: string) {
  expectedError = error;
  let actualError = await driver.findElement(By.css('a[href="#email_address"]')).getText();
  assert.equal(actualError, expectedError);
});
