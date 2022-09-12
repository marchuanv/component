const { createWebSocketResponseMessage } = require('C:\\component\\lib\\factory\\websocketresponsemessage.factory.js');
describe('when asking the WebSocketResponseMessage factory to create an instance', function() {
  it("it should succeed without any errors", function() {
    // Arrange
    const {scopeId,data,metadata,messageStatusCode,Id,senderHost,senderPort,recipientHost,recipientPort,token} = require('C:\\component\\spec\\factory\\websocketresponsemessage.factory.spec.variables.json');

    // Act
    const {webSocketResponseMessage} = createWebSocketResponseMessage({scopeId,messageStatusCode,Id,data,recipientHost,recipientPort,metadata,token,senderHost,senderPort});
    // Assert
    expect(webSocketResponseMessage).not.toBeNull();
  });
});