// 框架
const path = require('path');
const Service = require('egg').Service;
// 组件
const consequencer = require(path.relative(__dirname, './app/utils/consequencer'));

class englishService extends Service {
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
        return await this.ctx.app.mysql.query(`select * from english order by creat_timestamp desc LIMIT ${num ? (num * 10) : 0}, 10;`);
    }

    /**
     * 随机查询16条记录
     */
    async getByRandom() {
        return await this.ctx.app.mysql.query('select * from english order by rand() limit 16;');
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

    /**
     * 编辑记录
     * @param {string} id 唯一标识
     * @param {string} en_text 英文
     * @param {string} zh_text 中文
     * @return {object} 
     */
    async edit(id, en_text, zh_text) {
        /**
         * 判断是否有这条数据
         */
        let checkRecord = await this.ctx.app.mysql.query(`select * from english where id="${id}" ;`);
        if (checkRecord instanceof Array === false || checkRecord.length === 0) {
            return consequencer.error('数据有误');
        }

        /**
         * 修改记录
         */
        let updateRecord = await this.ctx.app.mysql.query(`update english set en_text="${en_text}",zh_text="${zh_text}" where id="${id}";`);
        if (updateRecord && updateRecord.warningCount === 0) {
            return consequencer.success();
        }  else {
            return consequencer.error(`数据库修改失败, 原因: ${updateRecord.message}.`);
        }
    }

    /**
     * 删除记录
     * @param {string} id 唯一标识
     * @return {object} 
     */
    async del(id) {
        /**
         * 判断是否有这条数据
         */
        let checkRecord = await this.ctx.app.mysql.query(`select * from english where id="${id}" ;`);
        if (checkRecord instanceof Array === false || checkRecord.length === 0) {
            return consequencer.error('数据有误');
        }

        /**
         * 删除记录
         */
        let deleteRecord = await this.ctx.app.mysql.query(`delete from english where id="${id}";`);
        if (deleteRecord && deleteRecord.warningCount === 0) {
            return consequencer.success();
        }  else {
            return consequencer.error(`数据库修改失败, 原因: ${deleteRecord.message}.`);
        }
    }
}

module.exports = englishService;
