import { Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';
import { By, until } from 'selenium-webdriver';
import assert from 'assert';

let formId: string;
let page: string;

When('The user has navigated to the translation form service with an id {string}', async function (id: string) {
    formId = id;
    await driver.get(`http://localhost:${port}/${formId}`);
});

When('The user is on the english version of the form service', async function () {
    page = "firstPage?lang=en-GB";
    await driver.get(`http://localhost:${port}/${formId}/${page}`);  
});

When('I press the button to translate my service into Welsh', async function(){
    const welshButton = By.linkText('Cymraeg');
    await driver.wait(until.elementLocated(welshButton));
    await driver.findElement(welshButton).click();
});

Then('The {string} {string} should show up in english while the other elements show up in welsh', async function (element: string, translation: string) {
    const pageElement = await driver.findElement(By.id(element)).getText();
    assert.strictEqual(pageElement, translation);
});
