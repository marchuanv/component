function HttpResponseMessage({ message }) {
    this.constructor({ message });
};
HttpResponseMessage.prototype.getId = function() {};
HttpResponseMessage.prototype.getEncryptedContent = function() {};
HttpResponseMessage.prototype.getDecryptedContent = function() {};
HttpResponseMessage.prototype.getSenderAddress = function() {};
HttpResponseMessage.prototype.getRecipientAddress = function() {};
HttpResponseMessage.prototype.getContentMetadata = function() {};
HttpResponseMessage.prototype.getMessageMetadata = function() {};
HttpResponseMessage.prototype.getHeaders = function() {};
HttpResponseMessage.prototype.getMessageStatus = function() {};
HttpResponseMessage.prototype.getStatusCode = function() {};
HttpResponseMessage.prototype.getStatusMessage = function() {};
module.exports = { HttpResponseMessage };
