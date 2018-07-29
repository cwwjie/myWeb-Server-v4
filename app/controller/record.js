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
    this.ctx.body = await this.ctx.service.record.getOne();
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

    // 判断一些必填项目
    if (!payload || !payload.title || !payload.content || typeof payload.title !== 'string' || typeof payload.content !== 'string') {
      return this.ctx.body = consequencer.error('payload is error');
    }

    // 验证请求
    let myVerify = await this.ctx.service.user.validatingPayload();
    if (myVerify.result !== 1) {
      return this.ctx.body = myVerify;
    }

    this.ctx.body = await this.ctx.service.record.save(payload.title, payload.content);
  }
}

module.exports = RecordController;
