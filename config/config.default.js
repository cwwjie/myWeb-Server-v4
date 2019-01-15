module.exports = {
    keys: '~!QQ1938167@#00',
    
    email: { // 邮件配置
        service: 'QQ',
        user: '454766952@qq.com',
        pass: 'ojfwghzywucqbgie',
    },

    weixin: {
        appID: 'wx06f92cb00a7f9670',
        appsecret: '01dcd0b3250d904eb1ea509f1cc9fcad'
    },

    /**
     * 腾讯云OSS对象存储 的通用配置，不管测试还是生产都是这个配置
     */
    tencentoss: {
        origin: 'https://rejiejay-1251940173.cos.ap-guangzhou.myqcloud.com/myserver/',
        region: 'ap-guangzhou',
        bucket: 'rejiejay-1251940173',
        appId: '1251940173',
        secretId: 'AKIDZw6DLFgMZZKuFO6zSfdMr8D4j9KGmQeh',
        secretKey: 'xkIbfU4SgfT4RZVCettgEWbR2OYTBetv',
    },

    /**
     * 百度的通用配置，不管测试还是生产都是这个配置
     */
    baidu: {
        AppID: '10792466',
        APIKey: '27SGol94OgTq3mE3RiAk0od7',
        SecretKey: 'IzdrDWlkobd5j32WESEwlkiPut0RTYMo',
    },

    /**
     * microsoft 微软通用配置
     */
    microsoft: {
        appid: '1bf4ae32-0015-4bba-92ed-dd6a125e3e7c', // 应用程序 ID
        appsecret: 'avprqT3?iqTLQUOF4486|~#', // 应用程序 密匙
    },

    security: {
        csrf: false
    },
};
