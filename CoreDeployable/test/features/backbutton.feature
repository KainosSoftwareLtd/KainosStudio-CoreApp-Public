Feature: Back button

Scenario: User naviagates to the second page of the website and back 
    Given I am on the "firstPage" of the "backbutton-test" form where a submit button is present
    When I press the submit button to go to the second page
    And I confirm that i am on the next page of the form "secondPage"
    And I press the back button to go back to the previous page
    Then I am on the correct "firstPage" page of the form
