module.exports = app => {
    const { router, controller } = app;

    router.get('/', controller.home.index); // 首页部分

    router.get('/dynamic', controller.dynamic.index); // 动态部分
    router.get('/dynamic/getbylist', controller.dynamic.getbylist); // 动态
};
