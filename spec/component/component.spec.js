fdescribe("when initialising a component given a client and server messagebus", function() {

  let token = null;

  beforeAll(() => {
    
  });

 it("it should provide the capability for sending and receiving messages.", function(done) {
  
  // Arrange
  const { createComponent } = require('../../lib/factory/component.factory.js');

  // Act
  {
    // Server Component
    const { component } = createComponent({ packageJson: {
      userId: 'componenttest',
      senderHost: 'localhost', senderPort: 3000,
      recipientHost: 'localhost', recipientPort: 2000,
      isServerComponent: true
    }});
    component.initialise({ secret: 'secret1234' }).then(() => {
      component.receive({ callback: ({ message }) => {
        component.send({ object: { text: 'Hello From Server' } });
      }});
    });
  }
  {
    // Client Component
    const { component } = createComponent({ packageJson: {
      userId: 'componenttest',
      senderHost: 'localhost', senderPort: 3000,
      recipientHost: 'localhost', recipientPort: 2000,
      isServerComponent: false
    }});
    component.initialise({ secret: 'secret1234' }).then(() => {
      component.send({ object: { text: 'Hello From Client' } });
      component.receive({ callback: ({ message }) => {
        setTimeout(done,1500);
      }});
    });
  }
  // Assert
 });
});