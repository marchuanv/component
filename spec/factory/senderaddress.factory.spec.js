const { createSenderAddress } = require('C:\\component\\lib\\factory\\senderaddress.factory.js');
describe('when asking the SenderAddress factory to create an instance of SenderAddress', () => {
  it("it should succeed without any errors", () => {

    // Arrange
    const testInputArgs =
      {
    "factoryContainerBindingName": null,
    "senderHost": null,
    "senderPort": null
};

    // Act
    const {senderAddress} = createSenderAddress(testInputArgs);

    // Assert
    expect(senderAddress).not.toBeNull();

  });
});
