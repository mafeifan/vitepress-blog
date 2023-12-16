https://pusher.com/ 是一家国外网站，提供两款产品

* Channel 提供设备间，应用间的实时通信，适用于实时图表、实时用户列表、实时地图、多人游戏和许多其他类型的UI更新。

* Beams 跨平台的消息推送，iOS, Android and web

产品特点：SDK丰富，集成快速简单，debug调试也很人性。

我们这里指[介绍Channel](https://pusher.com/docs/channels)，
先按照[官网教程](https://pusher.com/docs/channels/getting_started/javascript)来个纯JS和PHP的例子
后续会介绍结合一个全新的Laravel6.0项目如何快速引入push消息实时推送功能。

## 步骤
1. 注册一个pusher账号
2. 创建一个Channel APP
3. 获取 `app_id`，`key`，`secret`和`cluster`
4. 客户端操作，新建一个html
代码如下，主要引入了pusher.js
初始化push配置
```javascript
var pusher = new Pusher('APP_KEY', {
  cluster: 'APP_CLUSTER'
});
```
订阅频道, 频道名为'my-channel'
`var channel = pusher.subscribe('my-channel');`
监听频道发布消息事件,事件名叫做'my-event'
```javascript
channel.bind('my-event', function(data) {
  alert('An event was triggered with message: ' + data.message);
});
```

::: warning
'my-channel'和'my-event'是在后台定义的
:::


```html
<!DOCTYPE html>
<head>
  <title>Pusher Test</title>
</head>
<body>
  <h1>Pusher Test</h1>
  <p>
    Publish an event to channel <code>my-channel</code>
    with event name <code>my-event</code>; it will appear below:
  </p>
  <div id="app">
    <ul>
      <li v-for="message in messages">
        {{message}}
      </li>
    </ul>
  </div>

  <script src="https://js.pusher.com/7.0/pusher.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
  <script>
    // Enable pusher logging - don't include this in production
    Pusher.logToConsole = true;

    var pusher = new Pusher('7b7a4b68e07138fc3b11', {
      cluster: 'ap3'
    });

    var channel = pusher.subscribe('my-channel');
    channel.bind('my-event', function(data) {
      app.messages.push(JSON.stringify(data));
    });

    // Vue application
    const app = new Vue({
      el: '#app',
      data: {
        messages: [],
      },
    });
  </script>
</body>
```

5. 服务端操作，需要安装服务端包`pusher-php-server`
```php
// First, run 'composer require pusher/pusher-php-server'
require __DIR__ . '/vendor/autoload.php';
$pusher = new Pusher\Pusher("APP_KEY", "APP_SECRET", "APP_ID", array('cluster' => 'APP_CLUSTER'));
$pusher->trigger('my-channel', 'my-event', array('message' => 'hello world'));
```

6. 正常下，每运行一次后台，前台就会多一条记录。

## 参考

https://pusher.com/tutorials/collaborative-note-app-laravel
