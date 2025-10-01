import { Given, Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';

import { By, until } from 'selenium-webdriver';
import assert from 'assert';

let formId: string;
let page: string;

Given('I am currently on the {string} page that has both mandatory fields and regex validation', async function (id: string) {
    formId = id;
    await driver.get(`${process.env.TEST_URL}/${formId}`);
  });
  
  When('I fill out the page with valid data that meet the requirements of the regex', async function () {
    await driver.findElement(By.id('f-text')).sendKeys('kainoos');
    await driver.findElement(By.id('f-textarea')).sendKeys('details');
    const dropdown = driver.findElement(By.id('f-dropdown'));
    await dropdown.click(); 
    const optionElement = dropdown.findElement(By.css('#f-dropdown > option:nth-child(3)'));
    await optionElement.click();
    await driver.findElement(By.id('f-radio-2')).click();
    await driver.findElement(By.id('f-checkbox-2')).click();
  });

  When('I click the save and continue button at the bottom of the page to submit my data', async function(){
    const buttonPath = By.className('govuk-button');
    await driver.wait(until.elementLocated(buttonPath));
    await driver.findElement(buttonPath).click();
  })
  
  Then('My answers shoul be accepted and I should be taken to the {string} of the form', async function (pageID: string) {
    page = pageID;
    let expectedUrl: string = `${process.env.TEST_URL}/${formId}/${page}`;
    let actualUrl = await driver.getCurrentUrl();
    assert.equal(actualUrl, expectedUrl);
  });
  
