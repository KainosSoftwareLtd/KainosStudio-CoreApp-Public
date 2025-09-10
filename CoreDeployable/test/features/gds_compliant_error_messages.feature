Feature: GDS Compliant error messages

Background: 
    Given I am located on the "gds-compliant-error-messages-test" form which has error messages complaint with GDS standards
    When I clear all of the fields on the page to have an empty canvas

Scenario: Text fields return the correct GDS compliant error
    When I leave the specific text field "<text_field>" empty
    And I press the save and continue button at the bottom of my page to submit the empty text field
    Then I should see an error at the top of the page that meets the GDS compiance "<error_message>"

    Examples:
    |    text_field     |               error_message                   |
    |name-of-event-field| What is the name of the event? cannot be blank|
    |more-details-field | Can you provide more detail? cannot be blank  |

Scenario: Radio field returns the correct GDS compliant error
    When I leave the radio field empty on the page
    And I press the save and continue button to submit my empty radio field and trigger the error
    Then I should have an error appear at the top of the page related to the radio field that says "Where do you live? cannot be blank"


Scenario: Select field returns the correct GDS compliant error
    When I leave the select field unselected on the page
    And I press the save and continue button to submit the empty select field
    Then I should have an error appear at the top of the page related to the select that says "Dropdown cannot be blank"

Scenario: Date field returns correct GDS compliant error
    When I leave all of the fields in the date field empty on the page
    And I press the save and continue button to submit all three empty date fields
    Then I should get an error to appear at the top of the page which relates to the date field and says "Enter Event Date"