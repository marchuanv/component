const { createMessageContentSecurity } = require('C:\\component\\lib\\factory\\messagecontentsecurity.factory.js');
describe('when asking the MessageContentSecurity factory to create an instance', function() {
  it("it should succeed without any errors", function() {
    // Arrange
    const {data,metadata} = require('C:\\component\\spec\\factory\\messagecontentsecurity.factory.spec.variables.json');

    // Act
    const {messageContentSecurity} = createMessageContentSecurity({data,metadata});
    // Assert
    expect(messageContentSecurity).not.toBeNull();
  });
});
