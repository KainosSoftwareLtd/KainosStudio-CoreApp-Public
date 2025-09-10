import { Then, When } from '@cucumber/cucumber';
import { driver } from '../../common.js';
import { By, until } from 'selenium-webdriver';
import assert from 'assert';

let emailAddress: string;

When('I enter a valid email address {string} into the email address field', async function (givenEmailAddress) {
    emailAddress = givenEmailAddress;
    await driver.findElement(By.id('email')).clear();
    await driver.findElement(By.id('email')).sendKeys(emailAddress);
});

When('I move on to the following page of the email address service using the save and continue button', async function () {
    const buttonPath = By.className('govuk-button');
    await driver.wait(until.elementLocated(buttonPath));
    await driver.findElement(buttonPath).click();
});

Then('I want to confirm that the data from the email address input is displayed correctly', async function () {
    const expectedSummary = emailAddress;
    const summaryElement = await driver.findElement(By.className('govuk-summary-list__value')).getText();
    assert.strictEqual(summaryElement, expectedSummary);
});