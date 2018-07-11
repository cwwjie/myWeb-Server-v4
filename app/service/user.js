const Service = require('egg').Service;
const lodash = require('lodash');
const Mailer = require('./../utils/Mailer');
const validatingPayloads = require('./../utils/validatingPayloads');
const consequencer = require('./../utils/consequencer');

class userService extends Service {
    /**
     * 储存密码
     * @param {string} password 六位数的密码
     * @param {boolean} isEasterEgg 是否是彩蛋
     */
    async savePassword(password, isEasterEgg) {
        let randomToken = lodash.shuffle([
            1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 
            'a', 'b', 'c', 'd', 'e', 'f', 'g',
            'h', 'i', 'j', 'k', 'l', 'm', 'n',
            'n', 'o', 'p', 'q', 'r', 's', 't', 
            'u', 'v', 'w', 's', 'y', 'z',
            'A', 'B', 'C', 'D', 'E', 'F', 'G',
            'H', 'I', 'J', 'K', 'L', 'M', 'N',
            'N', 'O', 'P', 'Q', 'R', 'S', 'T', 
            'U', 'V', 'W', 'S', 'Y', 'Z',
            '-', '_'
        ]).join('').slice(0, 40);

        await this.ctx.app.mysql.query('insert into user_login (user_password, user_token, is_easteregg, creat_timestamp) values ( "' + 
            password + '", "' + 
            randomToken + '", "' + 
            (isEasterEgg ? 'true' : 'false') + '", "' +
            new Date().getTime()  + '");');
        
        let myuserlogin = await this.ctx.app.mysql.query("select * from user_login where user_token='" + randomToken + "';");

        // 是否成功储存 
        if (
            isEasterEgg === false && // 不是彩蛋的才通知
            myuserlogin.length > 0 && 
            myuserlogin[0].user_token === randomToken
        ) {
            Mailer('454766952@qq.com', '生成新密码', `新的密码为:${password}, 对应的token为${randomToken}`)
            .then(
                succeed => succeed,
                MailerError => console.error(`成功生成新密码, 但是无法进行邮件通知${JSON.stringify(MailerError)}`),
            );
        }
    }

    /**
     * 清空密码 预留一位
     */
    async clearPassword() {
        // 预留一位
        let myuserlogin = await this.ctx.app.mysql.query("select * from user_login where is_easteregg='false' and creat_timestamp=(select max(creat_timestamp) from user_login where is_easteregg='false');");

        await this.ctx.app.mysql.query("delete from user_login;");

        // 是否有预留?
        if (myuserlogin.length === 0) {
            return Mailer('454766952@qq.com', '定时任务清空密码', '成功清空密码,并且数据库无其他密码.')
            .then(
                succeed => succeed,
                MailerError => console.error(`定时任务成功清空密码, 但是无法进行邮件通知${JSON.stringify(MailerError)}`),
            );
        }

        let result = await this.ctx.app.mysql.query('insert into user_login (user_password, user_token, is_easteregg, creat_timestamp) values ( "' + 
            myuserlogin[0].user_password + '", "' + 
            myuserlogin[0].user_token + '", "false", "' +
            myuserlogin[0].creat_timestamp  + '");');

        if (result.warningCount === 0 || result.warningCount === '0') {
            Mailer('454766952@qq.com', '定时任务清空密码', '成功清空密码,并且预留一位密码.')
            .then(
                succeed => succeed,
                MailerError => console.error(`定时任务成功清空密码, 但是无法进行邮件通知${JSON.stringify(MailerError)}`),
            );
        } else {
            Mailer('454766952@qq.com', '定时任务清空密码', `成功清空密码, 但是预密码出错. 原因: ${result.message}`)
            .then(
                succeed => succeed,
                MailerError => console.error(`定时任务成功清空密码, 但是无法进行邮件通知${JSON.stringify(MailerError)}`),
            );
        }
    }

    /**
     * 根据密码查询
     * @param {string} password 六位数的密码
     * @return {object} {
     *   id
     *   user_password
     *   user_token
     *   is_easteregg
     *   creat_timestamp
     * }
     */
    async gerPassword(password) {
        let myuserlogin = await this.ctx.app.mysql.query('select * from user_login where user_password="' + password + '";');
        
        // 是否查询到数据
        if (myuserlogin && myuserlogin instanceof Array) {
            return consequencer.success(myuserlogin[0]);
        } else {
            return consequencer.error('密码错误');
        }
    }

    /**
     * 验证密码
     * @param {object} payload 请求体
     * @param {string} signature cd2c432c30f77dc3d008812010b76d06874771f1
     * @return {boolean} Validating payloads from rejiejay
     */
    async validatingPassword(payload, signature) {
        let myuserlogin = await this.ctx.app.mysql.query("select * from user_login where is_easteregg='false' order by creat_timestamp desc;");
        let myverify = false;

        if (myuserlogin && myuserlogin instanceof Array) {
            myuserlogin.map(userlogin => {
                let temp_signature = validatingPayloads(payload, userlogin.user_token);

                if (temp_signature === signature) {
                    myverify = true;
                }
                return userlogin
            });
        } else {
            return consequencer.error('数据库查询出错， 原因无token。');
        }

        if (myverify) {
            return consequencer.success();
        } else {
            return consequencer.error('验证的参数是错误的。');
        }
    }
}

module.exports = userService;
