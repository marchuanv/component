const { createHttpMessageQueue } = require('C:\\component\\lib\\http\\httpmessagequeue.factory.js');
describe('when asking HttpMessageQueue to create an instance', function() {
  it("it should succeed without any errors", function() {
    // Arrange
    const name = 'undefined';

const callback = 'undefined';

    // Act
    const instance = createHttpMessageQueue({ name,callback });
    // Assert
    expect(instance).not.toBeNull();
  });
});
