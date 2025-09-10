Feature: Conditional logic for the next page function

    Background:
        Given The user is on the form with the ID "conditional-logic-next-page-test" that has radio buttons with conditional logic


    Scenario: Conditional logic for second radio buttons happy path
        When I select a "<radio_field>" radio field 
        And I select the save and continue button at the very bottom of the page to submit the selected radio button
        Then I should be taken to the right "<page>" of the form

        Examples:
        | radio_field |    page   |
        |  f-radio-2  |secondPage |
        | f-radio-2-2 |thirdPage  |