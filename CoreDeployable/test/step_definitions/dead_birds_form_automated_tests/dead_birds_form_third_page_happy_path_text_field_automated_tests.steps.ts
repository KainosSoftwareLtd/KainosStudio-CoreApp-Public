import { Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';
 
import { By } from 'selenium-webdriver';
import assert from 'assert';
 
let formId: string;
let page: string;
 
When('I type in the {int} into each of the text fields', async function (amountOfBirds:number) {
  await driver.findElement(By.id('birds_of_prey')).clear();
  await driver.findElement(By.id('birds_of_prey')).sendKeys(amountOfBirds);
  await driver.findElement(By.id('corvids')).clear();
  await driver.findElement(By.id('corvids')).sendKeys(amountOfBirds);
  await driver.findElement(By.id('ducks')).sendKeys(amountOfBirds);
  await driver.findElement(By.id('gamebirds')).sendKeys(amountOfBirds);
  await driver.findElement(By.id('geese')).sendKeys(amountOfBirds);
  await driver.findElement(By.id('herons_egrets')).sendKeys(amountOfBirds);
  await driver.findElement(By.id('pigeons_doves')).sendKeys(amountOfBirds);
  await driver.findElement(By.id('rails_crakes')).sendKeys(amountOfBirds);
  await driver.findElement(By.id('songbirds_garden_birds')).sendKeys(amountOfBirds);
  await driver.findElement(By.id('swans')).sendKeys(amountOfBirds);
  await driver.findElement(By.id('other_wild_birds')).sendKeys(amountOfBirds);
   await driver.findElement(By.id('describe_wild_birds')).click();
  await driver.findElement(By.id('gulls_seabirds_waders')).click();
  await driver.findElement(By.id('gulls')).sendKeys(amountOfBirds);
  await driver.findElement(By.id('seabirds')).sendKeys(amountOfBirds);
  await driver.findElement(By.id('waders')).sendKeys(amountOfBirds);
});
 
When('I press the continue button', async function () {
  await driver.findElement(By.name('action')).click();
});
 
Then('I should be taken to the {string} page of the {string} form', async function (pageId: string, form: string) {
  formId = form;
  page = pageId;
  const expectedUrl: string = `http://localhost:${port}/${formId}/${page}`;
  const actualUrl = await driver.getCurrentUrl();
  assert.equal(actualUrl, expectedUrl);
});
 
 