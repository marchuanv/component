const { createUserIdentity } = require('C:\\component\\lib\\useridentity.factory.js');
const { createEncryption } = require('C:\\component\\lib\\encryption.factory.js');
const { createContent } = require('C:\\component\\lib\\content.factory.js');
const { createMessageStatus } = require('C:\\component\\lib\\messagestatus.factory.js');
const { createMessage } = require('C:\\component\\lib\\message.factory.js');
const { createHttpResponseMessage } = require('C:\\component\\lib\\http\\httpresponsemessage.factory.js');
describe('when asking HttpResponseMessage to create an instance', function() {
  it("it should succeed without any errors", function() {
    // Arrange
    const userId = null;

const userIdentity = createUserIdentity({userId});
const data = null;

const metadata = null;

const encryption = createEncryption({userIdentity});
const code = null;

const content = createContent({data,metadata,encryption});
const messageStatus = createMessageStatus({code});
const message = createMessage({content,messageStatus});
    // Act
    const instance = createHttpResponseMessage({ message });
    // Assert
    expect(instance).not.toBeNull();
  });
});
