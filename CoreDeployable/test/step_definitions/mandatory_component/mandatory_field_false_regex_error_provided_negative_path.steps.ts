import { Given, Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';

import { By, until } from 'selenium-webdriver';
import assert from 'assert';

let formId: string;

Given('I open the {string} page which has regex set for all the fields but none are mandatory', async function (id: string) {
    formId = id;
    await driver.get(`http://localhost:${port}/${formId}`);
  });
  
  When('I leave the select field empty on the page to trigger the errors', async function () {
    await driver.findElement(By.id('f-text')).clear();
    await driver.findElement(By.id('f-textarea')).clear();
    const dropdown = driver.findElement(By.id('f-dropdown'));
    await dropdown.click(); 
    const optionElement = dropdown.findElement(By.css('#f-dropdown > option:nth-child(1)'));
    await optionElement.click();
  });

  When('I press the Save and Continue button which is at the bottom of the form to submit my answers', async function(){
    const buttonPath = By.className('govuk-button');
    await driver.wait(until.elementLocated(buttonPath));
    await driver.findElement(buttonPath).click();
  })
  
  Then('I should get an error at the top of the page that match the regex set {string}', async function (errorMessage: string) {
    const errorElement = await driver.findElement(By.xpath('/html/body/div/main/form/div[1]/div/div/ul/li/a')).getText();
    assert.strictEqual(errorElement, errorMessage);
  });
  
