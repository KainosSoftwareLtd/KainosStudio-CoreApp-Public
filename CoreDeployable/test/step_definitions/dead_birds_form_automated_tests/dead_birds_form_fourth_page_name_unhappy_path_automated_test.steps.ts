import { Then, When } from '@cucumber/cucumber';

import { By } from 'selenium-webdriver';
import assert from 'assert';
import { driver } from '../../common.js';

let expectedError: string;

When('I leave the name field blank in the form', async function () {
  const nameTextBox = await driver.findElement(By.id('name'));
  await nameTextBox.clear();
});

When('I select the continue button to submit the form', async function () {
  await driver.findElement(By.name('action')).click();
});

Then('the error {string} appears', async function (error: string) {
  expectedError = error;
  let actualError = await driver.findElement(By.css('a[href="#name"]')).getText();
  assert.equal(actualError, expectedError);
});
