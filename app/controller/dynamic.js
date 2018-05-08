const Controller = require('egg').Controller;
const consequence = require('./../utils/consequence');
const convertTime = require('./../utils/convertTime');
const lodash = require('lodash');

class DynamicController extends Controller {

  async index() { // 测试入口
    this.ctx.body = 'Hello ~~~ Welcome to Rejiejay server side and your place in dynamic.';
  }

  async getbylist() { // 获取所有动态 根据列表的形式
    let records = await this.ctx.service.dynamic.getRecords();
    let groups = await this.ctx.service.dynamic.getGroups();

    this.ctx.body = consequence.success({
      // 这里暂时分出一个 dynamics 因为以后会有分页的需求
      dynamics: records.map(record => {
        let groupsIndex = lodash.findIndex(groups, group => group.id === record.group_id); // 查询对应分组
  
        return {
          whichGroup: {
            id: record.group_id,
            name: groupsIndex === -1 ? "未知分组" : groups[groupsIndex].name,
          },
          title: record.title,
          content: record.content,
          approved: record.approved,
          read: record.read_count,
          time: convertTime.dateToYYYYmmDDhhMMss(new Date(record.timestamp))
        }
      })
    });
  }
}

module.exports = DynamicController;
