// 框架类
const Controller = require('egg').Controller;
const cheerio = require('cheerio');
// 自定义框架
const gettextby = require('./../utils/gettextbyhttps');

class GithubController extends Controller {
    async index() {
        this.ctx.body = 'Hello ~~~ Welcome to Rejiejay server side and your place in 【github】';
    }

    /**
     * 爬虫 抓取 github rejiejay 的页面
     */
    async spiderRejiejay() {
        // 进行页面抓取, 这个一般都是可以抓取成功的
        let rejiejayHtml = await gettextby('https://github.com/rejiejay').then(val => val);
    
        /**
         * 使用 cheerio 进行 html 解析
         */
        const $ = cheerio.load(rejiejayHtml);
        const targetHtml = $('.js-calendar-graph-svg').html();
        
        this.ctx.body = targetHtml;
    }
}

module.exports = GithubController;
