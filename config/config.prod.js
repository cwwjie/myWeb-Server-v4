module.exports = {
    cluster: {
        listen: {
            port: 1938,
        }
    },

    weixin: {
        appID: 'wx06f92cb00a7f9670',
        appsecret: '01dcd0b3250d904eb1ea509f1cc9fcad'
    },

    mysql: {
        app: true,    // 是否加载到 app 上，默认开启
        agent: false, // 是否加载到 agent 上，默认关闭
        client: {     // 单数据库信息配置
            host: '127.0.0.1',     // host
            port: '3306',          // 端口号
            user: 'rejiejay',      // 用户名
            password: 'Qq_1938167_o0O', // 密码
            database: 'myweb',  // 数据库名
        },
    },
};
