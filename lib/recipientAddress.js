const { RecipientAddress } = require("./recipientaddress.prototype");
RecipientAddress.prototype.constructor = function({ recipientHost, recipientPort }) {
    Object.defineProperty(this, 'recipientHost', { configurable: false, writable: false, value: recipientHost });
    Object.defineProperty(this, 'recipientPort', { configurable: false, writable: false, value: recipientPort });
}
module.exports = { RecipientAddress };
