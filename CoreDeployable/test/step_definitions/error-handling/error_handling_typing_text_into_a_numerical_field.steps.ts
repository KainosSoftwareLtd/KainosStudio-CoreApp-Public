import { Then, When } from '@cucumber/cucumber';

import { By } from 'selenium-webdriver';
import assert from 'assert';
import { driver } from '../../common.js';

let expectedError: string;

When('I fill out the phone number field with an unaccepted character {string}', async function (wrongChar: string) {
  const phoneNumberTextBox = driver.findElement(By.name('f_text_5'));
  await phoneNumberTextBox.clear();
  await phoneNumberTextBox.sendKeys(wrongChar);
});

When('I press the error button on the page', async function () {
  await driver.findElement(By.name('action')).click();
});

Then('I should get an error {string}', async function (error: string) {
  expectedError = error;
  let actualError = await driver
    .findElement(By.xpath('//ul[@class="govuk-list govuk-error-summary__list"]/li[2]/a'))
    .getText();
    
  assert.equal(actualError, expectedError);
});
