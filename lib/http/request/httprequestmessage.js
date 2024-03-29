const utils = require("utils");
const { HttpRequestMessage } = require("./httprequestmessage.prototype");
HttpRequestMessage.prototype.constructor = function({ message }) {
    const { senderAddress } = message.getSenderAddress();
    const { senderHost, senderPort } = senderAddress;
    const { recipientAddress } = message.getRecipientAddress();
    const { recipientHost, recipientPort } = recipientAddress;
    const { path, secret, token } = message.getMessageMetadata();
    const { contentType, contentLength } = message.getContentMetadata();
    const headers = { 
        'Content-Type': contentType.description,
        'Content-Length': contentLength,
        secret, token,
        senderhost: senderHost, senderport: senderPort,
        recipienthost: recipientHost, recipientport: recipientPort
    };
    Object.defineProperty(this, 'getId', { configurable: false, writable: false, value: message.getId });
    Object.defineProperty(this, 'getEncryptedContent', { configurable: false, writable: false, value: message.getEncryptedContent });
    Object.defineProperty(this, 'getDecryptedContent', { configurable: false, writable: false, value: message.getDecryptedContent });
    Object.defineProperty(this, 'getSenderAddress', { configurable: false, writable: false, value:message.getSenderAddress });
    Object.defineProperty(this, 'getRecipientAddress', { configurable: false, writable: false, value:  message.getRecipientAddress });
    Object.defineProperty(this, 'getContentMetadata', { configurable: false, writable: false, value:  message.getContentMetadata });
    Object.defineProperty(this, 'getMessageMetadata', { configurable: false, writable: false, value:  message.getMessageMetadata });
    Object.defineProperty(this, 'getHeaders', { configurable: false, writable: false, value: () => {
        return utils.getJSONObject(utils.getJSONString(headers)); //clone
    }});
    Object.defineProperty(this, 'getPath', { configurable: false, writable: false, value: () => {
        return path;
    }});
    Object.defineProperty(this, 'getMethod', { configurable: false, writable: false, value: () => {
        return "POST";
    }});
    Object.defineProperty(this, 'getMessageStatus', { configurable: false, writable: false, value: () => {
        const status = message.getMessageStatus();
        const httpStatus = status.match({ wildcard: 'http'});
        return httpStatus;
    }});
};
module.exports = { HttpRequestMessage };
