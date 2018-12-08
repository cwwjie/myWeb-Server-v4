/**
 * 清空密码
 */
module.exports = {
    schedule: {
        // https://tool.lu/crontab/
        cron: '0 1 * * 7', // 每周星期天凌晨1点实行一次
        type: 'all', // 指定所有的 worker 都需要执行
    },

    async task(ctx) {
        ctx.service.user.clearPassword();
    },
};
