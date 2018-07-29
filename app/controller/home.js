const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    // let global_access_token = await this.ctx.app.mysql.query("update weixin set value='',expire_timestamp='' where  my_key='global_access_token';");
    // this.ctx.body = await this.ctx.service.record.indexConverter();
    // this.ctx.body = 'Hello ~~~ Welcome to Rejiejay server side and your place in home';
    let targetYear = 2018;
    let record = await this.ctx.app.mysql.query(`SELECT * FROM record_list_${targetYear} AS t1 JOIN (SELECT ROUND(RAND() * ((SELECT MAX(id) FROM record_list_${targetYear})-(SELECT MIN(id) FROM record_list_${targetYear}))+(SELECT MIN(id) FROM record_list_${targetYear})) AS id) AS t2 WHERE t1.id >= t2.id ORDER BY t1.id LIMIT 1;`);
    this.ctx.body = record;
  }

  async post() {
    console.log('接收到post 请求');
  }
}

module.exports = HomeController;
