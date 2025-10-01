import { Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';

import { By } from 'selenium-webdriver';
import assert from 'assert';

let formId: string;
let page: string;

When('I insert valid data into the relevant fields', async function () {
  const nameTextBox = await driver.findElement(By.id('name'));
  await nameTextBox.clear();
  await nameTextBox.sendKeys('John Doe');

  const phoneNumberTextBox = await driver.findElement(By.id('telephone_number'));
  await phoneNumberTextBox.clear();
  await phoneNumberTextBox.sendKeys('+447700900982');

  const EmailTextBox = await driver.findElement(By.id('email_address'));
  await EmailTextBox.clear();
  await EmailTextBox.sendKeys('email@email.com');
});

When('I select the continue at the end of the form', async function () {
  const continueButton = await driver.findElement(By.name('action'));
  await continueButton.click();
});

Then('I should be directed to the {string} of our form', async function (pageId: string) {
  formId = 'report-demo-test';
  page = pageId;
  const expectedUrl: string = `${process.env.TEST_URL}/${formId}/${page}`;
  const actualUrl = await driver.getCurrentUrl();
  assert.equal(actualUrl, expectedUrl);
});
