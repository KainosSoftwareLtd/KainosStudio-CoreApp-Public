---
applyTo: '**'
---

# Automated Testing Instructions for KainosStudio CoreApp

## Project Context
This is a TypeScript/Node.js web application framework that generates form-based services. The project uses ES modules and integrates with AWS S3 for service definitions.

## Testing Framework Stack
- **BDD Testing**: Cucumber with Gherkin syntax
- **Browser Automation**: Selenium WebDriver (Firefox)
- **Performance Testing**: K6 for load testing
- **Language**: TypeScript with ES module syntax
- **Test Runner**: Cucumber-js with ts-node/esm loader

## Project Structure
```
test/
├── features/           # Gherkin feature files (.feature)
├── step_definitions/   # TypeScript step definitions (.steps.ts)
├── kfd-test-files/    # Test data uploaded to S3
├── performance/       # K6 performance test scripts
└── common.ts         # Shared test setup and utilities
```

## Coding Guidelines for Test Automation

### TypeScript & ES Modules
- Always use `import/export` syntax (never `require()`)
- Use async/await for all asynchronous operations
- Enable strict TypeScript compilation
- Import with `.js` extensions for compiled files

### Cucumber Testing Standards
- Write descriptive Gherkin scenarios in Given-When-Then format
- Use `@torun` tags for debugging specific tests
- Keep step definitions focused and reusable
- Use meaningful step names that match business language

### Selenium WebDriver Patterns
- Always maximize browser window in BeforeAll hook
- Use explicit waits with `until` conditions
- Take screenshots on test failures
- Use page object pattern for complex UI interactions
- Clean up driver resources in AfterAll hook

### Performance Testing with K6
- Define realistic thresholds for each endpoint
- Use meaningful tag names for different request types
- Simulate realistic user delays between actions
- Monitor both response time and failure rates
- Test complete user journeys, not just individual endpoints

### Environment & Configuration
- Use environment variables for test URLs and credentials
- Upload test data to S3 before test execution
- Configure proper timeouts (default: 60 seconds for setup)
- Use different ports for local vs. deployed testing

### Error Handling & Debugging
- Include comprehensive error logging
- Capture browser screenshots on failures
- Use descriptive assertion messages
- Handle AWS S3 connection issues gracefully
- Log progress during long-running setup operations

### Test Data Management
- Store test service definitions in `test/kfd-test-files/`
- Update API URLs dynamically based on environment
- Use JSON schema validation for service definitions
- Clean up test data after test execution

## Common Patterns

### Step Definition Example
```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { driver } from '../common.js';
import { By, until } from 'selenium-webdriver';

When('I fill in the {string} field with {string}', async function (fieldId: string, value: string) {
  const element = await driver.wait(until.elementLocated(By.id(fieldId)), 10000);
  await element.clear();
  await element.sendKeys(value);
});
```

## Best Practices
- Test both happy path and error scenarios
- Use realistic test data that reflects production usage
- Keep tests independent and idempotent
- Run performance tests on dedicated environments
- Include accessibility testing where applicable
- Document complex test scenarios with comments
- Use consistent naming conventions across all test files