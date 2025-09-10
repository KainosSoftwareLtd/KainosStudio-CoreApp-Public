import { Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';

import { By } from 'selenium-webdriver';
import assert from 'assert';

let formId: string;
let page: string;

When('I am currently on the {string} of the {string} form', async function (pageId: string, id: string) {
  formId = id;
  page = pageId;
  await driver.get(`http://localhost:${port}/${formId}/${page}`);
});

When('I click the link to change my answer', async function () {
  await driver.findElement(By.xpath('/html/body/div/main/div/div/form/dl[1]/div/dd[2]/a')).click();
});

Then('I should be taken to the {string} where i can change my answer', async function (pageId: string) {
  page = pageId;
  let expectedUrl: string = `http://localhost:${port}/${formId}/${page}`;
  let actualUrl = await driver.getCurrentUrl();
  assert.equal(actualUrl, expectedUrl);
});
