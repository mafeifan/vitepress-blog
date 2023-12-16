传统中发送邮件是同步执行的，这样用户体验很不好，页面会停留几秒钟。因为需要等邮件发送的返回响应

`Mail::to('mafeifan@qq.com')->send(new TestQueue());`

TestQueue是邮件内容，用 `php artisan make:mail TestQueue` 生成

这时候可以改为队列执行。需要配置队列驱动

如果需要使用数据库驱动，要执行

```php
php artisan queue:table
php artisan migrate
```

如果是redis，安装redis即可

把邮件放到队列中非常简单 `Mail::to('mafeifan@qq.com')->queue(new TestQueue());`

这里我们编辑`.env`将`QUEUE_CONNECTION`队列驱动从`sync`同步改为`redis`

为了监控队列的执行情况，比如成功几个，失败几个，情况如何，可以安装Horizon 队列管理工具

```php
composer require laravel/horizon
php artisan horizon:install
php artisan queue:failed-table
php artisan migrate
# 运行 horizon
php artisan horizon
```


![](https://pek3b.qingstor.com/hexo-blog/hexo-blog/20210124204443.png)

