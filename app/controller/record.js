const Controller = require('egg').Controller;

const consequencer = require('./../utils/consequencer');
const validatingPayloads = require('./../utils/validatingPayloads');

class RecordController extends Controller {

  async index() { // 测试入口
    this.ctx.body = 'Hello ~~~ Welcome to Rejiejay server side and your place in record.';
  }

  async save() { 
    if (!validatingPayloads(this.ctx.request.body, this.ctx.request.header['x-rejiejay-signature'])) {
      return this.ctx.body = consequencer.error('验证失败!');
    }

    this.ctx.body = 'Hello';
  }
}

module.exports = RecordController;
