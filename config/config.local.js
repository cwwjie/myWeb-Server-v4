module.exports = {
    cluster: {
        listen: {
            hostname: '0.0.0.0',
            port: 1938,
        }
    },

    weixin: {
        appID: 'wx34ce4f0ce6eadb39',
        appsecret: '317b46c976749223abf57213fce07b0f'
    },

    mysql: {
        app: true,    // 是否加载到 app 上，默认开启
        agent: false, // 是否加载到 agent 上，默认关闭
        client: {     // 单数据库信息配置
            host: '127.0.0.1',     // host
            port: '3306',          // 端口号
            user: 'Rejiejay',      // 用户名
            password: 'QQ1938167', // 密码
            database: 'rejiejay',  // 数据库名
        },
    },

    security: { // 跨域请求
        domainWhiteList: [ 'http://localhost' ],
    }
};
