const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    // let global_access_token = await this.ctx.app.mysql.query("update weixin set value='',expire_timestamp='' where  my_key='global_access_token';");
    let global_access_token = await this.ctx.app.mysql.query("update weixin set value='11_Hi0KxrnvVN_RP47QqLd6_lkV8EAgKSLG_CL28rFgJd4eMaVc0g4jEOIgZ_BulbYXvKcGUTVfN6aaQHpY-xNxiTPO7c5xU_Yj7nRS7bpRtYPsT1K61xG2haGyAcgFzDl9KfCGmKBJyK9SKX8wYBMbAEAGJU',expire_timestamp='1' where  my_key='global_access_token';");
    return this.ctx.body = global_access_token;
    
    // this.ctx.body = this.config;
    // this.ctx.body = 'Hello ~~~ Welcome to Rejiejay server side and your place in home';
  }
}

module.exports = HomeController;
