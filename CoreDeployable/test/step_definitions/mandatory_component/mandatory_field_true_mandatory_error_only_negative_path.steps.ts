import { Given, Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';

import { By, until } from 'selenium-webdriver';
import assert from 'assert';

let formId: string;

Given('I am located on the {string} page that has mandatory fields but no regex set', async function (id: string) {
    formId = id;
    await driver.get(`${process.env.TEST_URL}/${formId}`);
  });
  
  When('I leave the more details field empty on the form', async function () {
    await driver.findElement(By.id('f-text')).sendKeys('kainoos');
    await driver.findElement(By.id('f-textarea')).clear();
    const dropdown = driver.findElement(By.id('f-dropdown'));
    await dropdown.click(); 
    const optionElement = dropdown.findElement(By.css('#f-dropdown > option:nth-child(3)'));
    await optionElement.click();
    await driver.findElement(By.id('f-radio-2')).click();
    await driver.findElement(By.id('f-checkbox-4')).click();
  });

  When('I press the save and continue button and submit my answers', async function(){
    const buttonPath = By.className('govuk-button');
    await driver.wait(until.elementLocated(buttonPath));
    await driver.findElement(buttonPath).click();
  })
  
  Then('I should see an error on the top of the page which lets me know {string}', async function (errorMessage: string) {
    const errorElement = await driver.findElement(By.xpath('/html/body/div/main/form/div[1]/div/div/ul/li/a')).getText();
    assert.strictEqual(errorElement, errorMessage);
  });
  
