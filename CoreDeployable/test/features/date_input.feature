Feature: Date input error handling

  Background:
    Given the user navigates to the form service with an id "date-input-automatic-test"

  Scenario: I put in an unaccepted format into the date fields
    When I enter "<day>" into day, "<month>" into month and "<year>" into year field
    And I continue by using the save and continue at the bottom of the page to submit my date
    Then I should see an error saying "<error>" popping up at the top of the page

    Examples:
      | day  | month | year  | error |
      | 19   | 022   | 2225  | Event date must include a real month |
      | 01   | 01    | 1899  | Event date must include a real year  |
      | 40   | 01    | 2026  | Event date must include a real day   |
      | 01   | 20    | 2226  | Event date must include a real month and year |
      | 40   | 20    | 2000  | Event date must include a real day and month  |
      | 40   | 12    | 200 | Event date must include a real day and year |
      | 40   | 20    | 20000 | Event date must be a real date |

  Scenario: I leave the date field blank when isMandatory is true
    When I leave the day, month, and year fields blank
    And I continue using the button at the bottom of the page to submit the blank fields
    Then I should get an error saying "Cannot be left empty" appear at the top of the page with the date field 
    
  Scenario: I leave the date field blank when isMandatory is false
    When I navigate in the "date-input-automatic-test" to the "secondPage" of the form
    And I use the button at the bottom of the page to submit without entering any values
    Then I should be brought to the "thirdPage" of the form 

  Scenario: I type in the correct format into the date fields
    When I fill out the day with "<day>" and month with "<month>" and year with "<year>"
    And I press the save and continue button at the bottom of the page to continue on with my choice of date
    Then I should be redirected to the "secondPage" of the form with the date successfully submitted

    Examples:
      | day  | month | year  |
      | 19   | 02    | 2004  |
      | 01   | 01    | 2000  |
