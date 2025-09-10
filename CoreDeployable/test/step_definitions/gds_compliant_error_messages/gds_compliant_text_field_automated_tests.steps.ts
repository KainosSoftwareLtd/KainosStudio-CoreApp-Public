import { Given, Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';

import { By, until } from 'selenium-webdriver';
import assert from 'assert';

let formId: string;

Given('I am located on the {string} form which has error messages complaint with GDS standards', async function (id: string) {
  formId = id;
  await driver.get(`http://localhost:${port}/${formId}`);
});

When('I clear all of the fields on the page to have an empty canvas', async function () {
    await driver.findElement(By.id('name-of-event-field')).clear();
    await driver.findElement(By.id('more-details-field')).clear();
    const dropdown = driver.findElement(By.id('f-dropdown'));
    await dropdown.click(); 
    const optionElement = dropdown.findElement(By.css('#f-dropdown > option:nth-child(1)'));
    await optionElement.click();
    await driver.findElement(By.id('f-dateInput-day')).clear();
    await driver.findElement(By.id('f-dateInput-month')).clear();
    await driver.findElement(By.id('f-dateInput-year')).clear();
});

When('I leave the specific text field {string} empty', async function (field: string) {
    await driver.findElement(By.id('name-of-event-field')).sendKeys('£@$££');
    await driver.findElement(By.id('more-details-field')).sendKeys('£@$££');
    const dropdown = driver.findElement(By.id('f-dropdown'));
    await dropdown.click(); 
    const optionElement = dropdown.findElement(By.css('#f-dropdown > option:nth-child(3)'));
    await optionElement.click();
    await driver.findElement(By.id('f-dateInput-day')).sendKeys('27');
    await driver.findElement(By.id('f-dateInput-month')).sendKeys('01');
    await driver.findElement(By.id('f-dateInput-year')).sendKeys('2001');
    await driver.findElement(By.name(field)).clear();
});

When('I press the save and continue button at the bottom of my page to submit the empty text field', async function () {
    const buttonPath = By.className('govuk-button');
    await driver.wait(until.elementLocated(buttonPath));
    await driver.findElement(buttonPath).click();
});

Then('I should see an error at the top of the page that meets the GDS compiance {string}', async function (errorMessage: string) {
    const errorElement = await driver.findElement(By.xpath('/html/body/div/main/div/div/div/ul/li[2]/a')).getText();
    assert.strictEqual(errorElement, errorMessage);
});
