import { Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';

import { By } from 'selenium-webdriver';
import assert from 'assert';

let formId: string;
let page: string;

When(
  'I am on the {string} on the {string} form and I am happy with all my answers',
  async function (pageId: string, id: string) {
    formId = id;
    page = pageId;
    await driver.get(`${process.env.TEST_URL}/${formId}/${page}`);
  },
);

When('I press the button to submit all my answers on the bottom of the page', async function () {
  await driver.findElement(By.name('action')).click();
});

Then('I should see {string} and see that my form has been submitted', async function (expectedMessage: string) {
  let actualMessage = await driver.findElement(By.className('govuk-panel__title')).getText();
  assert.equal(actualMessage, expectedMessage);
});
