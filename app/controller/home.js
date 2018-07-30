const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    // let global_access_token = await this.ctx.app.mysql.query("update weixin set value='',expire_timestamp='' where  my_key='global_access_token';");
    // this.ctx.body = await this.ctx.service.record.indexConverter();
    this.ctx.body = 'Hello ~~~ Welcome to Rejiejay server side and your place in home';
    // this.ctx.body = await this.ctx.service.record.save(12, 2018, '331','331');
    // this.ctx.body = await this.ctx.app.mysql.query(`select record_amount from record_index_${2018} where month_count="0" and week_count="0";`);
  }

  async post() {
    console.log('接收到post 请求');
  }
}

module.exports = HomeController;
