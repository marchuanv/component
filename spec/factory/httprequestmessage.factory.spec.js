const { createHttpRequestMessage } = require('C:\\component\\lib\\factory\\httprequestmessage.factory.js');
describe('when asking the HttpRequestMessage factory to create an instance', function() {
  it("it should succeed without any errors", function() {
    // Arrange
    const {data,senderHost,senderPort,metadata,recipientHost,recipientPort,messageStatusCode,Id,userId} = require('C:\\component\\spec\\factory\\httprequestmessage.factory.spec.variables.json');

    // Act
    const {httpRequestMessage} = createHttpRequestMessage({messageStatusCode,Id,data,recipientHost,recipientPort,metadata,userId,senderHost,senderPort});
    // Assert
    expect(httpRequestMessage).not.toBeNull();
  });
});
