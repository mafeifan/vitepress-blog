## Laravel 中的事件系统

执行 `php artisan event:generate` 会生成事件相关类文件
路径 `app/Events/Event.php`

所有事件类放在`app/Events`目录下
所有监听器放在`app/Listeners`目录下

一个事件可以包含多个监听器

打开 `app/Providers/EventServiceProvider.php`

```php
    /**
     * The event listener mappings for the application.
     *
     * @var array
     */
    protected $listen = [
        'App\Events\SomeEvent' => [
            'App\Listeners\EventListener',
        ],
    ];
```


## 项目中的运用
打开 `app/Providers/EventServiceProvider.php`
更新
```php
    protected $listen = [
        'App\Events\SkuEvents\SkuCreated' => [
            'App\Listeners\SkuListeners\RiotVerifySkuCreatedPusher',
        ],
    ]    
```

执行 `php artisan event:generate` 命令后就可以得到`SkuCreated`文件了

app/Events/SkuEvents/SkuCreated.php

```php
<?php

namespace App\Events\SkuEvents;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Queue\SerializesModels;
use Riot\Sku\Models\Sku;

class SkuCreated
{
    use InteractsWithSockets, SerializesModels;

    public $sku = null;

    /**
     * Create a new event instance.
     *
     * SkuUpdated constructor.
     * @param Sku $sku
     * @param string $type
     */
    public function __construct(Sku $sku, string $type = '')
    {
        $this->sku = $sku;
    }

}

```


我们在Controller中尝试触发事件, 即当往Sku表添加一条新记录时触发`SkuCreated`事件

Riot/Sku/Controllers/SkuController.php
```php
    public function store(CreateSkuRequest $request)
    {
        try {
            $input = $request->all();
            
            $sku = $this->repository->create($input);

            // 事件触发
            event(new SkuCreated($sku));

            return $this->sendResponse($sku, 'Sku saved successfully.');
        } catch (\Exception $e)
        {
            return $this->sendError($e->getMessage());
        }
    }
```

Listener 具体逻辑
主要是同步SKU信息
```php
<?php

namespace App\Listeners\SkuListeners;

use App\Events\SkuEvents\SkuCreated;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use App\Events\SkuEvents\SkuUpdated as SkuUpdatedEvent;
use Riot\Sku\Jobs\PushCreatedSkuInfo;

class RiotVerifySkuCreatedPusher
{
    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     *
     * @param SkuCreated $event
     * @return void
     */
    public function handle(SkuCreated $event)
    {
        $sku = $event->sku;

        dd($sku);
    }
}

```

当然为了方便，可以在路由中测试
```php
Route:get('/', function() {
    $sku = \App\Sku::find(1);
    event(new \App\Events\SkuEvents\SkuCreated($sku));
});

```

## 参考
https://www.cnblogs.com/sgm4231/p/9820794.html
