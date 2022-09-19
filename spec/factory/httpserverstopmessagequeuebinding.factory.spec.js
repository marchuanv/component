const { createHttpServerStopMessageQueueBinding } = require('C:\\component\\lib\\factory\\httpserverstopmessagequeuebinding.factory.js');
describe('when asking the HttpServerStopMessageQueueBinding factory to create an instance of HttpServerStopMessageQueueBinding', () => {
  it("it should succeed without any errors", () => {

    // Arrange
    const testInputArgs =
      {
    "scopeId": null,
    "factoryContainerBindingName": null
};

    // Act
    const {httpServerStopMessageQueueBinding} = createHttpServerStopMessageQueueBinding(testInputArgs);

    // Assert
    expect(httpServerStopMessageQueueBinding).not.toBeNull();

  });
});
