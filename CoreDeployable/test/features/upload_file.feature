Feature: Upload a file
   Scenario: Happy path to save and exit using the appropriate button
     Given I have a form service with the id "upload-file-automatic-test"
     When I open the page
     And I upload an jpeg file "sample.pdf"
     And I press the submit button to go to the second page
     Then I should see a save confirmation