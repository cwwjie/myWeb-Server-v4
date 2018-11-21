// 框架类
const Service = require('egg').Service;
// 组件类
const consequencer = require('./../utils/consequencer');
const getjsonby = require('./../utils/getjsonbyhttps');
// 配置类
const config = require('./../../config/config.default.js');

class baiduService extends Service {
    /**
     * 向数据库查询 access_token 并且判断是否过期
     * 文档： http://ai.baidu.com/tech/speech/tts
     * 获取 Access Token： https://ai.baidu.com/docs#/TTS-API/top
     */
    async findText2audioAccessToken() {
        let checkToken = await this.ctx.app.mysql.query(`select * from baidu where id="1";`);

        if (checkToken instanceof Array === false || checkToken.length === 0) {
            return consequencer.error('数据有误');
        }

        // 默认情况下，Access Token 有效期为30天
        // 这里只需要判断是否过期就行了
        if (new Date().getTime() > checkToken[0].expire_timestamp) {
            return consequencer.error('Access Token 已经过期', 2);
        }

        // 其他情况一律返回成功
        return consequencer.success(checkToken[0].token);
    }

    /**
     * 刷新 access_token， 并且返回最新数据
     * 文档： http://ai.baidu.com/tech/speech/tts
     * 获取 Access Token： https://ai.baidu.com/docs#/TTS-API/top
     */
    async refreshText2audioAccessToken() {
        
        /**
         * 页面一进来就向百度请求获取 Access Token
         */
        let awaitAccesstoken = await getjsonby(`https://openapi.baidu.com/oauth/2.0/token?grant_type=client_credentials&client_id=${config.baidu.APIKey}&client_secret=${config.baidu.SecretKey}`)
        .then(val => {
            // 如果返回正确的标准数据是如下所示
            // val = {
            //     'access_token': '24.1a95d8b09450315ced8793bce7d1501a.2592000.1520338059.282335-10792466',
            //     'session_key': '9mzdCuU6PZyPi+3qOWUtGDCcw8QuSuGG7+CZqlBstDahHqri0CZlu1Qo2oJUNcqTcXxW5x8HNsY0WAMi0OqQbp72bzfKgA==',
            //     'scope': 'public brain_all_scope audio_voice_assistant_get audio_tts_post wise_adapt lebo_resource_base lightservice_public hetu_basic lightcms_map_poi kaidian_kaidian ApsMisTest_Test\u6743\u9650 vis-classify_flower bnstest_fasf lpq_\u5f00\u653e cop_helloScope ApsMis_fangdi_permission',
            //     'refresh_token': '25.ce346e3945bed01cad36f69bf731aeae.315360000.1833106059.282335-10792466',
            //     'session_secret': '36a3eb566919a9c9f800e20e2f0b1fe9',
            //     'expires_in': 2592000
            // }

            // 判断是否请求成功
            if (val.error) {
                // 处理错误的情况
                let errorMessage = ({
                    'invalid_request': '请求缺少某个必需参数，包含一个不支持的参数或参数值，或者格式不正确。',
                    'invalid_client': 'client_id”、“client_secret”参数无效。',
                    'invalid_grant': '提供的Access Grant是无效的、过期的或已撤销的，例如，Authorization Code无效(一个授权码只能使用一次)、Refresh Token无效、redirect_uri与获取Authorization Code时提供的不一致、Devie Code无效(一个设备授权码只能使用一次)等。',
                    'unauthorized_client': '应用没有被授权，无法使用所指定的grant_type。',
                    'unsupported_grant_type': '“grant_type”百度OAuth2.0服务不支持该参数。',
                    'invalid_scope': '请求的“scope”参数是无效的、未知的、格式不正确的、或所请求的权限范围超过了数据拥有者所授予的权限范围。',
                    'expired_token': '提供的Refresh Token已过期',
                    'redirect_uri_mismatch': '“redirect_uri”所在的根域与开发者注册应用时所填写的根域名不匹配。',
                    'unsupported_response_type': '“response_type”参数值不为百度OAuth2.0服务所支持，或者应用已经主动禁用了对应的授权模式',
                    'slow_down': 'Device Flow中，设备通过Device Code换取Access Token的接口过于频繁，两次尝试的间隔应大于5秒。',
                    'authorization_pending': 'Device Flow中，用户还没有对Device Code完成授权操作。',
                    'authorization_declined': 'Device Flow中，用户拒绝了对Device Code的授权操作。',
                    'invalid_referer': '	Implicit Grant模式中，浏览器请求的Referer与根域名绑定不匹配'
                })[val.error];

                return consequencer.error(`向百度 请求 access_token 数据返回错误, 原因: ${errorMessage}. The access_token result is error, Because ${val.error}.`);

            } else {
                return consequencer.success(val, 'get access_token successful');
            }
        });

        // 如果 向百度 请求 access_token 不成功，直接返回报错信息
        if (awaitAccesstoken.result !== 1) {
            return awaitAccesstoken;
        }

        // 这里成功获取的情况， 先保存到数据库
        let updateAccesstoken = await this.ctx.app.mysql.query(`update baidu set token="${awaitAccesstoken.data.access_token}",expire_timestamp="${new Date().getTime() + (awaitAccesstoken.data.expires_in * 1000)}" where id="1";`);

        /**
         * 判断是否保存到数据库
         */
        if (updateAccesstoken && updateAccesstoken.warningCount === 0 && updateAccesstoken.message === "") {
            return consequencer.success(awaitAccesstoken.data.access_token);
        } else {
            return consequencer.error(`向百度 请求 access_token 成功， 但是数据库SQL保存失败, 原因: ${updateAccesstoken.message}.`);
        }
    }
}

module.exports = baiduService;
