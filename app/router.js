module.exports = app => {
    const { router, controller } = app;

    // 返回的路由最好都是小写不要驼峰命名
    router.get('/', controller.home.index); // 首页部分
    router.post('/', controller.home.index); // 首页部分
    
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
    router.get('/english/get/id', controller.english.getOneById); // 根据Id 查询一条记录
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
    router.get('/weixin/get/jssdkconfig', controller.weixin.getWxConfig); // 获取公众号用于调用微信JS接口的权限验证配置信息

    // 百度
    router.get('/baidu', controller.baidu.index); // 测试
    router.get('/baidu/text2audio/token', controller.baidu.getText2audioAccessToken); // 获取 百度音频的应用程序编程接口凭证

    // github
    router.get('/github', controller.github.index); // 提供测试接口
    router.get('/github/get/graphsvg', controller.github.getRejiejayGithubGraphSvg); // 爬取 rejiejay 页面

    // 有道云笔记
    router.get('/youdao', controller.youdao.index); // 提供测试接口

    // 微软
    router.get('/microsoft', controller.microsoft.index); // 【测试】
    router.get('/microsoft/authorize', controller.microsoft.authorize); // 【code】获取令牌
    router.post('/microsoft/token', controller.microsoft.getToken); // 【token】 
    router.get('/microsoft/authorize/storage', controller.microsoft.storageAuthorizeParam); // 【授权暂存】 暂存授权令牌要使用到的数据
    router.get('/microsoft/pages/status', controller.microsoft.getStoragePagesStatus); // 【状态】 查看缓存所有页面的状态
    router.post('/microsoft/pages/storage', controller.microsoft.storageIteratorPages); // 【页面】 缓存所有页面
    router.get('/microsoft/pages/get/random', controller.microsoft.getNotebookByParentSectionId); // 【页面】 根据分区id随机查询 OneNote notebook 
};
