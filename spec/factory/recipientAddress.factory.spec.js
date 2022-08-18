const { createRecipientAddress } = require('C:\\component\\lib\\factory\\recipientaddress.factory.js');
describe('when asking the RecipientAddress factory to create an instance', function() {
  it("it should succeed without any errors", function() {
    // Arrange
    const {scopeId,recipientHost,recipientPort} = require('C:\\component\\spec\\factory\\recipientaddress.factory.spec.variables.json');

    // Act
    const {recipientAddress} = createRecipientAddress({scopeId,recipientHost,recipientPort});
    // Assert
    expect(recipientAddress).not.toBeNull();
  });
});
