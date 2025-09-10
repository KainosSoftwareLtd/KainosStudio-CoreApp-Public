Feature: Phone number field

Background:
    Given The user has navigated to the phone number test service with an id "phone-number-test"

Scenario: Leaving the phone number field empty while it is mandatory
    When I leave the phone number field blank 
    And I attempt to navigate to the following page of the phone number service using the save and continue button
    Then I should see an error appear in the error summary at the top of the page saying "Enter a phone number"

Scenario: Entering an invalid phone number
    When I enter an invalid phone number into the phone number field 
    And I attempt to continue to the following page of the phone number service using the save and continue button
    Then I should have an error present in the error summary at the top of the page saying "Enter a phone number, like 01632 960 001, 07700 900 982 or +44 808 157 0192"

Scenario: Entering a valid phone number and checking summary page for the right formatting
    When I enter a valid phone number "07000000000" into the phone number field
    And I move on to the following page of the phone number service using the save and continue button
    Then I want to confirm that the data from the phone number input is displayed correctly