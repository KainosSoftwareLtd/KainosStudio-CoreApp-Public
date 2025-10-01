import { Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';
import { By, until } from 'selenium-webdriver';
import assert from 'assert';

let formId: string;
let page: string;

When('I am on the translation form service with the id of {string}', async function (id: string) {
    formId = id;
    await driver.get(`${process.env.TEST_URL}/${formId}`);
});

When('I am on the english version of the service', async function () {
    page = "Page 1?lang=en-GB";
    await driver.get(`${process.env.TEST_URL}/${formId}/${page}`);  
});

When('I translate the service into welsh using a button', async function(){
    const welshButton = By.linkText('Cymraeg');
    await driver.wait(until.elementLocated(welshButton));
    await driver.findElement(welshButton).click();
});

Then('The {string} should be translated into the {string}', async function (element: string, translation: string) {
    const pageElement = await driver.findElement(By.css(element)).getText();
    assert.strictEqual(pageElement, translation);
});
