const { createClientMessageBus } = require('C:\\component\\lib\\factory\\clientmessagebus.factory.js');
describe('when asking the ClientMessageBus factory to create an instance', function() {
  it("it should succeed without any errors", function() {
    // Arrange
    const {scopeId,timeout} = require('C:\\component\\spec\\factory\\clientmessagebus.factory.spec.variables.json');

    // Act
    const {clientMessageBus} = createClientMessageBus({scopeId,timeout});
    // Assert
    expect(clientMessageBus).not.toBeNull();
  });
});
