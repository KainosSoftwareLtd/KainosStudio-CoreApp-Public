Feature: Email address field

Background:
    Given The user has navigated to the email address test service with an id "email-address-test"

Scenario: Leaving the email address field empty while it is mandatory
    When I leave the email address field blank
    And I attempt to navigate to the following page of the email address service using the save and continue button
    Then I should see an email error appear in the error summary at the top of the page saying "Enter an email address"

Scenario: Entering an invalid email address
    When I enter an invalid email address into the email address field
    And I attempt to continue to the following page of the email address service using the save and continue button
    Then I should have an email error present in the error summary at the top of the page saying "Enter an email address in the correct format, like name@example.com"

Scenario: Entering a valid email address and checking summary page for the right formatting
    When I enter a valid email address "test@example.com" into the email address field
    And I move on to the following page of the email address service using the save and continue button
    Then I want to confirm that the data from the email address input is displayed correctly
