
const { createComponent } = require('C:\component\lib\component.factory.js');
describe('when asking Component to create an instance', function() {
  it("it should succeed without any errors", function() {
    // Arrange
    // Act
    const instance = new ComponentFactory({ packageJson });
    // Assert
    expect(instance).not.toBeNull();
  });
});
