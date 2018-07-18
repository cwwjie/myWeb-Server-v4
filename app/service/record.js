const Service = require('egg').Service;
const consequencer = require('./../utils/consequencer');

class recordService extends Service {
    /**
     * 将记录表转换为索引表
     */
    async indexConverter () {
        let nowYear = new Date().getFullYear(); // 今年
        let errorList = [];

        // 清空
        await this.ctx.app.mysql.query(`delete from record_index_${nowYear};`);

        // 统计年
        let countYear = await this.ctx.app.mysql.query(`select count(*) from record_list_${nowYear};`);
        let saveCountYear = await this.ctx.app.mysql.query(
            `insert into record_index_${nowYear} (month_count, week_count, record_amount) values ("0", "0", "${
                countYear[0]['count(*)']
            }");`
        );

        if (saveCountYear.warningCount !== 0 || saveCountYear.message !== '' ) {
            errorList.push(consequencer.error('统计一年所有失败', 2332, saveCountYear));
        }

        for (let i = 1; i <= 12; i++) {
            // 统计月
            let countMonth = await this.ctx.app.mysql.query(`select count(*) from record_list_${nowYear} where record_month="${i}";`);
            let saveCountMonth = await this.ctx.app.mysql.query(
                `insert into record_index_${nowYear} (month_count, week_count, record_amount) values ("${i}", "0", "${
                    countMonth[0]['count(*)']
                }");`
            );  

            if (saveCountMonth.warningCount !== 0 || saveCountMonth.message !== '' ) {
                errorList.push(consequencer.error(`统计${i}月的记录数据失败`, 2332, saveCountMonth));
            }

            for (let j = 1; j <= 4; j++) {
                // 统计周
                let countWeek = await this.ctx.app.mysql.query(`select count(*) from record_list_${nowYear} where record_month="${i}" and record_week
                ="${j}";`);
                let saveCountWeek = await this.ctx.app.mysql.query(
                    `insert into record_index_${nowYear} (month_count, week_count, record_amount) values ("${i}", "${j}", "${
                        countWeek[0]['count(*)']
                    }");`
                );

                if (saveCountWeek.warningCount !== 0 || saveCountWeek.message !== '' ) {
                    errorList.push(consequencer.error(`统计${i}月的第${j}周的记录数据失败`, 2332, saveCountWeek));
                }
            }
        }

        if (errorList.length === 0) {
            return consequencer.success();
        } else {
            return consequencer.error('统计数据出现错误!', 3223, errorList)
        }
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