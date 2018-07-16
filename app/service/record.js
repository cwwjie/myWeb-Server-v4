const Service = require('egg').Service;
const consequencer = require('./../utils/consequencer');

class recordService extends Service {
    /**
     * 将记录表转换为索引表
     */
    async indexConverter () {
        let nowYear = new Date().getFullYear();

        // 统计年
        let countYear = await this.ctx.app.mysql.query(`select count(*) from record_list_${nowYear};`);
        let savecountYear = await this.ctx.app.mysql.query(
            `insert into record_index_${now.getFullYear()} (month_count, week_count, record_amount) values ("0", "0", "${
                countYear[0]['count(*)']
            }");`
        );

        for (let i = 1; i <= 12; i++) {
            // 统计月

            for (let j = 1; j <= 4; j++) {
                // 统计周

            }
            await new Promise (resolve => {
                setTimeout(() => {
                    console.log(i)
                    resolve()
                }, 100)
            }) 
        }
        
        return savecountYear
    }
    /**
     * 存储记录
     * @param {string} title 标题
     * @param {string} content 内容
     * @return {object} 
     */
    async save(title, content) {
        let now = new Date();
        let myDate = now.getDate();
        let createWeek = () => {
            if (myDate <= 7) {
                return 1
            }
            if (myDate > 7 && myDate <= 14) {
                return 2
            }
            if (myDate > 14 && myDate <= 21) {
                return 3
            }
            if (myDate > 21) {
                return 4
            }
        }

        let saveRecord = await this.ctx.app.mysql.query(
            `insert into record_list_${now.getFullYear()} (record_month, record_week, record_day, record_data, timestamp, title, content) values ("${
                now.getMonth() + 1   
            }", "${
                createWeek()
            }", "${
                now.getDay() + 1
            }", "${
                myDate
            }", "${
                now.getTime()
            }", "${
                title
            }", "${
                content
            }");`
        );

        // 是否查询到数据
        if (
            saveRecord && 
            saveRecord.warningCount === 0 &&
            saveRecord.message === ""
        ) {
            return consequencer.success();
        } else {
            return consequencer.error(`数据库保存失败, 原因: ${saveRecord.message}.`);
        }
    }
    /**
     * 存储记录
     * @param {string} title 标题
     * @param {string} content 内容
     * @return {object} 
     */
    async insertTestData () {
        
    }    
}

module.exports = recordService;
