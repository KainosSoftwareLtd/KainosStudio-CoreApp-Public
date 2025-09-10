import { Then, When } from '@cucumber/cucumber';
import { driver } from '../../common.js';
 
import { By } from 'selenium-webdriver';
import assert from 'assert';
 
When('I type in the {string} into a text field', async function (wrongChar: string) {
  await driver.findElement(By.id('corvids')).clear();
  await driver.findElement(By.id('corvids')).sendKeys(wrongChar);
});
 
When('I press the continue button on the bottom of the page', async function () {
  await driver.findElement(By.name('action')).click();
});
 
Then('I should see an error stating {string}', async function (errorMessage) {
  const errorElement = await driver.findElement(By.css('h2.govuk-error-summary__title')).getText();
  assert.strictEqual(errorElement, errorMessage);
});