module.exports = {
  schedule: {
    cron: '0 0 2 * * *', // 每天两点执行
    // cron: '*/5 * * * * *',
    type: 'all', // 指定所有的 worker 都需要执行
  },
  async task(ctx) {
    ctx.service.user.clearPassword();
  },
};
