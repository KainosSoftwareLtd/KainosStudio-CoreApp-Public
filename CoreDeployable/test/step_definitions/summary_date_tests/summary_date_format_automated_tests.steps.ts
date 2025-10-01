import { Given, Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';

import { By, until } from 'selenium-webdriver';
import assert from 'assert';

let formId: string;

Given('I am on the {string} form which has a date component', async function (id: string) {
    formId = id;
    await driver.get(`${process.env.TEST_URL}/${formId}`);
  });

When('I fill out the day field with {string} the month field with {string} and the year field with {string}', async function (day: string, month: string, year: string) {
  const dayInput = await driver.findElement(By.id('f-dateInput-day'));
  await dayInput.clear();
  await dayInput.sendKeys(day);

  const monthInput = await driver.findElement(By.id('f-dateInput-month'));
  await monthInput.clear();
  await monthInput.sendKeys(month);

  const yearInput = await driver.findElement(By.id('f-dateInput-year'));
  await yearInput.clear();
  await yearInput.sendKeys(year);
});

When('I click the save and continue button which is at the very bottom of the form with the date component', async function () {
    const buttonPath = By.className('govuk-button');
    await driver.wait(until.elementLocated(buttonPath));
    await driver.findElement(buttonPath).click();
});

Then('I should see the date presented to me in the right format {string}', async function (date: string) {
    const actualDate= await driver.findElement(By.className('govuk-summary-list__value')).getText();
    assert.strictEqual(actualDate, date);
  });