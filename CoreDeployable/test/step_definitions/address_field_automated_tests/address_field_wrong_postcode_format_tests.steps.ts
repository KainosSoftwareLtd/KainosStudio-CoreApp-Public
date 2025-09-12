import { Then, When } from '@cucumber/cucumber';
import { driver } from '../../common.js';
import { By, until } from 'selenium-webdriver';
import assert from 'assert';

When('I put an invalid postcode into the postcode field', async function () {
    await driver.findElement(By.id('f-addressInput-postcode')).sendKeys('aa01 1');
});

When('I attempt to move on to the next page using the save and continue button with the invalid post code entered',async function(){
    const buttonPath = By.className('govuk-button');
    await driver.wait(until.elementLocated(buttonPath));
    await driver.findElement(buttonPath).click();
});

Then('I should see a wrong format error pop up saying {string}', async function (errorMessage: string) {
    const errorElement = await driver.findElement(By.xpath('//div[contains(@class,"govuk-error-summary")]//a')).getText();
    assert.strictEqual(errorElement, errorMessage);
});
