import { Then, When } from '@cucumber/cucumber';
import { driver } from '../../common.js';

import { By, until } from 'selenium-webdriver';
import assert from 'assert';

When('I leave all of the fields in the date field empty on the page', async function () {
    await driver.findElement(By.id('name-of-event-field')).sendKeys('£@$££');
    await driver.findElement(By.id('more-details-field')).sendKeys('£@$££');
    const dropdown = driver.findElement(By.id('f-dropdown'));
    await dropdown.click(); 
    const optionElement = dropdown.findElement(By.css('#f-dropdown > option:nth-child(3)'));
    await optionElement.click();
    await driver.findElement(By.id('f-dateInput-day')).clear();
    await driver.findElement(By.id('f-dateInput-month')).clear();
    await driver.findElement(By.id('f-dateInput-year')).clear();
});

When('I press the save and continue button to submit all three empty date fields', async function () {
    const buttonPath = By.className('govuk-button');
    await driver.wait(until.elementLocated(buttonPath));
    await driver.findElement(buttonPath).click();
});

Then('I should get an error to appear at the top of the page which relates to the date field and says {string}', async function (errorMessage: string) {
    const errorElement = await driver.findElement(By.xpath('/html/body/div/main/div/div/div/ul/li/a')).getText();
    assert.strictEqual(errorElement, errorMessage);
});
