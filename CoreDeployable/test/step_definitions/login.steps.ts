import { By, until } from 'selenium-webdriver';
import { Given, Then, When } from '@cucumber/cucumber';
import { driver, port } from '../common.js';

import assert from 'assert';

let formId: string;

Given('I have a form service requires auth with id {string}', function (id: string) {
  formId = id;
});

When('I open the form page I am redirected to the login page', async function () {
  await driver.get(`http://localhost:${port}/${formId}`);
  const entryPoint = process.env.TEST_AUTH_ENTRY_POINT;
  if (!entryPoint) {
    throw new Error('TEST_AUTH_ENTRY_POINT environment variable is not set');
  }
  const urlObj = new URL(entryPoint);
  const baseUrl = `${urlObj.host}`;
  await driver.wait(until.urlMatches(new RegExp(`^.*${baseUrl}.*$`)));
});

When('I fill out the credentials', async function () {
  const testUsername = process.env.TEST_USERNAME;
  if (!testUsername) {
    throw new Error('TEST_USERNAME environment variable is not set');
  }

  const testPassword = process.env.TEST_PASSWORD;
  if (!testPassword) {
    throw new Error('TEST_PASSWORD environment variable is not set');
  }

  await driver.findElement(By.name('username')).sendKeys(testUsername);
  await driver.findElement(By.name('password')).sendKeys(testPassword);
});

When('I log in', async function () {
  await driver.findElement(By.xpath("//button[normalize-space()='Continue']")).click();
});

Then('I should be redirected to service page', async function () {
  const byHeading = By.className('govuk-heading-xl');
  await driver.wait(until.elementLocated(byHeading));

  const title = await driver.findElement(byHeading).getText();
  assert.equal(title, 'KFP auth test heading');
});
