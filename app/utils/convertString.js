/**
 * 字符串转为 base64位字符串
 */
module.exports.stringToBase64 = function stringToBase64(string) {
    return new Buffer(string, 'utf8').toString('base64');
}

/**
 * base64位字符串 转为 utf-8
 */
module.exports.base64ToString = function base64ToString(base64) {
    return new Buffer(base64, 'base64').toString('utf8');
}
