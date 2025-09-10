import { Then, When } from '@cucumber/cucumber';
import { driver } from '../../common.js';

import { By } from 'selenium-webdriver';
import assert from 'assert';

When('The text box on the describe the location radio field is empty', async function () {
    await driver.findElement(By.id('location_choice-5')).click();
    await driver.findElement(By.id('location_desc')).clear();
});

When('There should be a counter on the bottom of the text box stating {string}', async function (expectedMessage:string) {
    let actualMessage = await driver.findElement(By.className('govuk-hint govuk-character-count__message govuk-character-count__status')).getText();
    assert.equal(actualMessage, expectedMessage);
});

When('I input the value {string} to the text area field', async function (text:string) {
    await driver.findElement(By.id('location_desc')).sendKeys(text);
});

Then('The counter at the bottom of the text area field should change to {string}', async function (newCharLength:string) {
    let actualMessage = await driver.findElement(By.className('govuk-hint govuk-character-count__message govuk-character-count__status')).getText();
    assert.equal(actualMessage, newCharLength);
});
