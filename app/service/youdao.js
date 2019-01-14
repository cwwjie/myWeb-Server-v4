// 框架类
const path = require('path');
const Service = require('egg').Service;
// 组件类
const consequencer = require(path.relative(__dirname, './app/utils/consequencer'));

class YoudaoService extends Service {
}

module.exports = YoudaoService;
