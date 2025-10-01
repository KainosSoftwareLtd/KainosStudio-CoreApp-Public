import { Given, Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';

import { By, until } from 'selenium-webdriver';
import assert from 'assert';

let formId: string;

Given('I open the form page {string} that accepts no empty fields', async function (id: string) {
    formId = id;
    await driver.get(`${process.env.TEST_URL}/${formId}`);
  });
  
  When('I leave the evenet name field blank and I press the Save and Continue button at the bottom of the form', async function () {
    await driver.findElement(By.id('f-text')).clear();
    const buttonPath = By.className('govuk-button');
    await driver.wait(until.elementLocated(buttonPath));
    await driver.findElement(buttonPath).click();
  });
  
  Then('I should get at error at the top of the submitted form saying {string}', async function (errorMessage: string) {
    const errorElement = await driver.findElement(By.xpath('/html/body/div/main/form/div[1]/div/div/ul/li/a')).getText();
    assert.strictEqual(errorElement, errorMessage);
  });
  
