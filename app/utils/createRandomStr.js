/**
 * 生成随机数的方法
 * @param {number} length 随机字符串的长度
 */
let createRandomStr = length => {
    let resultStr = '';
    let stringArray = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
 
    for (let i = 0; i < length; i++) {
        let index = Math.round(Math.random() * (stringArray.length - 1)); // 随机下标
        resultStr += stringArray[index]; // 赋值进去
    }

    return resultStr;
}

module.exports = createRandomStr;

