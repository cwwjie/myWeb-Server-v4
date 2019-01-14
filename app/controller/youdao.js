const Controller = require('egg').Controller;

class YoudaoController extends Controller {
    async index() {
        this.ctx.body = 'Hello ~~~ Welcome to Rejiejay server side and your place in 【youdao】.';
    }
}

module.exports = YoudaoController;
