import { Then, When } from '@cucumber/cucumber';
import { driver } from '../../common.js';
import { By, until } from 'selenium-webdriver';
import assert from 'assert';

When('I fill out the day with {string} and month with {string} and year with {string}', async function (day: string, month: string, year: string) {
  const dayInput = await driver.findElement(By.id('f-dateInput-2-day'));
  await dayInput.clear();
  await dayInput.sendKeys(day);

  const monthInput = await driver.findElement(By.id('f-dateInput-2-month'));
  await monthInput.clear();
  await monthInput.sendKeys(month);

  const yearInput = await driver.findElement(By.id('f-dateInput-2-year'));
  await yearInput.clear();
  await yearInput.sendKeys(year);
});

When('I press the save and continue button at the bottom of the page to continue on with my choice of date', async function () {
    const buttonPath = By.className('govuk-button');
    await driver.wait(until.elementLocated(buttonPath));
    await driver.findElement(buttonPath).click();
});

Then('I should be redirected to the {string} of the form with the date successfully submitted', async function (expectedPath: string) {
  const currentUrl = await driver.getCurrentUrl();
  const expectedUrl = `http://localhost:8888/date-input-automatic-test/secondPage`;
  assert.strictEqual(currentUrl, expectedUrl);
});
