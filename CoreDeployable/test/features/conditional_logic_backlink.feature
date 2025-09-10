Feature: Conditional logic for the back link

    Scenario: With Conditional logic on the page, back link brings you back to the right page
        Given I am on the "back-link-conditional-test" service which has radio fields with conditional logic 
        When I select a "<radio_field>" with conditional logic that is linked to a page
        And I select the save and continue button at the bottom of the page to submit my radio field selection
        And I am on the next page and click the back link
        Then I should be taken back to the "radioField" page which is the first page of the service

    Examples:
    | radio_field |
    |  f-radio-2  |
    | f-radio-2-2 |
    | f-radio-2-3 |
    | f-radio-2-4 |