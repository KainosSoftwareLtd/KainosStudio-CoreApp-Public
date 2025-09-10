import { Then, When } from '@cucumber/cucumber';
import { driver } from '../../common.js';
import { By, until } from 'selenium-webdriver';
import assert from 'assert';

When('I leave the day, month, and year fields blank', async function () {
  await driver.findElement(By.id('f-dateInput-2-day')).clear();
  await driver.findElement(By.id('f-dateInput-2-month')).clear();
  await driver.findElement(By.id('f-dateInput-2-year')).clear();
});

When('I continue using the button at the bottom of the page to submit the blank fields', async function () {
    const buttonPath = By.className('govuk-button');
    await driver.wait(until.elementLocated(buttonPath));
    await driver.findElement(buttonPath).click();
});

Then('I should get an error saying {string} appear at the top of the page with the date field', async function (expectedErrorMessage: string) {
  const errorElement = await driver.findElement(By.className('govuk-list govuk-error-summary__list')).getText();
  assert.strictEqual(errorElement, expectedErrorMessage);
});
