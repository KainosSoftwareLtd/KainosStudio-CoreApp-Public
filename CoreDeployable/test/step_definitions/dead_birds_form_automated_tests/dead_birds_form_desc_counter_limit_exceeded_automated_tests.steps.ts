import { Then, When } from '@cucumber/cucumber';
import { driver } from '../../common.js';

import { By } from 'selenium-webdriver';
import assert from 'assert';

When('I type in four characters over character limit of {int} into the text area field', async function (limit: number) {
    let textarea = await driver.findElement(By.id('location_desc'));
    await driver.findElement(By.id('location_choice-5')).click();
    await textarea.clear();
    let exceedingLimit = 'a'.repeat(limit + 4);
    await textarea.sendKeys(exceedingLimit);
});

Then('I recieve an error message back {string} under the area field', async function (errorMessage: string) {
    let actualMessage = await driver.findElement(By.css('.govuk-character-count__message.govuk-character-count__status.govuk-error-message')).getText();
    assert.equal(actualMessage, errorMessage);
});

