const Controller = require('egg').Controller;
const consequencer = require('./../utils/consequencer');

class UserController extends Controller {
    async index() {
        this.ctx.body = 'Hello ~~~ Welcome to Rejiejay server side and your place in user';
    }

    /**
     * 登录
     */
    async login() {
        // 判断参数
        if (!this.ctx.query || !this.ctx.query.password || this.ctx.query.password.length !== 6) {
            return this.ctx.body = consequencer.error('参数错误');
        }

        let myUserToken = await this.ctx.service.user.gerPassword(this.ctx.query.password);

         // 查询失败
         if (myUserToken.result !== 1) {
            return this.ctx.body = myUserToken;
        }

        // 如果是彩蛋
        if (myUserToken.data.is_easteregg === 'true') {
           return this.ctx.body = consequencer.error('恭喜你获得彩蛋', 6666);
        }

        this.ctx.body = consequencer.success({token: myUserToken.data.user_token});
    }
}

module.exports = UserController;
