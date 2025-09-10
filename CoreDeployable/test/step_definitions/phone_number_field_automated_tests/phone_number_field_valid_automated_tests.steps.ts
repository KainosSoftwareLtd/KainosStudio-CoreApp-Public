import { Then, When } from '@cucumber/cucumber';
import { driver } from '../../common.js';
import { By, until } from 'selenium-webdriver';
import assert from 'assert';

let phoneNumber : string;

When('I enter a valid phone number {string} into the phone number field', async function (givenPhoneNumber) {
    phoneNumber = givenPhoneNumber;
    await driver.findElement(By.id('phone')).clear();
    await driver.findElement(By.id('phone')).sendKeys(phoneNumber);
});

When('I move on to the following page of the phone number service using the save and continue button',async function(){
    const buttonPath = By.className('govuk-button');
    await driver.wait(until.elementLocated(buttonPath));
    await driver.findElement(buttonPath).click();
});

Then('I want to confirm that the data from the phone number input is displayed correctly', async function () {
    const expectedSummary = phoneNumber;
    const summaryElement = await driver.findElement(By.className('govuk-summary-list__value')).getText();
    assert.strictEqual(summaryElement, expectedSummary);
});
