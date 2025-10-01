import { By, until } from 'selenium-webdriver';
import { Given, Then, When } from '@cucumber/cucumber';
import { driver, port } from '../common.js'

import assert from 'assert';

let formId: string;

Given('I have a form service with id {string}', function (id: string) {
  formId = id;
});

When('I open the form page', async function () {
  await driver.get(`${process.env.TEST_URL}/${formId}`);
});

When('I fill out the form', async function () {
  await driver.findElement(By.name('f_text_1')).sendKeys('test value');
  await driver.findElement(By.name('f_text_2')).sendKeys('0123456789');
});

When('I submit the form', async function () {
  await driver.findElement(By.xpath("//button[normalize-space()='Submit']")).click();
});

Then('I should see a submission confirmation', async function () {
  await driver.wait(until.elementLocated(By.className('govuk-panel__title')), 5000);
  let title = await driver.findElement(By.className('govuk-panel__title')).getText();
  assert.equal(title, 'Enquiry submitted');
});