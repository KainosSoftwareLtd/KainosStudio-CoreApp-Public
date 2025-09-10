import { Then, When } from '@cucumber/cucumber';
import { driver } from '../../common.js';

import { By } from 'selenium-webdriver';
import assert from 'assert';

let formId: string;

When('the additional info area field is clear', async function () {
    await driver.findElement(By.id('location_choice-5')).click();
    await driver.findElement(By.id('location_desc')).clear();
});

When('a {string} counter is on the bottom of the area field', async function (expectedMessage:string) {
    let actualMessage = await driver.findElement(By.className('govuk-hint govuk-character-count__message govuk-character-count__status')).getText();
    assert.equal(actualMessage, expectedMessage);
});

When('I insert the value {string} into this field', async function (text:string) {
    await driver.findElement(By.id('additional_info')).sendKeys(text);
});

Then('the counter message will change to {string} now', async function (newCharLength:string) {
    let actualMessage = await driver.findElement(By.className('govuk-hint govuk-character-count__message govuk-character-count__status')).getText();
    assert.equal(actualMessage, newCharLength);
});
