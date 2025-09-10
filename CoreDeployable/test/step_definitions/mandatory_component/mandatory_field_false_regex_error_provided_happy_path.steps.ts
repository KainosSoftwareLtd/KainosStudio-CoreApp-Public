import { Given, Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';

import { By, until } from 'selenium-webdriver';
import assert from 'assert';

let formId: string;
let page: string;

Given('I am located on the {string} page which has regex set for all the fields but none are mandatory', async function (id: string) {
    formId = id;
    await driver.get(`http://localhost:${port}/${formId}`);
  });
  
  When('I fill out the page with valid data and select all the necessary options on the page', async function () {
    await driver.findElement(By.id('f-dateInput-day')).sendKeys('27');
    await driver.findElement(By.id('f-dateInput-month')).sendKeys('01');
    await driver.findElement(By.id('f-dateInput-year')).sendKeys('2000');
    await driver.findElement(By.id('f-text')).sendKeys('kainoos');
    await driver.findElement(By.id('f-textarea')).sendKeys('details');
    const dropdown = driver.findElement(By.id('f-dropdown'));
    await dropdown.click(); 
    const optionElement = dropdown.findElement(By.css('#f-dropdown > option:nth-child(3)'));
    await optionElement.click();
    await driver.findElement(By.id('f-radio-2')).click();
    await driver.findElement(By.id('f-checkbox-4')).click();
  });

  When('I press the save and continue button at the bottom of the page to submit all of my answers', async function(){
    const buttonPath = By.className('govuk-button');
    await driver.wait(until.elementLocated(buttonPath));
    await driver.findElement(buttonPath).click();
  })
  
  Then('I should be taken to the {string} of the non mandatory form with the regex set', async function (pageID: string) {
    page = pageID;
    let expectedUrl: string = `http://localhost:${port}/${formId}/${page}`;
    let actualUrl = await driver.getCurrentUrl();
    assert.equal(actualUrl, expectedUrl);
  });
  
