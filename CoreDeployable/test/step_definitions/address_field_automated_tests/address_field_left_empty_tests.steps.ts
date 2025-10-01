import { Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';
import { By, until } from 'selenium-webdriver';
import assert from 'assert';

let formId: string;

When('The user has navigated to the address form service with an id {string}', async function (id: string) {
    formId = id;
    await driver.get(`${process.env.TEST_URL}/${formId}`);
});

When('I leave the {string} field empty on the address page', async function (field: string) {
    await driver.findElement(By.id('f-addressInput-line1')).sendKeys('address');
    await driver.findElement(By.id('f-addressInput-town')).sendKeys('town');
    await driver.findElement(By.id('f-addressInput-postcode')).sendKeys('aa01 1aa');
    await driver.findElement(By.id(field)).clear();
});

When('I attempt to move on to the next page by pressing the save and continue button at the bottom of the page',async function(){
    const buttonPath = By.className('govuk-button');
    await driver.wait(until.elementLocated(buttonPath));
    await driver.findElement(buttonPath).click();
});

Then('I should see an error pop up at the top of the address page saying {string}', async function (errorMessage: string) {
    const errorElement = await driver.findElement(By.xpath('//div[contains(@class,"govuk-error-summary")]//a')).getText();
    assert.strictEqual(errorElement, errorMessage);
});
