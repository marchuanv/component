const utils = require("utils");
const { createHttpResponseMessage } = require('../../factory/generated/httpresponsemessage/httpresponsemessage.factory');
const { HttpClientResponseMessageBus } = require("./httpclientresponsemessagebus.prototype");
HttpClientResponseMessageBus.prototype.constructor = function({ httpClientResponseMessageQueueBinding, contextName }) {
    Object.defineProperty(this, 'subscribe', { configurable: false, writable: false, value: ({ callback }) => {
        httpClientResponseMessageQueueBinding.dequeueMessage().then( async ({ message }) => {
            const httpResponse = message;
            const { body, statusCode, headers } = httpResponse;
            const messageStatusCode = statusCode;
            const { recipienthost, recipientport, senderhost, senderport, token } = headers;
            await callback(createHttpResponseMessage({
                contextName,
                messageStatusCode, Id: null, data: body,
                recipientHost: recipienthost, recipientPort: recipientport, 
                metadata: headers, token,
                senderHost: senderhost, senderPort: senderport,
            }));
            this.subscribe({ callback });
        });
    }});
};
module.exports = { HttpClientResponseMessageBus };
