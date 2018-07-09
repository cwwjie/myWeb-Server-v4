const Service = require('egg').Service;
const lodash = require('lodash');
const Mailer = require('./../utils/Mailer');

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
}

module.exports = userService;
