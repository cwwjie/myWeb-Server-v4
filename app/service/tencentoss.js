// 框架类
const path = require('path');
const Service = require('egg').Service;
// 组件类
const { mount } = require(path.relative(__dirname, './app/utils/OSS'));
// 配置文件类
const config = require(path.relative(__dirname, './config/config.default.js'));
const Mailer = require(path.relative(__dirname, './app/utils/Mailer'));

/**
 * 腾讯云OSS对象存储 大的文件数据存储就要用到这个
 */
class tencentossService extends Service {
    /**
     * 备份mysql的数据
     */
    async mysqldump() {
        // 因为一星期备份一次, 所以一个月内的可追溯, 上个月的直接覆盖
        let week = Math.ceil(new Date().getDate() / 7);
        week = week === 5 ? 4 : week; // 因为会有31号, 会多出 3天, 如果恰好在这3天, 覆盖到 4 即可

        /**
         * 上传 record 记录表
         */
        let UploadRecordFile = new Promise((resolve, reject) => {
            mount.sliceUploadFile(
                {
                    Bucket : config.tencentoss.bucket, /* Bucket 的名称 */
                    Region : config.tencentoss.region, /* Bucket 所在区域 */
                    Key : `myserver/mysqldump/week-${week}/record.ibd`,  /* 存储的位置 */
                    FilePath: '/var/lib/mysql/myweb/record.ibd',    /* 要上传的文件夹 */
    
                }, function(err, data) {
                    if(err) {
                        return reject(err);
                    } else {
                        resolve(data);
                    }
                }
            );
        });
        
        /**
         * 上传 english 记录表
         */
        let UploadEnglishFile = new Promise((resolve, reject) => {
            mount.sliceUploadFile(
                {
                    Bucket : config.tencentoss.bucket, /* Bucket 的名称 */
                    Region : config.tencentoss.region, /* Bucket 所在区域 */
                    Key : `myserver/mysqldump/week-${week}/english.ibd`,  /* 存储的位置 */
                    FilePath: '/var/lib/mysql/myweb/english.ibd',    /* 要上传的文件夹 */
    
                }, function(err, data) {
                    if(err) {
                        return reject(err);
                    } else {
                        resolve(data);
                    }
                }
            );
        });

        Promise.all([UploadRecordFile, UploadEnglishFile])
        .then(
            succeed => {
                Mailer('454766952@qq.com', `【成功】备份mysql week-${week}`, `备份mysql的数据成功, ${JSON.stringify(succeed)}`)
                .then(
                    succeed => succeed,
                    MailerError => console.error(`【成功】备份mysql week-${week}, 但是无法进行邮件通知${JSON.stringify(MailerError)}`),
                );
            }, error => {
                Mailer('454766952@qq.com', `【失败】备份mysql week-${week}`, `备份mysql的数据失败, 原因: ${JSON.stringify(error)}`)
                .then(
                    succeed => succeed,
                    MailerError => console.error(`【失败】备份mysql week-${week}, 原因: ${JSON.stringify(error)}, 且无法进行邮件通知${JSON.stringify(MailerError)}`),
                );
            }
        )

    }
}

module.exports = tencentossService;
