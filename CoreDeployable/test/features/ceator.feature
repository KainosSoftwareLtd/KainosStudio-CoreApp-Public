Feature: Form Submission with Creator
 
   Scenario: Happy path form submission
     Given I have a form service with id "demo-automatic-test"
     When I open the form page
     And I fill out the form
     And I submit the form
     Then I should see a submission confirmation