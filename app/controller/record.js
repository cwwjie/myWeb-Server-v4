const Controller = require('egg').Controller;

class RecordController extends Controller {

  async index() { // 测试入口
    this.ctx.body = 'Hello ~~~ Welcome to Rejiejay server side and your place in record.';
  }

  async save() { 
    console.log('Hello')
    this.ctx.body = 'Hello';
  }
}

module.exports = RecordController;
