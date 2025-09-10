Feature: Postcode field

Background:
    Given The user has navigated to the postcode form service with an id "postcode-field-automatic-test"

Scenario: Leaving the postcode field empty while it is mandatory
    When I leave the postcode field empty 
    And I attempt to go to the next page of the postcode form using the save and continue button
    Then I should see an error pop up in the error summary at the top of the page saying "Enter postcode"

Scenario: Entering the postcode in the wrong format
    When I enter a wrong postcode into the postcode field 
    And I attempt to move on to the next page of the postcode form using the save and continue button
    Then I should have an error pop up in the error summary at the top of the page saying "Enter a full UK postcode"

Scenario: Entering the right postcode and checking summary page for the right formatting
    When I enter a correct postcode "BT18 8BG" into the postcode field
    And I move on to the next page of the postcode form using the save and continue button
    Then I want to confirm that the data from the postcode form is displayed correctly