function ServerMessageBus({ serverResponseMessageBus, serverRequestMessageBus, messageConverter }) {
    this.constructor({ serverResponseMessageBus, serverRequestMessageBus, messageConverter });
};
ServerMessageBus.prototype.publish = async function({ message }) { };
ServerMessageBus.prototype.subscribe = function ({ callback }) { };
module.exports = { ServerMessageBus };
