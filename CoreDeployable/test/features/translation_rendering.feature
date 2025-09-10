Feature: Translation rendering

Scenario: There are no translations for an element on the page
    Given The user has navigated to the translation form service with an id "translation-test"
    When The user is on the english version of the form service
    And I press the button to translate my service into Welsh
    Then The "<element>" "<original_translation>" should show up in english while the other elements show up in welsh 

    Examples:
     |element | original_translation|
     | f-dateInput-2-hint |  For example, 27 3 2007  |

Scenario: Translations are present for components on page and are correct
    Then The "<elements>" on the page should be properly translated into their "<welsh_translations>"

    Examples:

     | elements | welsh_translations |
     | .govuk-back-link | Yn ôl |
     | .govuk-header__link.govuk-header__service-name | Fy enghraifft cyfieithu |
     | label[for='text-field-1'] | Beth yw enw'r digwyddiad? | 
     | #text-field-1-hint | Yr enw y byddwch yn ei ddefnyddio ar ddeunydd hyrwyddo |
     | .govuk-fieldset__legend | Dewiswch un: |
     | #f_radio_1-hint | Os nad ydych yn siŵr, rhowch eich dyfalu gorau. | 
     | label[for='f_radio_1'] | Lloegr |
     | label[for='f_radio_1-2'] | Yr Alban |
     | label[for='f_radio_1-3'] | Cymru | 
     | .govuk-fieldset__heading | Dyddiad digwyddiad |
     | button[name='action'] | Parhau |