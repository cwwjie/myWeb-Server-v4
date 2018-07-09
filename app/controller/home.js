const Controller = require('egg').Controller;
const postjsonby = require('./../utils/postjsonbyhttps');

class HomeController extends Controller {
  async index() {
    // let global_access_token = await this.ctx.app.mysql.query("update weixin set value='',expire_timestamp='' where  my_key='global_access_token';");
    // let global_access_token = await this.ctx.app.mysql.query("update weixin set value='11_Hi0KxrnvVN_RP47QqLd6_lkV8EAgKSLG_CL28rFgJd4eMaVc0g4jEOIgZ_BulbYXvKcGUTVfN6aaQHpY-xNxiTPO7c5xU_Yj7nRS7bpRtYPsT1K61xG2haGyAcgFzDl9KfCGmKBJyK9SKX8wYBMbAEAGJU',expire_timestamp='1' where  my_key='global_access_token';");
    // return this.ctx.body = global_access_token;
    
    // this.ctx.body = this.config;
    // this.ctx.res.writeHead(200, {
    //     'Content-Type': 'application/xml;charset=UTF-8'
    // });
    // this.ctx.res.write('<xml>');
    // this.ctx.res.write('<ToUserName>ToUserName</ToUserName>');
    // this.ctx.res.write('<FromUserName>FromUserName</FromUserName>');
    // this.ctx.res.write('<CreateTime>CreateTime</CreateTime>');
    // this.ctx.res.write('<MsgType>text</MsgType>');
    // this.ctx.res.write('<Content>你好,rejiejay.你的openid为: 123</Content>');
    // this.ctx.res.end('</xml>');
    // this.ctx.body = '<xml><ToUserName>rejiejay</ToUserName><FromUserName>oI0FV0pK5sqCnE_LBBXb6sxdROwg</FromUserName><CreateTime>1348831860</CreateTime><MsgType>text</MsgType><Content>this is a test</Content><MsgId>1234567890123456</MsgId></xml>';
    this.ctx.body = 'Hello ~~~ Welcome to Rejiejay server side and your place in home';
  }

  async post() {
    console.log('接收到post 请求');
    this.ctx.body = this.ctx;
  }
}

module.exports = HomeController;
