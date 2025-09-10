import { Then, When } from '@cucumber/cucumber';
import { driver } from '../../common.js';
import { By, until } from 'selenium-webdriver';
import assert from 'assert';

When('I enter an invalid email address into the email address field', async function () {
    await driver.findElement(By.id('email')).sendKeys('invalid@email');
});

When('I attempt to continue to the following page of the email address service using the save and continue button', async function () {
    const buttonPath = By.className('govuk-button');
    await driver.wait(until.elementLocated(buttonPath));
    await driver.findElement(buttonPath).click();
});

Then('I should have an email error present in the error summary at the top of the page saying {string}', async function (errorMessage: string) {
    const errorElement = await driver.findElement(By.xpath('//*[@id="main-content"]/form/div[1]/div/div/ul/li/a')).getText();
    assert.strictEqual(errorElement, errorMessage);
});