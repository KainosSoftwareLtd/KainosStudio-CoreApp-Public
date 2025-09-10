import { Given, Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';
import { By, until } from 'selenium-webdriver';
import assert from 'assert';

let formId: string;

Given('the user navigates to the form service with an id {string}', async function (id: string) {
  formId = id;
  await driver.get(`http://localhost:${port}/${formId}`);
});

When('I enter {string} into day, {string} into month and {string} into year field', async function (day: string, month: string, year: string) {
  await driver.findElement(By.id('f-dateInput-2-day')).clear();
  await driver.findElement(By.id('f-dateInput-2-month')).clear();
  await driver.findElement(By.id('f-dateInput-2-year')).clear();
  await driver.findElement(By.id('f-dateInput-2-day')).sendKeys(day);
  await driver.findElement(By.id('f-dateInput-2-month')).sendKeys(month);
  await driver.findElement(By.id('f-dateInput-2-year')).sendKeys(year);
});

When('I continue by using the save and continue at the bottom of the page to submit my date', async function () {
    const buttonPath = By.className('govuk-button');
    await driver.wait(until.elementLocated(buttonPath));
    await driver.findElement(buttonPath).click();
});

Then('I should see an error saying {string} popping up at the top of the page', async function (expectedErrorMessage: string) {
  const errorElement = await driver.findElement(By.className('govuk-list govuk-error-summary__list')).getText();
  assert.strictEqual(errorElement, expectedErrorMessage);
});
