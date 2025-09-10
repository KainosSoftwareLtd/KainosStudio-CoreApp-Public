import { By, until } from 'selenium-webdriver';
import { Given, Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';

import assert from 'assert';

let formId: string;
let page: string;

Given('I am on the the {string} {string}', async function (id: string, pageId: string) {
  formId = id;
  page = pageId;
  let expectedUrl: string = `http://localhost:${port}/${formId}/${page}`;
  let actualUrl = await driver.getCurrentUrl();
  assert.equal(actualUrl, expectedUrl);
});

When('I fill out the fields', async function () {
  await driver.findElement(By.id('f_text_4')).sendKeys('testing testing');
  await driver.findElement(By.id('f_text_5')).sendKeys('122211212211');
});

When('I press the save and exit button on the second page', async function () {
  const buttonPath = By.xpath('/html/body/div/main/div/div/form/button[2]');
  await driver.wait(until.elementLocated(buttonPath));
  await driver.findElement(buttonPath).click();
});

Then('I should be able to see a save confirmation', async function () {
  await driver.wait(until.elementLocated(By.className('govuk-panel__title')), 5000);
  let title = await driver.findElement(By.className('govuk-panel__title')).getText();
  assert.equal(title, 'Enquiry saved');
});
