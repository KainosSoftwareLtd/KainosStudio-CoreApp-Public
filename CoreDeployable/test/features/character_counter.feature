Feature: Character counter with a lenght limit set

Background:
    Given I am currently on the "character-counter-test-max-length-set" form with a text box

Scenario: The user should have a character limit of 500 wtih an empty text box
    When The text box on the page is empty
    And There should be a message on the bottom of the text box stating "You have 500 characters remaining"
    And I add the text "test" to the text box on the page  
    Then The message at the bottom of the screen should adjust to "You have 496 characters remaining"

Scenario: The user inputs too many characters into the text box
    When I type in four too many characters into the text box that has a character limit of 500
    Then I get an error message back "You have 4 characters too many" on the bottom of the text box
