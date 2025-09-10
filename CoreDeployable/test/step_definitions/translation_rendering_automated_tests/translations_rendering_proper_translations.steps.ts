import { Then } from '@cucumber/cucumber';
import { driver } from '../../common.js';
import { By } from 'selenium-webdriver';
import assert from 'assert';

Then('The {string} on the page should be properly translated into their {string}', async function (element: string, translation: string) {
    const pageElement = await driver.findElement(By.css(element)).getText();
    assert.strictEqual(pageElement, translation);
});
