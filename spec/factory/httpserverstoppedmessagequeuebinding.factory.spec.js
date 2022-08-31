const { createHttpServerStoppedMessageQueueBinding } = require('C:\\component\\lib\\factory\\httpserverstoppedmessagequeuebinding.factory.js');
describe('when asking the HttpServerStoppedMessageQueueBinding factory to create an instance', function() {
  it("it should succeed without any errors", function() {
    // Arrange
    const {scopeId} = require('C:\\component\\spec\\factory\\httpserverstoppedmessagequeuebinding.factory.spec.variables.json');

    // Act
    const {httpServerStoppedMessageQueueBinding} = createHttpServerStoppedMessageQueueBinding({scopeId});
    // Assert
    expect(httpServerStoppedMessageQueueBinding).not.toBeNull();
  });
});