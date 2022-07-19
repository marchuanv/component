const { createHttpConnection } = require('C:\\component\\lib\\factory\\httpconnection.factory.js');
describe('when asking the HttpConnection factory to create an instance', function() {
  it("it should succeed without any errors", function() {
    // Arrange
    const {timeout,userId,senderHost,senderPort,recipientHost,recipientPort,messageQueueTypeArray} = require('C:\\component\\spec\\factory\\httpconnection.factory.spec.variables.json');

    // Act
    const {httpConnection} = createHttpConnection({timeout,recipientHost,recipientPort,messageQueueTypeArray,userId,senderHost,senderPort});
    // Assert
    expect(httpConnection).not.toBeNull();
  });
});
