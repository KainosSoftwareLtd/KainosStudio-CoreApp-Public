import { Given, Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';

import { By, until } from 'selenium-webdriver';
import assert from 'assert';

let formId: string;
let page: string;

Given('I open the form page {string} where there is no validation on the page', async function (id: string) {
    formId = id;
    await driver.get(`http://localhost:${port}/${formId}`);
  });
  
  When('I do not fill out the form with any data I press the Save and Continue button at the bottom of the page', async function () {
    const buttonPath = By.className('govuk-button');
    await driver.wait(until.elementLocated(buttonPath));
    await driver.findElement(buttonPath).click();
  });
  
  Then('I should be taken to the {string} of this not mandatory form', async function (pageID: string) {
    page = pageID;
    let expectedUrl: string = `http://localhost:${port}/${formId}/${page}`;
    let actualUrl = await driver.getCurrentUrl();
    assert.equal(actualUrl, expectedUrl);
  });
  
