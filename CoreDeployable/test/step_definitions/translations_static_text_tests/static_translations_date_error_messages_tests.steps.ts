import { Then, When } from '@cucumber/cucumber';
import { driver } from '../../common.js';
import { By, until } from 'selenium-webdriver';
import assert from 'assert';


When('All the mandatory elements on the translation page are filled in', async function () {
    await driver.findElement(By.id('f-addressInput-2-line1')).clear();
    await driver.findElement(By.id('f-addressInput-2-line1')).sendKeys('4-6 Upper Cres');
    await driver.findElement(By.id('f-addressInput-2-town')).clear();
    await driver.findElement(By.id('f-addressInput-2-town')).sendKeys('Belfast');
    await driver.findElement(By.id('f-addressInput-2-postcode')).clear();
    await driver.findElement(By.id('f-addressInput-2-postcode')).sendKeys('BT7 1NT');
    await driver.findElement(By.id('f-phoneNumberInput')).clear();
    await driver.findElement(By.id('f-phoneNumberInput')).sendKeys('01234567890');
    await driver.findElement(By.id('f-addressInput-3')).clear();
    await driver.findElement(By.id('f-addressInput-3')).sendKeys('BT7 1NT');
    await driver.findElement(By.id('f-emailInput-3')).clear();
    await driver.findElement(By.id('f-emailInput-3')).sendKeys('test@test.com');
});

When('I modify the {string}, {string} and {string} fields to try to trigger errors', async function (day: string, month: string, year: string) {
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

When('I try to continue to the next page of the translation service', async function () {
  const buttonPath = By.name('action');
  await driver.wait(until.elementLocated(buttonPath));
  await driver.findElement(buttonPath).click();
});

Then('I should see the translated {string} show up at the top of the page in the error summary', async function (error: string) {
    const expectedError = error;
    let actualError = await driver.findElement(By.className('govuk-list govuk-error-summary__list')).getText();
    assert.equal(actualError, expectedError);
});
