// 框架类
const Controller = require('egg').Controller;
// 组件类
const consequencer = require('./../utils/consequencer');

class HomeController extends Controller {
    async index() {
        this.ctx.body = '/english/';
    }

    /**
     * 根据页码查询记录
     * @param {number} pagenum 多少页
     */
    async getListBy() {
        // 判断参数
        let pagenum = 0;
        if (this.ctx.request.query && this.ctx.request.query.pagenum) {
            pagenum = parseInt(this.ctx.request.query.pagenum) - 1;
        }
        
        this.ctx.request.query.pagenum ? this.ctx.request.query.pagenum : 0; // 查询多少页

        let countall = await this.ctx.service.english.countall(); // 查询一共有多少条记录;
        let result = await this.ctx.service.english.getByPageNum(pagenum); // 根据页码查询多少条记录;

        this.ctx.body = consequencer.success({
            count: countall,
            list: result,
        });
    }
}

module.exports = HomeController;
