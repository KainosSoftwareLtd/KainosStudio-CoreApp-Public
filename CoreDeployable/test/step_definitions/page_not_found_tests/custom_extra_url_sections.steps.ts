import { Given, Then } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';

import { By } from 'selenium-webdriver';
import assert from 'assert';

let formId: string;

Given('I am on the service {string} which has a custom page not found message set with extra sections in the URL', async function (id: string) {
    formId = id;
    await driver.get(`http://localhost:${port}/${formId}/extra/extra`);
  });
  
  Then('I should see my custom page not found which says {string}', async function (errorMessage: string) {
    const errorElement = await driver.findElement(By.className('govuk-body')).getText();
    assert.strictEqual(errorElement, errorMessage);
  });
  
