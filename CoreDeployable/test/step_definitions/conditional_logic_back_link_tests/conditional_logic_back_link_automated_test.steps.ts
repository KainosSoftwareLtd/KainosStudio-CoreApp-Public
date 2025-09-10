import { By, until } from 'selenium-webdriver';
import { Given, Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';

import assert from 'assert';

let formId: string;

Given('I am on the {string} service which has radio fields with conditional logic', async function (id: string) {
  formId = id;
  await driver.get(`http://localhost:${port}/${formId}`);
});

When('I select a {string} with conditional logic that is linked to a page', async function (radioField: string) {
  await driver.findElement(By.id(radioField)).click();
});

When('I select the save and continue button at the bottom of the page to submit my radio field selection', async function () {
    const buttonPath = By.className('govuk-button');
    await driver.wait(until.elementLocated(buttonPath));
    await driver.findElement(buttonPath).click();
});

When('I am on the next page and click the back link', async function () {
    const backLink = By.className('govuk-back-link');
    await driver.wait(until.elementLocated(backLink));
    await driver.findElement(backLink).click();
});

Then('I should be taken back to the {string} page which is the first page of the service', async function (page:string) {
    let expectedUrl: string = `http://localhost:${port}/${formId}/${page}`;
    let actualUrl = await driver.getCurrentUrl();
    assert.equal(actualUrl, expectedUrl);
});

