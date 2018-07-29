const convertNumber = {
    /**
     * 生成随机数的方法
     * @param {number} min 下限
     * @param {number} max 上限
     * @return {number} 基于 min ~ max 之间随机数
     */
    creatRandomBy: (min, max) => (Math.floor(Math.random() * (max - min + 1)) + min),
}

module.exports = convertNumber;