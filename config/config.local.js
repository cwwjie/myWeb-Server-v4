module.exports = {
    cluster: {
        listen: {
            hostname: '0.0.0.0',
            port: 1938,
        }
    },

    // 有道云笔记
    youdao: {
        origin: 'https://notesandbox.youdao.com', // 请求源
    },

    // 这个不知道是哪个公众号的，暂时放置在这里吧
    // weixin: {
    //     appID: 'wx34ce4f0ce6eadb39',
    //     appsecret: '317b46c976749223abf57213fce07b0f'
    // },

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

    security: { // 解决跨域问题
        csrf: {
            enable: false,
            ignoreJSON: true
        },
        domainWhiteList: '*',
    },

    cors: { // 解决跨域问题
        origin: '*',
        allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH'
    }
};
