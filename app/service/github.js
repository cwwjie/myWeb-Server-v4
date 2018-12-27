// 框架类
const path = require('path');
const Service = require('egg').Service;
const cheerio = require('cheerio');
// 组件类
const consequencer = require(path.relative(__dirname, './app/utils/consequencer'));
const gettextby = require(path.relative(__dirname, './app/utils/gettextbyhttps'));

class githubService extends Service {
    /**
     * 获取 github 里面的数据 通过 key 值
     */
    async getValueByKey(key) {
        const github = await this.ctx.app.mysql.query(`select * from github where my_key="${key}";`);

        // 判断是否查询成功
        if (github instanceof Array === false || github.length === 0) {
            return consequencer.error(`无 ${key} 记录`);
        }

        
        // 判断是否查询成功的情况下，判断是否过期
        if (github[0].expire_timestamp < new Date().getTime()) {
            return consequencer.error(`${key} 记录已过期`);
        }

        // 成功的情况下是 base64 位的数据
        var base64Buffer = new Buffer(github[0].value, 'base64');
        return consequencer.success(base64Buffer.toString());
    }

    /**
     * 存储 github 里面的数据
     */
    async saveValue(key, value) {
        // 设置过期时间
        let expire_timestamp = new Date().getTime() + 86400000;
        // 将value 转为 base64 位
        let base64value = new Buffer(value).toString("base64");

        // 根据 key 值获取一次
        const myinsert = await this.ctx.app.mysql.query(`select * from github where my_key="${key}";`);

        // 判断这个 key 值 是否有数据
        if (myinsert instanceof Array && myinsert.length > 0) {
            // 这个 key 值 有数据的情况下 更新这条数据
            let updateRecord = await this.ctx.app.mysql.query(`update github set value="${base64value}", expire_timestamp="${expire_timestamp}" where my_key="${key}";`);

            // 判断 SQL 是否执行成功
            if (updateRecord && updateRecord.warningCount === 0) {
                // 如果成功修改 直接返回数据即可
                return consequencer.success();
    
            } else {
                return consequencer.error(`数据库修改失败, 原因: ${JSON.stringify(updateRecord)}.`);
    
            }

        } else {
            // 这个 key 值 没有有数据的情况下 插入这条数据
            let saveRecord = await this.ctx.app.mysql.query(`insert into github (my_key, value, expire_timestamp) values ("${key}", "${base64value}", "${expire_timestamp}");`);
    
            // 判断是否保存成功
            if (saveRecord && saveRecord.warningCount === 0 && saveRecord.message === "") {
                return consequencer.success();
    
            } else {
                return consequencer.error(`数据库保存失败, 原因: ${saveRecord.message}.`);
    
            }
        }
    }

    /**
     * 爬虫 抓取 github rejiejay 的页面
     */
    async spiderRejiejay() {
        // 进行页面抓取, 这个一般都是可以抓取成功的
        let rejiejayHtml = await gettextby('https://github.com/rejiejay').then(val => val);
    
        /**
         * 使用 cheerio 进行 html 解析
         */
        const $ = cheerio.load(rejiejayHtml);
        const targetHtml = $('.js-calendar-graph-svg').html();
        
        return targetHtml;
    }
}

module.exports = githubService;
