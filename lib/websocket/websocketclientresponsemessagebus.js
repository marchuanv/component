const utils = require("utils");
function WebSocketClientResponseMessageBus({ websocketClientResponseMessageQueueBinding }) {
    const { createWebSocketResponseMessage } = require('../factory/websocketresponsemessage.factory');
    Object.defineProperty(this, 'subscribe', { configurable: false, writable: false, value: ({ callback }) => {
        websocketClientResponseMessageQueueBinding.dequeueMessage().then( async ({ message }) => {
            const httpResponse = message;
            const { body, statusCode, headers } = httpResponse;
            const messageStatusCode = statusCode;
            const { recipienthost, recipientport, senderhost, senderport, token } = headers;
            await callback(createWebSocketResponseMessage({
                scopeId: utils.generateGUID(),
                messageStatusCode, Id: null, data: body,
                recipientHost: recipienthost,
                recipientPort: recipientport,
                metadata: headers, token,
                senderHost: senderhost,
                senderPort: senderport
            }));
            this.subscribe({ callback });
        });
    }});
};
WebSocketClientResponseMessageBus.prototype.subscribe = function ({ callback }) { };
module.exports = { WebSocketClientResponseMessageBus };