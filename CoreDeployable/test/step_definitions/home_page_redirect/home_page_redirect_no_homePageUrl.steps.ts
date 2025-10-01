import { By, until } from 'selenium-webdriver';
import { Given, Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';

import assert from 'assert';

let formId: string;
let page: string;

Given('I have a form service which has an id {string}', function (id: string) {
  formId = id;
});

When('I open the above specified page', async function () {
  await driver.get(`${process.env.TEST_URL}/${formId}`);
});

When('I click on the home button in the top left', async function () {
    const buttonPath = By.xpath('/html/body/header/div/div[1]/a');
    await driver.wait(until.elementLocated(buttonPath));
    await driver.findElement(buttonPath).click();
});


Then('I should be taken to the {string} page', async function (pageId: string) {
  page = pageId;
    let expectedUrl: string = `${process.env.TEST_URL}/${formId}/${page}`;
    let actualUrl = await driver.getCurrentUrl();
    assert.equal(actualUrl, expectedUrl);
});
