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

    /**
     * 存储记录
     * @param {string} en_text 英文
     * @param {string} zh_text 中文
     * @return {object} 
     */
    async save(en_text, zh_text) {
        /**
         * 初始化时间
         */
        let creat_timestamp  = new Date().getTime();

        /**
         * 插入到MySQL
         */
        let saveRecord = await this.ctx.app.mysql.query(`insert into english (en_text, zh_text, creat_timestamp) values ("${en_text}", "${zh_text}", "${creat_timestamp}")`);

        /**
         * 判断是否插入成功
         */
        if (saveRecord && saveRecord.warningCount === 0 && saveRecord.message === "") {
            return consequencer.success();
        } else {
            return consequencer.error(`数据库保存失败, 原因: ${saveRecord.message}.`);
        }
    }
}

module.exports = HomeController;
