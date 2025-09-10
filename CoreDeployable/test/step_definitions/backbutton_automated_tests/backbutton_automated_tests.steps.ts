import { Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';

import { By, until } from 'selenium-webdriver';
import assert from 'assert';

let formId: string;
let page: string;

When('I am on the {string} of the {string} form where a submit button is present', async function (pageId: string, id: string) {
  formId = id;
  page = pageId;
  await driver.get(`http://localhost:${port}/${formId}/${page}`);
  });

When('I press the submit button to go to the second page',async function(){
  await driver.wait(until.elementLocated(By.css('button.govuk-button[type="submit"]')), 2000);
  await driver.findElement(By.css('button.govuk-button[type="submit"]')).click();
});

When('I confirm that i am on the next page of the form {string}',async function(pageId:string){
    page = pageId;
    let expectedUrl: string = `http://localhost:${port}/${formId}/${page}`;
    let actualUrl = await driver.getCurrentUrl();
    assert.equal(actualUrl, expectedUrl);
  });

  When('I press the back button to go back to the previous page',async function(){
    await driver.findElement(By.className('govuk-back-link govuk-button--secondary')).click();
  });

Then('I am on the correct {string} page of the form', async function (pageId:string) {
    page = pageId;
    let expectedUrl: string = `http://localhost:${port}/${formId}/${page}`;
    let actualUrl = await driver.getCurrentUrl();
    assert.equal(actualUrl, expectedUrl);
});
