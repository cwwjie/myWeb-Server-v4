// 框架类
const path = require('path');
const Controller = require('egg').Controller;
// 组件类
const consequencer = require(path.relative(__dirname, './app/utils/consequencer'));

class HomeController extends Controller {
    async index() {
        this.ctx.body = 'Hello ~~~ Welcome to Rejiejay server side and your place in 【english】.';
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
            count: countall, // 一共有多少条数据
            pageTotal: Math.ceil(countall / 10), // 一共有多少个页面
            list: result,
        });
    }

    /**
     * 随机查询16条记录
     */
    async getByRandom() {
        let myCount = this.ctx.request.query.count ? this.ctx.request.query.count : null;
        
        let result = await this.ctx.service.english.getByRandom(myCount);
        this.ctx.body = consequencer.success(result);
    }

    /**
     * 根据 id 查询一条记录
     */
    async getOneById() {
        // 判断 是否存在 id 并且是否合法
        if (!this.ctx.request.query || !this.ctx.request.query.id || !/^\d+$/.test(this.ctx.request.query.id) /** 这个正则是判断整数 */) {
            return this.ctx.body = consequencer.error('id is error');
        }

        // id 合法 直接查询即可
        this.ctx.body = await this.ctx.service.english.getOneById(this.ctx.request.query.id);
    }

    /**
     * 新增一条数据
     * @param {string} en_text 英文
     * @param {string} zh_text 中文
     */
    async add() {
        const payload = this.ctx.request.body;

        /**
         * 判断参数
         */
        if (!payload || !payload.en_text || !payload.zh_text || typeof payload.en_text !== 'string' || typeof payload.zh_text !== 'string') {
            return this.ctx.body = consequencer.error('payload is error');
        }

        /**
         * 验证权限(是否登录)
         */
        let myVerify = await this.ctx.service.user.validatingPayload();
        if (myVerify.result !== 1) {
          return this.ctx.body = myVerify;
        }

        /**
         * 执行数据插入
         */
        this.ctx.body = await this.ctx.service.english.save(payload.en_text, payload.zh_text);
    }

    /**
     * 修改一条记录
     * @param {string} id 唯一标识
     * @param {string} en_text 英文
     * @param {string} zh_text 中文
     */
    async edit() {
        const payload = this.ctx.request.body;

        /**
         * 判断参数
         */
        if (!payload || !payload.id || !payload.en_text || !payload.zh_text || typeof payload.id !== 'number' || typeof payload.en_text !== 'string' || typeof payload.zh_text !== 'string') {
            return this.ctx.body = consequencer.error('payload is error');
        }

        /**
         * 验证权限(是否登录)
         */
        let myVerify = await this.ctx.service.user.validatingPayload();
        if (myVerify.result !== 1) {
          return this.ctx.body = myVerify;
        }

        /**
         * 执行数据插入
         */
        this.ctx.body = await this.ctx.service.english.edit(payload.id, payload.en_text, payload.zh_text);
    }

    /**
     * 删除一条记录
     * @param {string} id 唯一标识
     * @param {string} en_text 英文
     * @param {string} zh_text 中文
     */
    async del() {
        const payload = this.ctx.request.body;

        /**
         * 判断参数
         */
        if (!payload || !payload.id || typeof payload.id !== 'number') {
            return this.ctx.body = consequencer.error('payload is error');
        }

        /**
         * 验证权限(是否登录)
         */
        let myVerify = await this.ctx.service.user.validatingPayload();
        if (myVerify.result !== 1) {
          return this.ctx.body = myVerify;
        }

        /**
         * 执行数据删除
         */
        this.ctx.body = await this.ctx.service.english.del(payload.id);
    }
}

module.exports = HomeController;
