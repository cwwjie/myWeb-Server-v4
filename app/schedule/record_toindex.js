/**
 * 将记录表转换为索引表
 */
module.exports = {
    schedule: {
        cron: '0 0 3 * * *', // 每天三点执行
        // cron: '*/5 * * * * *',
        type: 'all', // 指定所有的 worker 都需要执行
    },
    async task(ctx) {
        ctx.service.record.indexConverter();
    },
};
