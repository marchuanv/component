const utils = require("utils");
const { WebSocketClientResponseMessageBus } = require("./websocketclientresponsemessagebus.prototype");
const { createWebSocketResponseMessage } = require('../factory/generated/websocketresponsemessage/websocketresponsemessage.factory');
WebSocketClientResponseMessageBus.prototype.constructor = function({ websocketClientResponseMessageQueueBinding, contextName}) {
    Object.defineProperty(this, 'subscribe', { configurable: false, writable: false, value: ({ callback }) => {
        websocketClientResponseMessageQueueBinding.dequeueMessage().then( async ({ message }) => {
            const httpResponse = message;
            const { body, statusCode, headers } = httpResponse;
            const messageStatusCode = statusCode;
            const { recipienthost, recipientport, senderhost, senderport, token } = headers;
            await callback(createWebSocketResponseMessage({
                contextName,
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
module.exports = { WebSocketClientResponseMessageBus };
