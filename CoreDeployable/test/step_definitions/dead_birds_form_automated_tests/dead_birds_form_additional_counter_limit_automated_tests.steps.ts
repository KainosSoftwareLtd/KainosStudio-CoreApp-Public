import { Then, When } from '@cucumber/cucumber';
import { driver } from '../../common.js';
import { By } from 'selenium-webdriver';
import assert from 'assert';

When('I give a value that is 4 characters over the limit of {int}', async function (limit: number) {
    let textarea = await driver.findElement(By.id('additional_info'));
    await driver.findElement(By.id('location_choice-5')).click();
    await driver.findElement(By.id('location_desc')).clear();
    await textarea.clear();
    let exceedingLimit = 'a'.repeat(limit + 4);
    await textarea.sendKeys(exceedingLimit);
});

Then('{string} error will be returned', async function (errorMessage: string) {
    let actualMessage = await driver.findElement(By.css('.govuk-character-count__message.govuk-character-count__status.govuk-error-message')).getText();
    assert.equal(actualMessage, errorMessage);
});
