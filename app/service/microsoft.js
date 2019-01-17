// 框架类
const path = require('path');
const Service = require('egg').Service;
// 组件类
const consequencer = require(path.relative(__dirname, './app/utils/consequencer'));

class MicrosoftService extends Service {
    /**
     * 获取变量
     */
    async getBykey(keyword) {
        // 执行SQL
        const awaitkeyword = await this.ctx.app.mysql.query(`select * from microsoft where key_word="${keyword}";`);

        // 判断 SQL 是否执行成功
        if (awaitkeyword instanceof Array && awaitkeyword.length > 0) {
            // 如果成功修改 直接返回数即可
            return consequencer.success(awaitkeyword[0]);

        } else {
            return consequencer.error(`查询没有此keyword ${keyword}.`);

        }
    }

    /**
     * 通过一个键值存储一个变量
     */
    async saveBykey(keyword, value, timestamp) {
        if (!keyword || !value) {
            return consequencer.error('参数有误');
        }

        // 先查询 是否存在这个键
        const awaitkeyword = await this.ctx.service.microsoft.getBykey(keyword);

        // 判断是否有这个值
        let awaitsave = {};
        let expire_timestamp = timestamp ? timestamp : new Date().getTime(); // 如果有过期时间
        
        if (awaitkeyword.result === 1) {
            // 存在的话就更新
            awaitsave = await this.ctx.app.mysql.query(`update microsoft set key_value="${value}",expire_timestamp="${expire_timestamp}" where key_word="${keyword}";`);

        } else {
            // 不存在则插入
            awaitsave = await this.ctx.app.mysql.query(`insert into microsoft (key_word, key_value, expire_timestamp) values ("${keyword}", "${value}", "${expire_timestamp}");`);

        }

        // 判断 SQL 是否执行成功
        if (awaitsave && awaitsave.warningCount === 0) {
            // 如果成功修改 直接返回数即可
            return consequencer.success();

        } else {
            return consequencer.error(`存储变量失败, 原因: ${JSON.stringify(awaitsave)}.`);

        }
    }

    /**
     * 通过 关键字 删除 一条记录
     */
    async delBykey(keyword) {
        // 先查询 是否存在这个键
        const awaitkeyword = await this.ctx.service.microsoft.getBykey(keyword);
        
        // 判断是否有这个值
        if (awaitkeyword.result !== 1) {
            // 不存在, 返回成功即可
            return consequencer.success();
        }

        // 执行删除记录 SQL
        let deleteItem = await this.ctx.app.mysql.query(`delete from microsoft where key_value="${keyword}";`);

        // 判断SQL 是否执行成功
        if (deleteItem && deleteItem.warningCount === 0) {
            return consequencer.success();

        }  else {
            return consequencer.error(`数据删除失败, 原因: ${deleteRecord.message}.`);

        }
    }

    /**
     * 删除 标签为 pages 的所有记录
     */
    async delLablePages() {
        // 执行删除记录 SQL
        let deleteItem = await this.ctx.app.mysql.query(`delete from microsoft where tag_lable="pages";`);

        // 判断SQL 是否执行成功
        if (deleteItem && deleteItem.warningCount === 0) {
            return consequencer.success();

        }  else {
            return consequencer.error(`执行清空操作失败, 原因: ${deleteRecord.message}.`);

        }
    }

    /**
     * 通过分区id 记录 一个 pages 页面
     */
    async savePagesByParentSectionId(parentSectionId, contentUrl) {
        // 直接执行SQL
        let awaitsave = await this.ctx.app.mysql.query(`insert into microsoft (key_word, key_value, tag_lable, expire_timestamp) values ("${parentSectionId}", "${contentUrl}", "pages", "${new Date().getTime()}");`);

        // 判断 SQL 是否执行成功
        if (awaitsave && awaitsave.warningCount === 0) {
            // 如果成功修改 直接返回数即可
            return consequencer.success();

        } else {
            return consequencer.error(`存储变量失败, 原因: ${JSON.stringify(awaitsave)}.`);

        }
    }

    /**
     * 根据分区id随机查询 OneNote notebook 
     */
    async getRandomPagesBy(parentSectionId) {
        let awaitSQL = await this.ctx.app.mysql.query(`select * from microsoft where key_word="${parentSectionId}" order by rand() limit 1;`);

        // 判断是否查询成功
        if (awaitSQL instanceof Array && awaitSQL.length > 0) {
            return consequencer.success(awaitSQL[0]);

        } else {
            return consequencer.error('无此 parentSectionId 记录');
            
        }
    }
}

module.exports = MicrosoftService;
