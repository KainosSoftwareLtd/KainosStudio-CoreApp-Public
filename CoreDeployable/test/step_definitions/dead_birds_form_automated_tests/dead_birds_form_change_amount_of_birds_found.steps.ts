import { Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';

import { By } from 'selenium-webdriver';
import assert from 'assert';

let formId: string;
let page: string;

When(
  'I am located on the {string} on the {string} form where the summary of my answers can be seen',
  async function (pageId: string, id: string) {
    formId = id;
    page = pageId;
    await driver.get(`${process.env.TEST_URL}/${formId}/${page}`);
  },
);

When('I click on a link to change one of my answers', async function () {
  await driver.findElement(By.xpath('/html/body/div/main/div/div/form/dl[3]/div[1]/dd[2]/a')).click();
});

Then(
  'I should be taken to the {string} where i can change how many dead birds I found',
  async function (pageId: string) {
    page = pageId;
    let expectedUrl: string = `${process.env.TEST_URL}/${formId}/${page}`;
    let actualUrl = await driver.getCurrentUrl();
    assert.equal(actualUrl, expectedUrl);
  },
);
