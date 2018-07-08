module.exports = app => {
    const { router, controller } = app;

    // 返回的路由最好都是小写不要驼峰命名
    router.get('/', controller.home.index); // 首页部分

    router.get('/dynamic', controller.dynamic.index); // 动态部分
    router.get('/dynamic/get/list', controller.dynamic.getByList); // 返回所有的动态记录 根据列表的形式
    router.get('/dynamic/get/listandgroup', controller.dynamic.getByListAndGroup); // 返回所有的动态记录 根据列表与分组的形式

    // 记录
    router.get('/record/', controller.record.index); // 测试
    router.post('/record/save', controller.record.save); // 保存一条记录

    // 微信
    router.get('/weixin', controller.weixin.index); // 测试
    router.get('/weixin/handle', controller.weixin.handle); // 微信验证开发者服务器
    router.get('/weixin/get/global_access_token', controller.weixin.getGlobalAccess_token); // 获取公众号的全局唯一接口调用凭据
};
