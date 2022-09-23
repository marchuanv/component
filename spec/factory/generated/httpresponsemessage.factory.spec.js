const { createHttpResponseMessage } = require('C:\\component\\lib\\factory\\generated\\httpresponsemessage\\httpresponsemessage.factory.js');
describe('when asking the HttpResponseMessage factory to create an instance of HttpResponseMessage', () => {
  it("it should succeed without any errors", () => {

    // Arrange
    const testInputArgs =
      {
    "messageStatusCode": null,
    "factoryContainerBindingName": "factoryspec",
    "Id": null,
    "data": null,
    "recipientHost": null,
    "recipientPort": null,
    "metadata": null,
    "token": null,
    "senderHost": null,
    "senderPort": null
};

    // Act
    const {httpResponseMessage} = createHttpResponseMessage(testInputArgs);

    // Assert
    expect(httpResponseMessage).not.toBeNull();

  });
});