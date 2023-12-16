## 每次发送邮件自动记录日志

根据[文档说明](https://learnku.com/docs/laravel/6.x/mail/5165#events)

Laravel 在处理邮件消息发送时触发两个事件。`MessageSending` 事件在消息发送前触发，`MessageSent` 事件则在消息发送后触发。
切记，这些事件是在邮件被 发送 时触发，而不是在队列化的时候。可以在 `EventServiceProvider` 中注册此事件的侦听器：


希望实现：每当邮件发送出去，就将一些基本信息(邮件发件人，收件人，邮件标题等)记录到相关的日志文件中，

1. 打开 ` App\Providers\EventServiceProvider`

修改
```php
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],

        'Illuminate\Mail\Events\MessageSent' => [
            'App\Listeners\EmailLogSentMessage',
        ],
    ];
```

2. 执行 `php artisan make:listener EmailLogSentMessage`

3. 打开新创建的 `App\Listeners\EmailLogSentMessage`

4. 修改handle方法

```php
    public function handle($event)
    {
        // 这里只打印了邮件头信息，邮件内容比较长，就不让输出了
        \Log::channel('emailSend')->info($event->message->getHeaders());
    }
```

5. 这里需要打开 `config\logging`， channels 下面添加一节
意思我希望输出日志，按天轮回，并且指定了输出日志的路径和文件名

```php
'channels' => [
        'stack' ...
        
        'emailSend' => [
            'driver' => 'daily',
            'path' => storage_path('logs/emailSend.log'),
            'level' => 'info',
            'days' => 14,
        ],
        
        ...
```

## 每次发送邮件把日志记录到数据库中

机制一样，根据MessageSending事件搞事情，直接安装这个[laravel-email-database-log](https://github.com/shvetsgroup/laravel-email-database-log)即可
