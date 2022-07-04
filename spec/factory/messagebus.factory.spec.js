const { createHttpMessageQueue } = require('C:\\component\\lib\\http\\httpmessagequeue.factory.js');
const { createWebSocketMessageQueue } = require('C:\\component\\lib\\websocket\\websockMessageQueue.factory.js');
const { createHttpConnection } = require('C:\\component\\lib\\http\\httpconnection.factory.js');
const { createWebSocketConnection } = require('C:\\component\\lib\\websocket\\websocketconnection.factory.js');
const { createHttpMessageHandler } = require('C:\\component\\lib\\http\\httpmessagehandler.factory.js');
const { createWebSocketMessageHandler } = require('C:\\component\\lib\\websocket\\websocketmessagehandler.factory.js');
const { createMessageHandler } = require('C:\\component\\lib\\messagehandler.factory.js');
const { createMessageBus } = require('C:\\component\\lib\\messagebus.factory.js');
describe('when asking MessageBus to create an instance', function() {
  it("it should succeed without any errors", function() {
    // Arrange
    const name = null;

const callback = null;

const httpMessageQueue = createHttpMessageQueue({name,callback});
const hostAddress = null;

const timeout = null;

const websocketMessageQueue = createWebSocketMessageQueue({});
const httpConnection = createHttpConnection({httpMessageQueue,hostAddress,timeout});
const websocketConnection = createWebSocketConnection({websocketMessageQueue,hostAddress,timeout});
const httpMessageHandler = createHttpMessageHandler({httpConnection,httpMessageQueue});
const webSocketMessageHandler = createWebSocketMessageHandler({websocketConnection,websocketMessageQueue});
const messageHandler = createMessageHandler({httpMessageHandler,webSocketMessageHandler});
    // Act
    const instance = createMessageBus({ messageHandler });
    // Assert
    expect(instance).not.toBeNull();
  });
});
