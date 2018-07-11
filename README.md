# rejiejayserverside

jiejay web side server

## 快速入门

<!-- 在此次添加使用文档 -->

如需进一步了解，参见 [egg 文档][egg]。

### 本地开发

```bash
$ npm i
$ npm run dev
$ open http://localhost:7001/
```

### 部署

```bash
$ npm start
$ npm stop
```

### 单元测试

- [egg-bin] 内置了 [mocha], [thunk-mocha], [power-assert], [istanbul] 等框架，让你可以专注于写单元测试，无需理会配套工具。
- 断言库非常推荐使用 [power-assert]。
- 具体参见 [egg 文档 - 单元测试](https://eggjs.org/zh-cn/core/unittest)。

### 内置指令

- 使用 `npm run lint` 来做代码风格检查。
- 使用 `npm test` 来执行单元测试。
- 使用 `npm run autod` 来自动检测依赖更新，详细参见 [autod](https://www.npmjs.com/package/autod) 。


### 记录文档
- 开发环境
    - app.config.env = local;
    - this.ctx.app.env = local;
    - process.env.NODE_ENV = development;
- 生产环境
    - app.config.env = prod;
    - this.ctx.app.env = prod;
    - process.env.NODE_ENV = production;

- 项目初始化
    - 删除 logs run package-lock.json 文件夹

- SQL语法
    - app.mysql.query('update posts set hits = (hits + ?) where id = ?', [1, postId]);

> [egg]: https://eggjs.org
