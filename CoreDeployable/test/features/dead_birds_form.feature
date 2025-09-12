@torun
Feature: Dead birds form automated testing
   Scenario: User selects the start now button to start the form
   Given The user is on the form service with the id of "report-demo-test"
    When I choose to click the start now button to begin the dead birds form
    Then I should be redirected to "firstPage" of this form

   Scenario: User doesn't select a radio field and tries to continue to the next page
     And I click the button to continue without filling out the radio fields
     Then I should see an error returned "Choose one: must be provided"

   Scenario: User selects a radio field and continues on with the form
     When I select a radio field 
     And I click the button to continue
     Then I should be taken to the second page of the "report-demo-test" with the page id "secondPage"

   Scenario: User doesn't select radio fields on the second page
    When I confirm I am on the "secondPage" of the form service "report-demo-test"
    And I do not fill out the radio fields on the specified page and click the continue button
    Then I should see an error at the top of the page "There is a problem"

   Scenario: The user should have a character limit of 500 in the describe the location radio field drop down
    When The text box on the describe the location radio field is empty
    And There should be a counter on the bottom of the text box stating "You have 500 characters remaining"
    And I input the value "test" to the text area field
    Then The counter at the bottom of the text area field should change to "You have 496 characters remaining"

   Scenario: The user inputs too many characters into the describe the location radio field drop down
    When I type in four characters over character limit of 500 into the text area field
    Then I recieve an error message back "You have 4 characters too many" under the area field

   Scenario: The user should have a character limit of 500 in the additional info text area field
    When the additional info area field is clear
    And a "You have 500 characters remaining" counter is on the bottom of the area field
    And I insert the value "test" into this field
    Then the counter message will change to "You have 496 characters remaining" now

   Scenario: The user inputs too many characters into the additional info text area field
    When I give a value that is 4 characters over the limit of 500
    Then "You have 4 characters too many" error will be returned

   Scenario: User selects appropriate radio fields and continues on to the next page
    When I select all the radio fields on the page
    And I press the continue button at the bottom of the page
    Then I should be taken to the next page "thirdPage" on the "report-demo-test" form

   Scenario: User inputs invalid data into all of the text fields referring to the no. of certain types of birds
    When I type in the <wrong format> into a text field
    And I press the continue button on the bottom of the page
    Then I should see an error stating "There is a problem"
 
    Examples:
    | wrong format|
    | "text"      |
    | "£!@£"      |
 
   Scenario: User inputs valid data into all of the text fields referring to the no. of certain types of birds
    When I type in the <correct format> into each of the text fields
    And I press the continue button
    Then I should be taken to the "fourthPage" page of the "report-demo-test" form

    Examples:
    | correct format |
    | 3            |

   Scenario: User provides an invalid email format
    When I give an invalid email "<invalid_email>" in the email field
    And I choose the continue button after I enter that
    Then error, "Email address (optional) must be an email address in the correct format, like name@example.com" is displayed

    Examples:
     | invalid_email  |
     | abcdefghijk    |

   Scenario: User submits the form without entering a name
    When I leave the name field blank in the form
    And I select the continue button to submit the form
    Then the error "Your name must be provided" appears

   Scenario: User provides an invalid phone number format
    When I enter an invalid phone number "<invalid_phone_number>" in the phone number field
    And I pick the continue button
    Then this error, "Telephone number must be a telephone number, like 01632 960 001, 07700 900 982 or +44 808 157 0192" comes up

    Examples:
     | invalid_phone_number  |
     | abcdefghijk           |
   
   Scenario: User provides valid data into both the telephone, name and email text fields
    When I insert valid data into the relevant fields
    And I select the continue at the end of the form
    Then I should be directed to the "fifthPage" of our form

   Scenario: User wants to change the country of their dead bird find before submission
    When I am currently on the "fifthPage" of the "report-demo-test" form
    And I click the link to change my answer
    Then I should be taken to the "firstPage" where i can change my answer

   Scenario: User wants to change the place where the bird was found before submission
    When I am located on the "fifthPage" of the "report-demo-test" form where i can see the summary
    And I click on the link to change where the dead bird is located
    Then I should be taken to the "secondPage" where i can change the location of the dead bird

   Scenario: User wants to change the amount of dead birds found
    When I am located on the "fifthPage" on the "report-demo-test" form where the summary of my answers can be seen 
    And I click on a link to change one of my answers
    Then I should be taken to the "thirdPage" where i can change how many dead birds I found

   Scenario: User submits the whole form
    When I am on the "fifthPage" on the "report-demo-test" form and I am happy with all my answers
    And I press the button to submit all my answers on the bottom of the page
    Then I should see "Submission complete" and see that my form has been submitted 

   Scenario: User hits the back button on each page
    When I am currently on the "fourthPage" of the system but I want to go back
    And I click the back button on the fourth, third and second pages
    Then I should be brought to the "firstPage"
