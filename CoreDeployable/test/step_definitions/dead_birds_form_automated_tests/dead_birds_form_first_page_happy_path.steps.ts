import { Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';

import { By } from 'selenium-webdriver';
import assert from 'assert';

let formId: string;
let page: string;

When('I select a radio field', async function () {
  await driver.findElement(By.xpath('//*[@id="f_radio_1-2"]')).click();
});

When('I click the button to continue', async function () {
  await driver.findElement(By.name('action')).click();
});

Then(
  'I should be taken to the second page of the {string} with the page id {string}',
  async function (form: string, pageId: string) {
    formId = form;
    page = pageId;
    let expectedUrl: string = `http://localhost:${port}/${formId}/${page}`;
    let actualUrl = await driver.getCurrentUrl();
    assert.equal(actualUrl, expectedUrl);
  },
);
