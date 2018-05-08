module.exports = app => {
    const { router, controller } = app;

    router.get('/', controller.home.index); // 首页部分

    router.get('/mobile', controller.mobile.index); // 手机端

    router.get('/mobile/getdynamics', controller.mobile.getdynamics); // 手机端
};
