const Controller = require('egg').Controller;
const consequence = require('./../utils/consequence');

class MobileController extends Controller {

  async index() {
    this.ctx.body = 'Hello~ Welcome to Rejiejay server side and your place is Mobile.';
  }

  async getdynamics() {
    let records = await this.ctx.service.dynamic.getRecords();
    let groups = await this.ctx.service.dynamic.getGroups();

    let results = {
      dynamics: records,
      groups: groups,
    }

    this.ctx.body = consequence.success(results);
  }
}

module.exports = MobileController;
