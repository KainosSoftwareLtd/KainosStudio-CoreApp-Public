import { Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';

import { By } from 'selenium-webdriver';
import assert from 'assert';

let formId: string;
let page: string;

When(
  'I am located on the {string} of the {string} form where i can see the summary',
  async function (pageId: string, id: string) {
    formId = id;
    page = pageId;
    await driver.get(`http://localhost:${port}/${formId}/${page}`);
  },
);

When('I click on the link to change where the dead bird is located', async function () {
  await driver.findElement(By.xpath('/html/body/div/main/div/div/form/dl[2]/div[1]/dd[2]/a')).click();
});

Then(
  'I should be taken to the {string} where i can change the location of the dead bird',
  async function (pageId: string) {
    page = pageId;
    let expectedUrl: string = `http://localhost:${port}/${formId}/${page}`;
    let actualUrl = await driver.getCurrentUrl();
    assert.equal(actualUrl, expectedUrl);
  },
);
