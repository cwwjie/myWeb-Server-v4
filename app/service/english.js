const Controller = require('egg').Controller;

class HomeController extends Controller {
    /**
     * 一共多少条记录
     */
    async countall() {
        let count = await this.ctx.app.mysql.query('select count(*) from english;');

        // 是否查询到数据
        if (count && count instanceof Array && count[0]['count(*)'] > 0) {
            return count[0]['count(*)'];
        } else {
            return 0;
        }
    }

    /**
     * 根据页码查询多少条记录
     */
    async getByPageNum(num) {
        /**
         * LIMIT 第一个数 是从几开始查 第二个是代表查多少个 
         */
        return await this.ctx.app.mysql.query(`select * from english order by creat_timestamp desc LIMIT ${num ? num : 0}, 10;`);
    }
}

module.exports = HomeController;
