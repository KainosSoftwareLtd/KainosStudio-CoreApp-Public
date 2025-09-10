Feature: Page not found

  Scenario: Service with a custom page not found component shows custom message
    Given I am on the service "page-not-found-test" which has a custom page not found message set
    Then I should see a custom page not found message which says "My custom not found page for testing purposes"

  Scenario: Service without a custom page not found component shows default message
    Given I am on the "demo" service which has no custom page not found message set
    When I try to go on the page "44444" which does not exist in the kfd
    Then I should see the default page not found message "Page not found"

  Scenario: Service with a custom page not found component shows custom message when the URL has extra sections
    Given I am on the service "page-not-found-test" which has a custom page not found message set with extra sections in the URL
    Then I should see my custom page not found which says "My custom not found page for testing purposes"

  Scenario: Service without a custom page not found component shows default message when the URL has extra sections
    Given I am on the "demo" service which is without a custom page not found message
    When I try to go on the page "44444/extra/extra" which does not exist in the kfd and has extra sections in the URL
    Then I should see the default not-found page with the message "Page not found"
