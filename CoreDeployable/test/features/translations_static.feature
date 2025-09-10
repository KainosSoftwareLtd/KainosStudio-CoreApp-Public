Feature: Static translations 

Scenario: Translations to welsh are correct for static text on the page
Given I am on the translation form service with the id of "translations-static-test"
When I am on the english version of the service
And I translate the service into welsh using a button
Then The "<static_element>" should be translated into the "<welsh_translations>"

Examples: 
 | static_element| welsh_translations |
 | label[for='f-addressInput-2-line1'] |  Llinell cyfeiriad 1 |
 | label[for='f-addressInput-2-line2'] |  Llinell cyfeiriad 2 (dewisol)  |
 | label[for='f-addressInput-2-town'] |  Tref neu ddinas | 
 | label[for='f-addressInput-2-county'] |  Sir (dewisol) |
 | label[for='f-addressInput-2-postcode'] |  Cod post |
 | label[for='f-dateInput-2-day'] |  Dydd | 
 | label[for='f-dateInput-2-month'] | Mis |
 | label[for='f-dateInput-2-year'] | Blwyddyn |
 | .govuk-footer__inline-list-item | Cwcis | 
 | .govuk-cookie-banner__heading.govuk-heading-m |  Cwcis ar Fy enghraifft cyfieithu |
 | .govuk-body | Rydym yn defnyddio rhai cwcis hanfodol i wneud i’r gwasanaeth hwn weithio.|
 | #hideCookieMessageButton | Cuddio neges cwcis |
 | div[class='govuk-button-group'] a[class='govuk-link'] | Gweld cwcis |
 | .govuk-footer__licence-description | Mae'r holl gynnwys ar gael o dan y Trwydded Llywodraeth Agored v3.0, ac eithrio lle nodir yn wahanol |
 | .govuk-footer__link.govuk-footer__copyright-logo | © Hawlfraint y Goron |
        

Scenario: Translations to welsh are correct for static error messages
When I trigger errors on the translation page by not filling the "<field>" mandatory field
And I try to continue to the next page of the translation service by pressing the continue button
Then I should have the translated welsh "<error_messages>" appear at the top of the page

Examples: 
| field | error_messages |
| f-addressInput-2-line1 | Rhowch linell cyfeiriad 1, fel arfer yr adeilad a’r stryd |
| f-addressInput-2-town | Rhowch dref neu ddinas |
| f-addressInput-2-postcode | Rhowch god post |
| f-phoneNumberInput | Rhowch rif ffôn | 
| f-addressInput-3 | Rhowch god post | 
| f-emailInput-3 | Rhowch gyfeiriad e-bost | 

Scenario: Translated error messages for the date element
When All the mandatory elements on the translation page are filled in 
And I modify the "<Day>", "<Month>" and "<Year>" fields to try to trigger errors
And I try to continue to the next page of the translation service
Then I should see the translated "<date_errors>" show up at the top of the page in the error summary


Examples:
      | Day  | Month | Year  | date_errors |
      |    |   |   | Rhowch Dyddiad digwyddiad |
      | 01   | 01    | 1899  | Dyddiad digwyddiad rhaid iddo gynnwys blwyddyn go iawn  |
      | 40   | 01    | 2026  | Dyddiad digwyddiad rhaid iddo gynnwys dydd go iawn  |
      | 01   | 20    | 2226  | Dyddiad digwyddiad rhaid iddo gynnwys mis a blwyddyn go iawn |
      | 40   | 20    | 2000  | Dyddiad digwyddiad rhaid iddo gynnwys dydd a mis go iawn  |
      | 40   | 12    | 200 | Dyddiad digwyddiad rhaid iddo gynnwys dydd a blwyddyn go iawn |
      | 40   | 20    | 20000 | Dyddiad digwyddiad rhaid iddo fod yn ddyddiad go iawn |

Scenario: Translations to welsh are correct for the cookie table
Given I am on the welsh cookie page of the translated service "translations-static-test"
Then The "<cookies_table>" elements should be translated into the "<welsh_translation>"

Examples: 
 | cookies_table | welsh_translation |
 | th:nth-child(1) | Enw |
 | th:nth-child(2) | Pwrpas |
 | th:nth-child(3) | Yn dod i ben | 
 | td:nth-child(2) | Yn storio data sesiwn ar gyfer y gwasanaeth |
 | td:nth-child(3) | 5 awr |


