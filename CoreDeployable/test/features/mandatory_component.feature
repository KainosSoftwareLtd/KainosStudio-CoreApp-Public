Feature: Mandatory Component

Scenario: Not mandatory with no extra validation KFD accepts empty or any value
    Given I open the form page "mandatory-component-false-no-error-automatic-test" where there is no validation on the page
    And I do not fill out the form with any data I press the Save and Continue button at the bottom of the page
    Then I should be taken to the "secondPage" of this not mandatory form

Scenario: Not mandatory with extra validation KFD accepts empty or any value
    Given I open the form page "mandatory-component-false-error-provided-automatic-test" with no validation on the page
    When I fill out the form with letters, numbers, blanks and special characters
    And I press the Save and Continue button at the bottom of the form
    Then I should be taken to the "secondPage" of the non mandatory form

Scenario: Mandatory with no specific validation negative path
    Given I open the form page "mandatory-component-true-no-error-automatic-test" that accepts no empty fields
    And I leave the evenet name field blank and I press the Save and Continue button at the bottom of the form
    Then I should get at error at the top of the submitted form saying "What is the name of the event? cannot be blank"

Scenario: Mandatory with no extra validation happy path
    Given I open the form page "mandatory-component-true-no-error-automatic-test" that accepts no empty values
    When I fill out the form with values such as letters, numbers and special characters
    And I press the Save and Continue button at the bottom of the form to take me to the next page
    Then I should be taken to the "secondPage" of the mandatory form

Scenario: Mandatory with specific validation negative path
    Given I open the form page "mandatory-component-true-error-provided-automatic-test" that accepts specific non-empty values
    When I leave out the name of the event field blank
    And I press the Save and Continue button at the bottom of the mandatory form
    Then I should get an error at the top of the page after submission saying "Please provide the name of the event."

Scenario: Mandatory with specific validation happy path
    Given I open the "mandatory-component-true-error-provided-automatic-test" page which accepts specific non-empty values
    When I provide the form with necessary accepted details on the page
    And I press the Save and Continue button which is at the bottom of the mandatory form
    Then I will be taken to the "secondPage" of the mandatory form

Scenario: Non mandatory with regex set negative path    
    Given I open the "mandatory-field-false-regex-error-provided" page which has regex set for all the fields but none are mandatory
    When I leave the select field empty on the page to trigger the errors
    And I press the Save and Continue button which is at the bottom of the form to submit my answers
    Then I should get an error at the top of the page that match the regex set "Only select one option"

Scenario: Non mandatory with regex set happy path
    Given I am located on the "mandatory-field-false-regex-error-provided" page which has regex set for all the fields but none are mandatory
    When I fill out the page with valid data and select all the necessary options on the page
    And I press the save and continue button at the bottom of the page to submit all of my answers
    Then I should be taken to the "secondPage" of the non mandatory form with the regex set

Scenario: Mandatory form without regex negative path
    Given I am located on the "mandatory-field-true-mandatory-error-only" page that has mandatory fields but no regex set
    When I leave the more details field empty on the form
    And I press the save and continue button and submit my answers
    Then I should see an error on the top of the page which lets me know "This is a mandatory field" 

Scenario: Mandatory form without regex happy path
    Given I am currently located on the "mandatory-field-true-mandatory-error-only" page that has mandatory fields but no regex set
    When I fill out all of the mandatory fields with acceptable data
    And I press the save and continue button which will submit my above answers
    Then I should be taken to the "secondPage" of this form with mandatory fields

Scenario: Mandatory form with regex returns correct error message
    Given I am currently on the "mandatory-field-true-regex-and-mandatory-error" page that has mandatory fields and regex validation
    When I fill out the name of even field with "<invalid_data>" 
    And I press the save and continue button which is at the very bottom of the mandatory with regex form
    Then I should get an error back at the top of the page that matches the "<specific_error_message>"

    Examples:
      | invalid_data                         | specific_error_message        |
      | 444                                  | Only letter                   |
      | null                                 | Please provide more detail.   |

Scenario: Mandator fields form with regex validation happy path
    Given I am currently on the "mandatory-field-true-regex-and-mandatory-error" page that has both mandatory fields and regex validation
    When  I fill out the page with valid data that meet the requirements of the regex 
    And I click the save and continue button at the bottom of the page to submit my data
    Then My answers shoul be accepted and I should be taken to the "secondPage" of the form 