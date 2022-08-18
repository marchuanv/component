const { createUserSecurity } = require('C:\\component\\lib\\factory\\usersecurity.factory.js');
describe('when asking the UserSecurity factory to create an instance', function() {
  it("it should succeed without any errors", function() {
    // Arrange
    const {userId} = require('C:\\component\\spec\\factory\\usersecurity.factory.spec.variables.json');

    // Act
    const {userSecurity} = createUserSecurity({userId});
    // Assert
    expect(userSecurity).not.toBeNull();
  });
});
