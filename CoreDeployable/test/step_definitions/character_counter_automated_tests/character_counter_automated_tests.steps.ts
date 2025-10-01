import { Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';

import { By } from 'selenium-webdriver';
import assert from 'assert';

let formId: string;

When('I am currently on the {string} form with a text box', async function (id: string) {
    formId = id;
    await driver.get(`${process.env.TEST_URL}/${formId}`);
  },
);

When('The text box on the page is empty', async function () {
  await driver.findElement(By.id('f_textarea_1')).clear();
});

When('There should be a message on the bottom of the text box stating {string}', async function (expectedMessage:string) {
    let actualMessage = await driver.findElement(By.className('govuk-character-count__message govuk-character-count__status govuk-hint')).getText();
    assert.equal(actualMessage, expectedMessage);
  });

When('I add the text {string} to the text box on the page', async function (text:string) {
    await driver.findElement(By.id('f_textarea_1')).sendKeys(text);
  },);

Then('The message at the bottom of the screen should adjust to {string}', async function (newCharLength:string) {
    let actualMessage = await driver.findElement(By.className('govuk-character-count__message govuk-character-count__status govuk-hint')).getText();
    assert.equal(actualMessage, newCharLength);
})
