// 框架类
const path = require('path');
const Service = require('egg').Service;
// 组件类
const consequencer = require(path.relative(__dirname, './app/utils/consequencer'));

class MicrosoftService extends Service {
}

module.exports = MicrosoftService;
