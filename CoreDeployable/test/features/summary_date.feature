Feature: Date in the summary table has proper written format

Scenario: The date that I submit shows up in the proper format
    Given I am on the "summary-date-test" form which has a date component
    When I fill out the day field with "<day>" the month field with "<month>" and the year field with "<year>"
    And I click the save and continue button which is at the very bottom of the form with the date component
    Then I should see the date presented to me in the right format <formatted_date_result>

    Examples:
    | day | month | year  | formatted_date_result   |
    | 19  | 12   | 2004   | "19 December 2004"      |
    | 3   | 05   | 2020   | "3 May 2020"            |
    | 29  | 2    | 2024   | "29 February 2024"      |