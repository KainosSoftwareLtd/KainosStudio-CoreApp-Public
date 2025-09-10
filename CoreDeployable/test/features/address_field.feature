Feature: Address field

Background:
    Given The user has navigated to the address form service with an id "address-field-automatic-test"

Scenario: Leaving the mandatory address fields empty
    When I leave the "<non_optional>" field empty on the address page
    And I attempt to move on to the next page by pressing the save and continue button at the bottom of the page
    Then I should see an error pop up at the top of the address page saying "<error_message>"

    Examples:
    | non_optional            | error_message                                           |
    | f-addressInput-line1    | Enter address line 1, typically the building and street |
    | f-addressInput-town     | Enter town or city                                      |
    | f-addressInput-postcode | Enter postcode                                          |

Scenario: Validating the postcode format
    When I put an invalid postcode into the postcode field
    And I attempt to move on to the next page using the save and continue button with the invalid post code entered
    Then I should see a wrong format error pop up saying "Enter a full UK postcode"

Scenario: Submitting a valid address form and checking the summary formatting of the address
    When I fill out all of the fields in the address form
    And I move on to the next page of the address form with the save and continue button
    Then I want to confirm that the data from the address form is displayed correctly in the summary
    