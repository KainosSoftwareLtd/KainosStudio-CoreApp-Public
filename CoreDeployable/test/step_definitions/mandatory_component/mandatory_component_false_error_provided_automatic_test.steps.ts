import { Given, Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';

import { By, until } from 'selenium-webdriver';
import assert from 'assert';

let formId: string;
let page: string;

Given('I open the form page {string} with no validation on the page', async function (id: string) {
    formId = id;
    await driver.get(`http://localhost:${port}/${formId}`);
  });
  
  When('I fill out the form with letters, numbers, blanks and special characters', async function () {
    await driver.findElement(By.id('f-text')).sendKeys('Kainoos');
    await driver.findElement(By.id('f-textarea')).sendKeys('£@$££');
    const dropdown = driver.findElement(By.id('f-dropdown'));
    await dropdown.click(); 
    const optionElement = dropdown.findElement(By.css('#f-dropdown > option:nth-child(3)'));
    await optionElement.click();
    await driver.findElement(By.id('f-radio-2')).click();
    await driver.findElement(By.id('f-checkbox-4')).click();
  });

  When('I press the Save and Continue button at the bottom of the form', async function(){
    const buttonPath = By.className('govuk-button');
    await driver.wait(until.elementLocated(buttonPath));
    await driver.findElement(buttonPath).click();
  })
  
  Then('I should be taken to the {string} of the non mandatory form', async function (pageID: string) {
    page = pageID;
    let expectedUrl: string = `http://localhost:${port}/${formId}/${page}`;
    let actualUrl = await driver.getCurrentUrl();
    assert.equal(actualUrl, expectedUrl);
  });
  
