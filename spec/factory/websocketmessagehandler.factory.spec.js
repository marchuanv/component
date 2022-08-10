const { createWebSocketMessageHandler } = require('D:\\component\\lib\\factory\\websocketmessagehandler.factory.js');
describe('when asking the WebSocketMessageHandler factory to create an instance', function() {
  it("it should succeed without any errors", function() {
    // Arrange
    const {timeout,host,port} = require('D:\\component\\spec\\factory\\websocketmessagehandler.factory.spec.variables.json');

    // Act
    const {webSocketMessageHandler} = createWebSocketMessageHandler({});
    // Assert
    expect(webSocketMessageHandler).not.toBeNull();
  });
});
