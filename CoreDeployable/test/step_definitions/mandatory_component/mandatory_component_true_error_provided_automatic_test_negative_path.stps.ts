import { Given, Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';

import { By, until } from 'selenium-webdriver';
import assert from 'assert';

let formId: string;

Given('I open the form page {string} that accepts specific non-empty values', async function (id: string) {
    formId = id;
    await driver.get(`http://localhost:${port}/${formId}`);
  });
  
  When('I leave out the name of the event field blank', async function () {
    await driver.findElement(By.id('f-text')).clear();
  });

  When('I press the Save and Continue button at the bottom of the mandatory form', async function(){
    const buttonPath = By.className('govuk-button');
    await driver.wait(until.elementLocated(buttonPath));
    await driver.findElement(buttonPath).click();
  })
  
  Then('I should get an error at the top of the page after submission saying {string}', async function (errorMessage: string) {
    const errorElement = await driver.findElement(By.xpath('/html/body/div/main/form/div[1]/div/div/ul/li/a')).getText();
    assert.strictEqual(errorElement, errorMessage);
  });
  
