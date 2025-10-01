import { Given, Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';
import { By } from 'selenium-webdriver';
import assert from 'assert';

let formId: string;

Given('The user is on the form service with the id of {string}', async function (id: string) {
    formId = id;
    await driver.get(`${process.env.TEST_URL}/${formId}`);
});

When('I choose to click the start now button to begin the dead birds form', async function () {
    await driver.findElement(By.name('action')).click();
});

Then('I should be redirected to {string} of this form', async function (nextPage: string) {
    const expectedUrl = `${process.env.TEST_URL}/${formId}/${nextPage}`;
    const actualUrl = await driver.getCurrentUrl();
    assert.equal(actualUrl, expectedUrl);
});
