const { createHttpClientMessageQueue } = require('C:\\component\\lib\\factory\\httpclientmessagequeue.factory.js');
describe('when asking the HttpClientMessageQueue factory to create an instance', function() {
  it("it should succeed without any errors", function() {
    // Arrange
    const {recipientHost,recipientPort,userId,senderHost,senderPort,messageQueueTypeCode,messageQueueArray} = require('C:\\component\\spec\\factory\\httpclientmessagequeue.factory.spec.variables.json');

    // Act
    const {httpClientMessageQueue} = createHttpClientMessageQueue({recipientHost,recipientPort,messageQueueTypeCode,messageQueueArray,userId,senderHost,senderPort});
    // Assert
    expect(httpClientMessageQueue).not.toBeNull();
  });
});
