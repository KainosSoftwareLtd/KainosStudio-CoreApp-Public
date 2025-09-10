import { Then, When } from '@cucumber/cucumber';

import { By, until } from 'selenium-webdriver';
import assert from 'assert';
import { driver } from '../../common.js';

When('I trigger errors on the translation page by not filling the {string} mandatory field', async function (field:string) {
    await driver.findElement(By.id('f-addressInput-2-line1')).clear();
    await driver.findElement(By.id('f-addressInput-2-line1')).sendKeys('4-6 Upper Cres');
    await driver.findElement(By.id('f-addressInput-2-town')).clear();
    await driver.findElement(By.id('f-addressInput-2-town')).sendKeys('Belfast');
    await driver.findElement(By.id('f-addressInput-2-postcode')).clear();
    await driver.findElement(By.id('f-addressInput-2-postcode')).sendKeys('BT7 1NT');
    await driver.findElement(By.id('f-dateInput-2-day')).clear();
    await driver.findElement(By.id('f-dateInput-2-day')).sendKeys('27');
    await driver.findElement(By.id('f-dateInput-2-month')).clear();
    await driver.findElement(By.id('f-dateInput-2-month')).sendKeys('01');
    await driver.findElement(By.id('f-dateInput-2-year')).clear();
    await driver.findElement(By.id('f-dateInput-2-year')).sendKeys('2000');
    await driver.findElement(By.id('f-phoneNumberInput')).clear();
    await driver.findElement(By.id('f-phoneNumberInput')).sendKeys('01234567890');
    await driver.findElement(By.id('f-addressInput-3')).clear();
    await driver.findElement(By.id('f-addressInput-3')).sendKeys('BT7 1NT');
    await driver.findElement(By.id('f-emailInput-3')).clear();
    await driver.findElement(By.id('f-emailInput-3')).sendKeys('test@test.com');
    await driver.findElement(By.id(field)).clear();
});

When('I try to continue to the next page of the translation service by pressing the continue button', async function () {
  const buttonPath = By.name('action');
  await driver.wait(until.elementLocated(buttonPath));
  await driver.findElement(buttonPath).click();
});

Then('I should have the translated welsh {string} appear at the top of the page', async function (error: string) {
    const expectedError = error;
    let actualError = await driver.findElement(By.className('govuk-list govuk-error-summary__list')).getText();
    assert.equal(actualError, expectedError);
});
