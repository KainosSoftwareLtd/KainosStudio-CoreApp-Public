import { By, until } from 'selenium-webdriver';
import { Given, Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';

import assert from 'assert';

let formId: string;

Given('I have a form service with the id {string}', function (id: string) {
  formId = id;
});

When('I open the page', async function () {
  await driver.get(`http://localhost:${port}/${formId}`);
});

When('I fill out the form with all the details on the page', async function () {
  await driver.findElement(By.id('f_text_1')).sendKeys('test value');
  await driver.findElement(By.id('f_text_2')).sendKeys('0123456789');
  await driver.findElement(By.id('f_check_1')).sendKeys('Choice 2');
  await driver.findElement(By.id('f_text_3-day')).sendKeys('27');
  await driver.findElement(By.id('f_text_3-month')).sendKeys('01');
  await driver.findElement(By.id('f_text_3-year')).sendKeys('2001');
  await driver.findElement(By.id('f_check_2-2')).click();
});

When('I press the save and exit button', async function () {
  const buttonPath = By.xpath('/html/body/div/main/div/div/form/button[1]');
  await driver.wait(until.elementLocated(buttonPath), 5000);
  await driver.findElement(buttonPath).click();
});

Then('I should see a save confirmation', async function () {
  await driver.wait(until.elementLocated(By.className('govuk-panel__title')), 5000);
  let title = await driver.findElement(By.className('govuk-panel__title')).getText();
  assert.equal(title, 'Enquiry saved');
});
