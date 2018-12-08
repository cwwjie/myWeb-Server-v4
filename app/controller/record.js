const Controller = require('egg').Controller;

const consequencer = require('./../utils/consequencer');

class RecordController extends Controller {

    async index() { // 测试入口
        this.ctx.body = 'Hello ~~~ Welcome to Rejiejay server side and your place in record.';
    }

    /**
     * 随机查询一条记录
     */
    async getOneByRandom() {
        this.ctx.body = await this.ctx.service.record.getByRandom(1);
    }

    /**
     * 随机查询10条记录
     */
    async getByRandom() {
        this.ctx.body = await this.ctx.service.record.getByRandom(10);
    }

    /**
     * 根据Id 查询一条记录
     */
    async getOneById() {
        
        // 判断 是否存在 id 并且是否合法
        if (!this.ctx.request.query || !this.ctx.request.query.id || !/^\d+$/.test(this.ctx.request.query.id) /** 这个正则是判断整数 */) {
            return this.ctx.body = consequencer.error('id is error');
        }

        // id 合法 直接查询即可
        this.ctx.body = await this.ctx.service.record.getOneById(this.ctx.request.query.id);
    }

    /**
     * 根据页码查询 10条记录
     * @param {number} pagenum 多少页 非必填
     */
    async getListBy() {
        // 因为页码是可以不传值的
        let pagenum = 0; // 页数
        if (this.ctx.request.query && this.ctx.request.query.pagenum) {
            pagenum = parseInt(this.ctx.request.query.pagenum) - 1; // 
        }

        this.ctx.request.query.pagenum ? this.ctx.request.query.pagenum : 0; // 查询多少页

        let countall = await this.ctx.service.record.countall(); // 查询一共有多少条记录;
        let result = await this.ctx.service.record.getByPageNum(pagenum); // 根据页码查询多少条记录;

        this.ctx.body = consequencer.success({
            pageTotal: Math.ceil(countall / 10), // 一共有多少个页面
            list: result,
        });
    }

    /**
     * 保存一条记录
     * @param {object} payload {
     *   title: string, 标题
     *   content: string, 内容
     * }
     */
    async save() {
        const payload = this.ctx.request.body;

        // 判断一些必填项目
        if (!payload || !payload.title || !payload.content || typeof payload.title !== 'string' || typeof payload.content !== 'string') {
            return this.ctx.body = consequencer.error('payload is error');
        }

        // 验证请求
        let myVerify = await this.ctx.service.user.validatingPayload();
        if (myVerify.result !== 1) {
            return this.ctx.body = myVerify;
        }

        this.ctx.body = await this.ctx.service.record.save(payload.title, payload.content);
    }

    /**
     * 保存一条记录
     * @param {object} payload {
     *   title: string, 标题
     *   content: string, 内容
     * }
     */
    async edit() {
        const payload = this.ctx.request.body;

        // 判断一些必填项目
        if ( !payload || !payload.id || !payload.title || !payload.content || typeof payload.id !== 'number' || typeof payload.title !== 'string' || typeof payload.content !== 'string') {
            return this.ctx.body = consequencer.error('payload is error');
        }

        // 验证请求
        let myVerify = await this.ctx.service.user.validatingPayload();
        if (myVerify.result !== 1) {
            return this.ctx.body = myVerify;
        }

        this.ctx.body = await this.ctx.service.record.edit(payload.id, payload.title, payload.content);
    }

    /**
     * 删除一条记录
     * @param {number} id 记录的唯一标识 
     */
    async delete() {
        const payload = this.ctx.request.body;

        // 判断一些必填项目
        if (!payload || !payload.id || typeof payload.id !== 'number' ) {
            return this.ctx.body = consequencer.error('payload is error');
        }

        // 验证请求
        let myVerify = await this.ctx.service.user.validatingPayload();
        if (myVerify.result !== 1) {
            return this.ctx.body = myVerify;
        }

        this.ctx.body = await this.ctx.service.record.delete(payload.id);
    }
}

module.exports = RecordController;
