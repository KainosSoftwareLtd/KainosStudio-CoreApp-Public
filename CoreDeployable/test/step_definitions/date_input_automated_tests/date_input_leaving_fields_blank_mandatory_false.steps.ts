import { Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';
import { By, until } from 'selenium-webdriver';
import assert from 'assert';

let formId: string;

When('I navigate in the {string} to the {string} of the form', async function (id: string, page: string) {
    formId = id;
    await driver.get(`http://localhost:${port}/${formId}/${page}`);
});

When('I use the button at the bottom of the page to submit without entering any values', async function () {
    const buttonPath = By.className('govuk-button');
    await driver.wait(until.elementLocated(buttonPath));
    await driver.findElement(buttonPath).click();
});

Then('I should be brought to the {string} of the form', async function (nextPage: string) {
    const expectedUrl = `http://localhost:${port}/${formId}/${nextPage}`;
    const actualUrl = await driver.getCurrentUrl();
    assert.equal(actualUrl, expectedUrl);
});
