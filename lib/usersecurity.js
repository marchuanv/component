const fs = require('fs');
const utils = require('utils');
const path = require('path');
const userIdentitiesStorePath = path.join(__dirname, '../useridentities.json');
let userIdentities = {};
if (fs.existsSync(userIdentitiesStorePath)) {
    userIdentities = require(userIdentitiesStorePath);
} else {
    fs.writeFileSync(userIdentitiesStorePath, JSON.stringify(userIdentities, null, 4), 'utf8');
}
function UserSecurity({ userId }) {

    let _remoteBase64RSAPublicKey = null;
    let base64RSAPrivateKey;
    let base64RSAPublicKey;
    let user = userIdentities[userId];
  
    Object.defineProperty(this, 'isRegistered', { configurable: false, writable: false, value: () => {
        return user !== undefined;
    }});

    Object.defineProperty(this, 'authenticate', { configurable: false, writable: false, value: ({ secret, remoteBase64RSAPublickey }) => {
        const { hashedPassphrase } = utils.hashPassphrase(secret,  user.hashedPassphraseSalt);
        if (hashedPassphrase === user.hashedPassphrase) {
            const { privateKey, publicKey } = utils.generatePublicPrivateKeys(hashedPassphrase);
            base64RSAPrivateKey = utils.stringToBase64(privateKey);
            base64RSAPublicKey = utils.stringToBase64(publicKey);
            if (remoteBase64RSAPublickey) {
                _remoteBase64RSAPublicKey = remoteBase64RSAPublickey
            } else {
                _remoteBase64RSAPublicKey = base64RSAPublicKey;
            }
            return true;
        }
        return false;
    }});
    Object.defineProperty(this, 'isAuthorised', { configurable: false, writable: false, value: ({ base64rsapublickey }) => {
        return utils.isBase64String(base64RSAPrivateKey) && utils.isBase64String(base64RSAPublicKey) && base64rsapublickey === base64RSAPublicKey;
    }});
    Object.defineProperty(this, 'register', { configurable: false, writable: false, value: ({ secret }) => {
        const { hashedPassphrase, hashedPassphraseSalt } = utils.hashPassphrase(secret);
        user = { hashedPassphrase, hashedPassphraseSalt };
        userIdentities[userId] = user;
        fs.writeFileSync(userIdentitiesStorePath, JSON.stringify(userIdentities), 'utf8');
    }});
    Object.defineProperty(this, 'unregister', { configurable: false, writable: false, value: () => {
        delete userIdentities[userId];
        fs.writeFileSync(userIdentitiesStorePath, JSON.stringify(userIdentities), 'utf8');
    }});
    Object.defineProperty(this, 'getHashedPassphrase', { configurable: false, writable: false, value: () => {
        return user.hashedPassphrase;
    }});
    Object.defineProperty(this, 'getUserId', { configurable: false, writable: false, value: () => {
        return userId;
    }});
    Object.defineProperty(this, 'getBase64PublicKey', { configurable: false, writable: false, value: () => {
        return { base64RSAPublicKey };
    }});
    Object.defineProperty(this, 'getPublicKey', { configurable: false, writable: false, value: () => {
        return { publicKey: utils.base64ToString(base64RSAPublicKey) };
    }});
    Object.defineProperty(this, 'encryptObjectToJSON', { configurable: false, writable: false, value: ({ object }) => {
        const jsonStr = utils.getJSONString(object) || '{}';
        return utils.encryptToBase64Str(jsonStr, utils.base64ToString(_remoteBase64RSAPublicKey));
    }});
    Object.defineProperty(this, 'decryptJSONToObject', { configurable: false, writable: false, value: ({ encryptedJsonStr }) => {
        const hashedPassphrase = this.getHashedPassphrase();
        const privateKey = utils.base64ToString(base64RSAPrivateKey);
        return utils.getJSONObject(utils.decryptFromBase64Str(encryptedJsonStr, privateKey, hashedPassphrase));
    }});
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
UserSecurity.prototype.encryptObjectToJSON = function({ object }) {};
UserSecurity.prototype.decryptJSONToObject = function({ encryptedJsonStr }) {};

module.exports = { UserSecurity };