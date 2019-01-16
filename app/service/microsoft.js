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
     * 删除
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
}

module.exports = MicrosoftService;
