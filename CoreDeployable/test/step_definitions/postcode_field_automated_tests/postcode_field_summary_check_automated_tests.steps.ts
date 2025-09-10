import { Then, When } from '@cucumber/cucumber';
import { driver } from '../../common.js';
import { By, until } from 'selenium-webdriver';
import assert from 'assert';

let postcode : string;

When('I enter a correct postcode {string} into the postcode field', async function (givenPostcode:string) {
    postcode = givenPostcode;
    await driver.findElement(By.id('f-postcodeInput')).clear();
    await driver.findElement(By.id('f-postcodeInput')).sendKeys(postcode);
});

When('I move on to the next page of the postcode form using the save and continue button',async function(){
    const buttonPath = By.className('govuk-button');
    await driver.wait(until.elementLocated(buttonPath));
    await driver.findElement(buttonPath).click();
});

Then('I want to confirm that the data from the postcode form is displayed correctly', async function () {
    const expectedSummary = postcode;
    const summaryElement = await driver.findElement(By.className('govuk-summary-list__value')).getText();
    assert.strictEqual(summaryElement, expectedSummary);
});
