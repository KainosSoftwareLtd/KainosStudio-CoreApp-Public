Feature: Login when form require authentication
 
   Scenario: Redirect to Identity Provider and go back with access token
     Given I have a form service requires auth with id "login-automatic-test"
     When I open the form page I am redirected to the login page
     And I fill out the credentials
     And I log in
     Then I should be redirected to service page