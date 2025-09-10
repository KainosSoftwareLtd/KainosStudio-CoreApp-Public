import { Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';
import { By } from 'selenium-webdriver';
import assert from 'assert';

let formId: string;
let page: string;

When('I am on the welsh cookie page of the translated service {string}', async function (id:string) {
    formId = id;
    page = "cookie?lang=cy-GB";
    await driver.get(`http://localhost:${port}/${formId}/${page}`);  
});

Then('The {string} elements should be translated into the {string}', async function (element: string, translation: string) {
    const pageElement = await driver.findElement(By.css(element)).getText();
    assert.strictEqual(pageElement, translation);
});
