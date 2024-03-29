function UserSecurity({ userId }) {
    this.constructor({ userId });
};
UserSecurity.prototype.isRegistered = function() {};
UserSecurity.prototype.authenticate = function({ secret }) { };
UserSecurity.prototype.isAuthorised = function({ token }) { };
UserSecurity.prototype.register = function({ secret }) { };
UserSecurity.prototype.unregister = function() { };
UserSecurity.prototype.getHashedPassphrase = function() { };
UserSecurity.prototype.getUserId = function() { };
UserSecurity.prototype.getBase64KeyPair = function() {};
UserSecurity.prototype.getKeyPair = function() {};
UserSecurity.prototype.getToken = function() {};
UserSecurity.prototype.encryptObjectToJSON = function({ object }) {};
UserSecurity.prototype.decryptJSONToObject = function({ encryptedJsonStr }) {};
module.exports = { UserSecurity };
