上面的例子中我们创建的channel频道是公有的，任何人都可以监听。

现实中，私有频道会更常见


1. 服务端修改频道类型有私有

app/Events/TaskEvent.php
```
    public function broadcastOn()
    {
        // return new Channel('task-event');
        return new PrivateChannel('task-event');
    }
```


2. 相应的客户端也要改

resources/js/components/ExampleComponent.vue

```vue
    mounted() {
        let that = this;
        Echo.private('task-event')
            .listen('TaskEvent', (e) => {
                console.log(e);
                that.items.push(e)
            });
    }
```

刷新浏览器发现多出一个请求

`http://demo.lara.test/broadcasting/auth` 并且返回403 Forbidden

也就是说，客户端接收频道消息要授权

怎么判断授权是否成功？我们打开
routes/channels.php
```
Broadcast::channel('task-event', function ($user) {
    // 在这里可以做复杂的权限判断
    return $user->id;
});

/*
// 注意传参
Broadcast::channel('task-event/{id}', function ($user, $id) {
    // 在这里可以做复杂的权限判断
    return $user->id;
});
*/
```
