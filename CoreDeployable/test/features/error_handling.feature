Feature: Error handling
    
   Background:
    Given User navigates to the form service with an id "error-handling-automatic-test"

   Scenario: Enter a randomly mixed-case KFD form ID in the URL
    When I enter the form URL with the ID "<mixed_case_id>" in randomly mixed case
    Then the correct page content should be displayed

     Examples:
      | mixed_case_id                          |
      | error-HANDLING-automatic-TEST          |
      | ERROR-handling-automatic-TESt          |
      | Error-handLING-AutoMATIC-TESt          |

   Scenario: I type in an unaccepted format into the text field
     When I fill out the name field with an unaccepted character "<unaccepted_character>"
     And I press the error button
     Then I should get an error that "Only text allowed"

     Examples:
      | unaccepted_character |
      |      1234567890      |
      |        !@?           |


    Scenario: I type in the wrong format into the phone number field
     When I fill out the phone number field with an unaccepted character "<unaccepted_character>"
     And I press the error button on the page
     Then I should get an error "Only numbers allowed"

    
    Examples:
      | unaccepted_character  |
      |      abcdefghik       |
      |         !@?           |

    Scenario: I type nothing into the fields
     When I leave the name and phone number field blank
     And I press the error button on the bottom of the page
     Then I should get a "Validation error"