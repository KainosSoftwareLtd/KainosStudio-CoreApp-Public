Feature: Multiple Buttons
 
   Scenario: Happy path to save and exit using the appropriate button
     Given I have a form service with the id "multi-buttons-automatic-test"
     When I open the page
     And I fill out the form with all the details on the page
     And I press the save and exit button
     Then I should see a save confirmation

   Scenario: Happy path to save and continue using the appropriate button
     Given I have a form service open with the id of "multi-buttons-automatic-test"
     When I open that page
     And I press the save and continue button
     Then I should be taken to "secondPage"

   Scenario: Happy path to save and exit while on the second page
     Given I am on the the "multi-buttons-automatic-test" "secondPage"
     When I fill out the fields
     And I press the save and exit button on the second page
     Then I should be able to see a save confirmation