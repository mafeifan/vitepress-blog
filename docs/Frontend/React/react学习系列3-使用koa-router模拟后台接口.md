当用create-react-app创建好项目，启动后会自动打开 localhost:3000。
我们希望当访问 localhost:3000/api/todo 会向后台发起一个请求，拿到我们想要的 json 数据。并渲染到前台。
这样的话需要先创建一个后台服务器。我们使用NodeJS的 express 或 koa 服务器框架。下面以 koa 为例。

实现方法如下：
1. 安装koa和koa-router。注意我的当前版本是最新的 koa2.3.0 和 koa-router7.2.1
`yarn add koa koa-router`

2. 项目根目录创建一个mock目录，并新建一个server.js
内容如下：

```javascript
var Koa = require('koa');
var Router = require('koa-router');

var app = new Koa();
var router = new Router();

router.get('/', function (ctx, next) {
  console.log('say');
  ctx.body = 'hello koa !'
});

// 加前缀
router.prefix('/api');

// 模拟json数据
var todo = require('./todo.js')
router.get('/todos', function (ctx, next) {
  console.log('--todo--')
  ctx.body = todo
});

// 开始服务并生成路由
app.use(router.routes())
   .use(router.allowedMethods());
app.listen(4000);
```

todo.js
```
module.exports = [
    {
        title: 'title1',
    },
    {
        title: 'title2',
    }
]
```

2. package.json 添加代理信息
`"proxy": "http://localhost:4000",`
这样当我们在create-react-app的代码里调用`fetch('api/todos')` 会被代理执行`http://localhost:4000/api/todos`
并且在 script 节点下添加
`"mock": "node ./mock/server.js"`
这样执行 `yarn mock` 就启动了这个后台服务

3. 在 react 中比如入口的 index.js 中添加测试代码。
我们使用 [fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API) ，发起客户端请求。
```
fetch('/api/todos')
  .then(res => res.json())
  .then(res => {
    console.log(res)
  })
```

参考：
* https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#proxying-api-requests-in-development
* https://github.com/alexmingoia/koa-router/tree/v7.2.1
* https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API
