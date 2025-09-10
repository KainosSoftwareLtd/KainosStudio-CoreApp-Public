import { Then, When } from '@cucumber/cucumber';
import { driver } from '../../common.js';

import { By } from 'selenium-webdriver';
import assert from 'assert';

When('I type in four too many characters into the text box that has a character limit of {int}', async function (limit:number) {
    let exceedingLimit = 'a'.repeat(limit + 4);
    await driver.findElement(By.id('f_textarea_1')).clear();
    await driver.findElement(By.id('f_textarea_1')).sendKeys(exceedingLimit);
  });


Then('I get an error message back {string} on the bottom of the text box', async function (errorMessage:string) {
    let actualMessage = await driver.findElement(By.className('govuk-character-count__message govuk-character-count__status govuk-error-message')).getText();
    assert.equal(actualMessage, errorMessage);
})
