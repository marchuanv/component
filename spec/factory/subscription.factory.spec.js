const { createSubscription } = require('C:\\component\\lib\\factory\\subscription.factory.js');
describe('when asking the Subscription factory to create an instance', function() {
  it("it should succeed without any errors", function() {
    // Arrange
    const {subscriptionName} = require('C:\\component\\spec\\factory\\subscription.factory.spec.variables.json');

    // Act
    const {subscription} = createSubscription({subscriptionName});
    // Assert
    expect(subscription).not.toBeNull();
  });
});
