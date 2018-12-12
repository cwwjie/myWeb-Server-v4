module.exports = app => {
    const { router, controller } = app;

    // 返回的路由最好都是小写不要驼峰命名
    router.get('/', controller.home.index); // 首页部分
    router.post('/', controller.home.index); // 首页部分

    router.get('/dynamic', controller.dynamic.index); // 动态部分
    router.get('/dynamic/get/list', controller.dynamic.getByList); // 返回所有的动态记录 根据列表的形式
    router.get('/dynamic/get/listandgroup', controller.dynamic.getByListAndGroup); // 返回所有的动态记录 根据列表与分组的形式

    // 记录
    router.get('/record/', controller.record.index); // 测试
    router.get('/record/get/one', controller.record.getOneByRandom); // 随机查询一条记录
    router.get('/record/get/id', controller.record.getOneById); // 根据Id 查询一条记录
    router.get('/record/get/list', controller.record.getListBy); // 根据页码查询记录
    router.get('/record/get/random', controller.record.getByRandom); // 随机查10条数据
    router.post('/record/save', controller.record.save); // 保存一条记录
    router.post('/record/edit', controller.record.edit); // 编辑一条记录
    router.post('/record/delete', controller.record.delete); // 删除一条记录
    
    // 英语
    router.get('/english/', controller.english.index); // 提供 路由 测试
    router.get('/english/get/list', controller.english.getListBy); // 根据页码查询记录
    router.get('/english/get/random', controller.english.getByRandom); // 随机查询17条数据
    router.post('/english/add', controller.english.add); // 新增一条记录
    router.post('/english/edit', controller.english.edit); // 编辑一条记录
    router.post('/english/del', controller.english.del); // 删除一条记录

    // 登录
    router.get('/user', controller.user.index); // 测试
    router.get('/user/login', controller.user.login); // 获取登录token

    // 微信
    router.get('/weixin', controller.weixin.index); // 测试
    router.get('/weixin/handle', controller.weixin.responseHandle); // 微信验证开发者服务器
    router.post('/weixin/handle', controller.weixin.messageHandle); // 文本消息
    // 只有在本地测试的时候，这个几个API才进行监听
    // if (app.config.env === 'local') {
        router.get('/weixin/get/global_access_token', controller.weixin.getGlobalAccess_token); // 获取公众号的全局唯一接口调用凭据
        router.get('/weixin/get/jsapi_ticket', controller.weixin.getJsApi_ticket); // 获取公众号用于调用微信JS接口的临时票据
    // }

    // 百度
    router.get('/baidu', controller.baidu.index); // 测试
    router.get('/baidu/text2audio/token', controller.baidu.getText2audioAccessToken); // 获取 百度音频的应用程序编程接口凭证
};
