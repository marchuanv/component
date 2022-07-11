describe("when asking the message handler to send and receive request messages", function() {
  
  it("it should succeed without any errors", async function() {
    
    // Arrange
    const sender = { host: 'localhost', port: 2000 };
    const hostAddress = { host: 'localhost', port: 7000 };
    const userId = 'joe';
    const timeout = 5000;
    const { createMessageHandler } = require('../../lib/factory/messagehandler.factory');
    const { messageHandler } = createMessageHandler({ timeout, userId, hostAddress });

    messageHandler.receive({ callback: ({ message }) => {
      expect(message).not.toBeNull();
      const data = 'Hello From Server!';
      const metadata = {};
    
    }});

    // Act
    const message = await messageHandler.send({ metadata: { sender }, data: 'Hello World!' });

    // Assert
    expect(message).not.toBeNull();
  });
  
});
