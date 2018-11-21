const Service = require('egg').Service;
const consequencer = require('./../utils/consequencer');
const convertNumber = require('./../utils/convertNumber');

class recordService extends Service {
    /**
     * 一共多少条记录
     */
    async countall() {
        let count = await this.ctx.app.mysql.query('select count(*) from record_list_2018;');

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
        return await this.ctx.app.mysql.query(`select * from record_list_2018 order by timestamp desc LIMIT ${num ? (num * 10) : 0}, 10;`);
    }

    /**
     * 将记录表转换为索引表
     * @return {object} consequencer
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
     * @return {object} {
     *   id: 0,
     *   title: '',
     *   content: '',
     * }
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

        let nowTime = now.getTime();
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
                nowTime
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
            return consequencer.success({
                id: saveRecord.insertId,
                title: title,
                content: content
            });
        } else {
            return consequencer.error(`数据库保存失败, 原因: ${saveRecord.message}.`);
        }
    }
    
    /**
     * 编辑记录
     * @param {number} id 唯一标识
     * @param {number} year 年份
     * @param {string} title 标题
     * @param {string} content 内容
     * @return {object} 
     */
    async edit(id, year, title, content) {
        let checkRecord = await this.ctx.app.mysql.query(`select * from record_list_${year} where id="${id}" ;`);
        if (checkRecord instanceof Array === false || checkRecord.length === 0) {
            return consequencer.error('数据有误');
        }
        let updateRecord = await this.ctx.app.mysql.query(
            `update record_list_${year} set title="${title}",content="${content}",timestamp="${new Date().getTime()}" where id="${id}";`
        );

        // 是否保存成功? 
        if (
            updateRecord && 
            updateRecord.warningCount === 0
        ) {
            return consequencer.success({
                id: id,
                year: year,
                title: title,
                content: content
            });
        } else {
            return consequencer.error(`数据库修改失败, 原因: ${updateRecord.message}.`);
        }
    }    
    /**
     * 删除记录
     * @param {number} id 唯一标识
     * @param {number} year 年份
     * @return {object} 
     */
    async delete(id, year) {
        let checkRecord = await this.ctx.app.mysql.query(`select * from record_list_${year} where id="${id}" ;`);
        if (checkRecord instanceof Array === false || checkRecord.length === 0) {
            return consequencer.error('数据有误');
        }
        let deleteRecord = await this.ctx.app.mysql.query(
            `delete from record_list_${year} where id="${id}";`
        );

        // 是否删除成功? 
        if (
            deleteRecord && 
            deleteRecord.warningCount === 0
        ) {
            return consequencer.success();
        } else {
            return consequencer.error(`删除数据修改失败, 原因: ${deleteRecord.message}.`);
        }
    }    

    /**
     * 随机查询一条记录
     * @return {object} consequencer
     */
    async getOne() {
        let countAmount = 0; // 一共多少条数据
        let indexArray = [ // 每个年份对应数据的下标
            // {
            //     year: 2018, // 对应年份
            //     countStart: 0, // 统计之前的数据
            //     countEnd: 1,   // 统计过后的数据
            // }
        ];

        let countStart = 1; // 统计之前的数据
        // 统计一共有多少数据
        for (let thisYear = 2018; thisYear <= new Date().getFullYear(); thisYear++) {
            let countYear = await this.ctx.app.mysql.query(`select record_amount from record_index_${thisYear} where month_count="0" and week_count="0";`);

            if (countYear.length === 0) { // 如果出现这种情况表示未进行统计
                await this.ctx.service.record.indexConverter(); // 统计一次
                countYear = await this.ctx.app.mysql.query(`select record_amount from record_index_${thisYear} where month_count="0" and week_count="0";`); // 再次获取统计过后的数据
            }
            countAmount += countYear[0]['count(*)'];
            indexArray.push({
                year: thisYear,
                countStart: countStart,
                countEnd: countAmount,
            });

            // 进入下一个循环
            countStart = countAmount;
        }

        // 随机数, 用于判断在哪个年份
        let randomIndex = convertNumber.creatRandomBy(1, countAmount === 0 ? 1 : countAmount);
        let targetYear = 2018; // 查询的年份(随机生成)
        for (let i = 0; i < indexArray.length; i++) {
            if (
                randomIndex > indexArray[i].countStart &&
                randomIndex <= indexArray[i].countEnd
            ) {
                targetYear = indexArray[i].year;
            }
        }
        
        let record = await this.ctx.app.mysql.query(`select  *  from  record_list_${targetYear} order by rand() limit 1`);

        if (record.length > 0) { // 成功
            return consequencer.success({
                id: record[0].id,
                year: targetYear,
                title: record[0].title,
                content: record[0].content,
            });
        } else {
            return consequencer.error('数据为空')
        }
    }
}

module.exports = recordService;
