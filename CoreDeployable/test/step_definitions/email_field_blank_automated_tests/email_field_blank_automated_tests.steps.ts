import { Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';
import { By, until } from 'selenium-webdriver';
import assert from 'assert';

let formId: string;

When('The user has navigated to the email address test service with an id {string}', async function (id: string) {
    formId = id;
    await driver.get(`http://localhost:${port}/${formId}`);
});

When('I leave the email address field blank', async function () {
    await driver.findElement(By.id('email')).clear();
});

When('I attempt to navigate to the following page of the email address service using the save and continue button', async function () {
    const buttonPath = By.className('govuk-button');
    await driver.wait(until.elementLocated(buttonPath));
    await driver.findElement(buttonPath).click();
});

Then('I should see an email error appear in the error summary at the top of the page saying {string}', async function (errorMessage: string) {
    const errorElement = await driver.findElement(By.xpath('//*[@id="main-content"]/form/div[1]/div/div/ul/li/a')).getText();
    assert.strictEqual(errorElement, errorMessage);
});