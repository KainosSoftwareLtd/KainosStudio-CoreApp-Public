import { Then, When } from '@cucumber/cucumber';
import { driver } from '../../common.js';
import { By, until } from 'selenium-webdriver';
import assert from 'assert';

When('I fill out all of the fields in the address form', async function () {
    await driver.findElement(By.id('f-addressInput-line1')).clear();
    await driver.findElement(By.id('f-addressInput-line1')).sendKeys('address');
    await driver.findElement(By.id('f-addressInput-line2')).sendKeys('flat 1');
    await driver.findElement(By.id('f-addressInput-town')).clear();
    await driver.findElement(By.id('f-addressInput-town')).sendKeys('town');
    await driver.findElement(By.id('f-addressInput-county')).sendKeys('county');
    await driver.findElement(By.id('f-addressInput-postcode')).clear();
    await driver.findElement(By.id('f-addressInput-postcode')).sendKeys('aa01 1aa');
});

When('I move on to the next page of the address form with the save and continue button',async function(){
    const buttonPath = By.className('govuk-button');
    await driver.wait(until.elementLocated(buttonPath));
    await driver.findElement(buttonPath).click();
});

Then('I want to confirm that the data from the address form is displayed correctly in the summary', async function () {
    const expectedSummary = 'address, flat 1, town, county, aa01 1aa';
    const summaryElement = await driver.findElement(By.className('govuk-summary-list__value')).getText();
    assert.strictEqual(summaryElement, expectedSummary);
});
