import { By, until } from 'selenium-webdriver';
import { Given, Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';

import assert from 'assert';

let formId: string;

Given('The user is on the form with the ID {string} that has radio buttons with conditional logic', async function (id: string) {
  formId = id;
  await driver.get(`http://localhost:${port}/${formId}`);
});

When('I select a {string} radio field', async function (radioField: string) {
  await driver.findElement(By.id(radioField)).click();
});

When('I select the save and continue button at the very bottom of the page to submit the selected radio button', async function () {
    const buttonPath = By.className('govuk-button');
    await driver.wait(until.elementLocated(buttonPath));
    await driver.findElement(buttonPath).click();
});


Then('I should be taken to the right {string} of the form', async function (page:string) {
    let expectedUrl: string = `http://localhost:${port}/${formId}/${page}`;
    let actualUrl = await driver.getCurrentUrl();
    assert.equal(actualUrl, expectedUrl);
});

