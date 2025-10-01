import { Then, When } from '@cucumber/cucumber';
import { driver, port } from '../../common.js';

import { By } from 'selenium-webdriver';
import assert from 'assert';

When('I enter the form URL with the ID {string} in randomly mixed case', async function (mixedCaseId: string) {
  await driver.get(`${process.env.TEST_URL}/${mixedCaseId}`);
});

Then('the correct page content should be displayed', async function () {
  const pageHeaderText = await driver
    .findElement(By.xpath('//a[@class="govuk-header__link govuk-header__service-name"]'))
    .getText();

  assert.equal(pageHeaderText, 'Example for API validation');
});
