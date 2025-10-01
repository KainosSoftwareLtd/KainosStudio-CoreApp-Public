import { Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';
import { By } from 'selenium-webdriver';
import assert from 'assert';

let formId: string = 'report-demo-test';  
let page: string;

When('I am currently on the {string} of the system but I want to go back', async function (pageId: string) {
    page = pageId;
    await driver.get(`${process.env.TEST_URL}/${formId}/${page}`);  
});

When('I click the back button on the fourth, third and second pages', async function () {
  await driver.findElement(By.className('govuk-back-link')).click();
  await driver.findElement(By.className('govuk-back-link')).click();
  await driver.findElement(By.className('govuk-back-link')).click();
});

Then('I should be brought to the {string}', async function (pageId: string) {
    page = pageId;
    let expectedUrl: string = `${process.env.TEST_URL}/${formId}/${page}`;
    let actualUrl = await driver.getCurrentUrl();
    assert.equal(actualUrl, expectedUrl);
  });

