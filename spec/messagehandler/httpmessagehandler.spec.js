const { HttpRequestMessage } = require("../../lib/http/httprequestmessage");
const { MessageStatus } = require("../../lib/messagestatus");
const { HttpMessageHandlerFactory } = require("../../lib/http/httpmessagehandlerfactory");
const { HttpMessageFactory } = require('../../lib/http/httpmessagefactory');
const { MessageFactory } = require("../../lib/messagefactory");

describe("when asking the http message handler to send and receive an http request messages", function() {
  it("it should succeed without any errors", async function() {
    
    // Arrange
    const hostAddress = { address: 'localhost', port: 3000 };
    const recipientAddress = { address: 'localhost', port: 3000 };
    const httpMessageHandlerFactory = new HttpMessageHandlerFactory({ hostAddress, timeout: 5000 });
    const httpMessageHandler = httpMessageHandlerFactory.createunsecure();
    const messageFactory = new MessageFactory();
    const httpMessageFactory = new HttpMessageFactory({ messageFactory });

    httpMessageHandler.receive({ callback: ({ httpRequestMessage }) => {
      if (!(httpRequestMessage instanceof HttpRequestMessage)) {
        throw new Error("the 'httpRequestMessage' parameter is null, undefined or not of type: HttpRequestMessage");
      }
      return httpMessageFactory.createHttpResponseMessage({ 
        recipientAddress,
        data: 'Hello From Server!',
        headers: {},
        messageStatus: new MessageStatus({ code: 0 })
      });
    }});

    // Act
    const responseMessage = await httpMessageHandler.send({ recipientAddress, data: 'Hello World!' });

    // Assert
    expect(responseMessage).not.toBeNull();
    expect(responseMessage.getContent()).toEqual('Hello From Server!')
  });
});
