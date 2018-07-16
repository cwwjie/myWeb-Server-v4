const Controller = require('egg').Controller;

const consequencer = require('./../utils/consequencer');
// const validatingPayloads = require('./../utils/validatingPayloads');

class RecordController extends Controller {

  async index() { // 测试入口
    this.ctx.body = 'Hello ~~~ Welcome to Rejiejay server side and your place in record.';
  }

  /**
   * 随机查询一条记录
   */
  async getOneByRandom() { 
    
    this.ctx.body = await this.ctx.service.record.save(payload.title, payload.content);
  }

  /**
   * 保存一条记录
   * @param {object} payload {
   *   title: string, 标题
   *   content: string, 内容
   * }
   */
  async save() { 
    const payload = this.ctx.request.body;
    const signature = this.ctx.request.header['x-rejiejay-signature'];

    if (this.ctx.request.header["content-type"] !== "application/json") {
      return this.ctx.body = consequencer.error('content-type is not application/json');
    }

    if (!signature) {
      return this.ctx.body = consequencer.error('signature is error');
    }

    if (!payload || !payload.title || !payload.content || typeof payload.title !== 'string' || typeof payload.content !== 'string') {
      return this.ctx.body = consequencer.error('payload is error');
    }

    let myVerify = await this.ctx.service.user.validatingPayload(payload, signature);

    if (myVerify.result !== 1) {
      return this.ctx.body = myVerify;
    }

    this.ctx.body = await this.ctx.service.record.save(payload.title, payload.content);
  }
}

module.exports = RecordController;
