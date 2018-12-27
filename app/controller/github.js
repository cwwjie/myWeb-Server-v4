// 框架类
const path = require('path');
const Controller = require('egg').Controller;
// 组件类
const consequencer = require(path.relative(__dirname, './app/utils/consequencer'));

class GithubController extends Controller {
    async index() {
        this.ctx.body = 'Hello ~~~ Welcome to Rejiejay server side and your place in 【github】';
    }

    /**
     * 获取 github 上面 rejiejay 动态的 svg 数据
     */
    async getRejiejayGithubGraphSvg() {
        // 获取github 里面的数据 通过 'graphSvg' 值
        let graphSvg = await this.ctx.service.github.getValueByKey('graphSvg');

        // 判断是否有值或者未过期
        if (graphSvg.result === 1) {
            // 未过期的并且有值情况下
            return this.ctx.body = graphSvg;
        }

        // 过期或者无值的情况
        // 爬虫 抓取 github rejiejay 的页面
        let rejiejayHtml = await this.ctx.service.github.spiderRejiejay();

        // 存储一次
        let saveValue = await this.ctx.service.github.saveValue('graphSvg', rejiejayHtml);

        // 判断是否 存储失败?
        if (graphSvg.result !== 1) {
            // 失败的情况下
            return this.ctx.body = saveValue;
        }
    
        // 存储成功 返回爬虫到的页面
        this.ctx.body =  consequencer.success(rejiejayHtml);

    }
}

module.exports = GithubController;
