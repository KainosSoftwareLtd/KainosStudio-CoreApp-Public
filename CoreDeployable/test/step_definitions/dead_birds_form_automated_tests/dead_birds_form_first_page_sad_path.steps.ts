import { Then, When } from '@cucumber/cucumber';
import { driver } from '../../common.js';

import { By } from 'selenium-webdriver';
import assert from 'assert';

let expectedError: string;

When('I click the button to continue without filling out the radio fields', async function () {
    await driver.findElement(By.name('action')).click();
});

Then('I should see an error returned {string}', async function (error:string) {
    expectedError = error;
    let actualError = await driver
    .findElement(By.xpath('/html/body/div/main/div/div/form/div[1]/div/div/ul/li/a'))
    .getText();
    
    assert.equal(actualError, expectedError);
});
