const crypto = require('crypto');

/**
 * 验证 payload 来自于 rejiejay
 * @param {object} payload 请求体
 * @param {string} signature cd2c432c30f77dc3d008812010b76d06874771f1
 * @return {boolean} Validating payloads from rejiejay
 */
const validatingPayloads = (payload, signature) => {
    let hash = crypto.createHmac('sha1', 'ThisRejiejayEncryptPayloads');
    hash.update(JSON.stringify(payload));

    if (hash.digest('hex') === signature) {
        return true
    } else {
        return false
    }

}

module.exports = validatingPayloads;
