const Service = require('egg').Service;

class dynamicService extends Service {
    async getGroups() {
        const groups = await this.ctx.app.mysql.query('select * from dynamic_groups;');
        return groups;
    }

    async getRecords() {
        const records = await this.ctx.app.mysql.query('select * from dynamic_records;');
        return records;
    }
}

module.exports = dynamicService;
