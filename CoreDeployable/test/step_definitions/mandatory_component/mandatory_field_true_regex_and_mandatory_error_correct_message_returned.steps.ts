import { Given, Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';

import { By, until } from 'selenium-webdriver';
import assert from 'assert';

let formId: string;
let expectedError: string;

Given('I am currently on the {string} page that has mandatory fields and regex validation', async function (id: string) {
  formId = id;
  await driver.get(`http://localhost:${port}/${formId}`);
});

When('I fill out the name of even field with {string}', async function (wrongChar: string) {
  const nameTextBox = driver.findElement(By.name('f-text'));
  await nameTextBox.clear();
  await nameTextBox.sendKeys(wrongChar);
});

When('I press the save and continue button which is at the very bottom of the mandatory with regex form', async function () {
    const buttonPath = By.className('govuk-button');
    await driver.wait(until.elementLocated(buttonPath));
    await driver.findElement(buttonPath).click();
});

Then('I should get an error back at the top of the page that matches the {string}', async function (error: string) {
  expectedError = error;
  let actualError = await driver
    .findElement(By.xpath('//ul[@class="govuk-list govuk-error-summary__list"]/li[1]/a'))
    .getText();
  assert.equal(actualError, expectedError);
});
