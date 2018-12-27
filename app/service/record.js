// 框架类
const path = require('path');
const Service = require('egg').Service;
// 组件类
const consequencer = require(path.relative(__dirname, './app/utils/consequencer'));

class recordService extends Service {
    /**
     * 一共多少条记录
     */
    async countall() {
        let count = await this.ctx.app.mysql.query('select count(*) from record;');

        // 是否查询到数据
        if (count && count instanceof Array && count[0]['count(*)'] > 0) {
            return count[0]['count(*)'];

        } else {
            // 无数据 返回 0即可
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
        return await this.ctx.app.mysql.query(`select * from record order by timestamp desc LIMIT ${num ? (num * 10) : 0}, 10;`);
    }

    /**
     * 根据Id 查询一条记录
     * @param {number || string} id 记录的唯一 id （此 id 默认是正确的不进行 校验）
     */
    async getOneById(id) {
        // 执行SQL语句
        let checkRecord = await this.ctx.app.mysql.query(`select * from record where id="${id}" ;`);

        // 判断是否查询成功
        if (checkRecord instanceof Array === false || checkRecord.length === 0) {
            return consequencer.error('无此 id 记录');
        }
        
        return consequencer.success({id: checkRecord[0].id, title: checkRecord[0].title, content: checkRecord[0].content});
    }

    /**
     * 随机查询 N 条记录
     */
    async getByRandom(N) {
        // 执行随机查询的SQL
        let selectRandom = await this.ctx.app.mysql.query(`select * from record order by rand() limit ${N ? N : 1};`);
        
        // 判断 查询的 SQL 是否成功
        if (selectRandom && selectRandom instanceof Array && selectRandom.length > 0) {
            // 成功的情况返回 SQL 查询到的数据
            return consequencer.success(selectRandom);

        } else {
            return consequencer.error('随机查询的SQL查询失败');

        }
    }
    
    /**
     * 存储记录
     * @param {string} title 标题
     * @param {string} content 内容
     * @return {object} id title content
     */
    async save(title, content) {
        // 执行SQL语句
        let saveRecord = await this.ctx.app.mysql.query(`insert into record (timestamp, title, content) values ("${new Date().getTime()}", "${title}", "${content}");`);

        // 判断是否保存成功
        if (saveRecord && saveRecord.warningCount === 0 && saveRecord.message === "") {
            return consequencer.success({id: saveRecord.insertId, title: title, content: content});

        } else {
            return consequencer.error(`数据库保存失败, 原因: ${saveRecord.message}.`);

        }
    }
    
    /**
     * 编辑记录
     * @param {number} id 唯一标识
     * @param {string} title 标题
     * @param {string} content 内容
     * @return {object} 
     */
    async edit(id, title, content) {

        // 根据 id 查询一条记录
        let checkRecord = await this.ctx.service.record.getOneById(id);

        // 校验 是否 未查询到记录
        if (checkRecord.result !== 1) {
            return consequencer.error('数据有误'); // 未能 根据 id 查询一条记录 返回失败
        }

        // 查询记录成功的下 执行修改的 SQL
        let updateRecord = await this.ctx.app.mysql.query(`update record set title="${title}",content="${content}",timestamp="${new Date().getTime()}" where id="${id}";`);

        // 判断 SQL 是否执行成功
        if (updateRecord && updateRecord.warningCount === 0) {
            // 如果成功修改 直接返回数据即可
            return consequencer.success(checkRecord.data);

        } else {
            return consequencer.error(`数据库修改失败, 原因: ${JSON.stringify(updateRecord)}.`);

        }
    }
    
    /**
     * 删除记录
     * @param {number} id 唯一标识
     * @return {object} 
     */
    async delete(id) {

        // 根据 id 查询一条记录
        let checkRecord = await this.ctx.service.record.getOneById(id);

        // 校验 是否 未查询到记录
        if (checkRecord.result !== 1) {
            return consequencer.error('不存在此条数据'); // 未能 根据 id 查询一条记录 返回失败
        }

        // 如果存在id 执行 删除的SQL语句
        let deleteRecord = await this.ctx.app.mysql.query(`delete from record where id="${id}";`);
        
        // 判断删除的SQL是否执行成功
        if (deleteRecord && deleteRecord.warningCount === 0) {
            return consequencer.success();

        } else {
            return consequencer.error(`删除数据修改失败, 原因: ${deleteRecord.message}.`);

        }
    }    
}

module.exports = recordService;
