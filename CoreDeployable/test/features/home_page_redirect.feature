Feature: Redirecting to the home page
 
   Scenario: Happy path to redirecting the kainos home page
     Given I have a form service with an id "homepage-redirect-happy-automatic-test"
     When I open the specified page
     And I click on the home button
     Then Then I should be taken to the page defined in the "homePageUrl" field

    Scenario: Clicking the home button while on the demo when there is no homePageUrl defined in the KFD
     Given I have a form service which has an id "homepage-redirect-unhappy-automatic-test"
     When I open the above specified page
     And I click on the home button in the top left
     Then I should be taken to the "ApplicantDetails#" page