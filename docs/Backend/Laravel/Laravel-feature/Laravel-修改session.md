## Laravel


保存session到数据库

```php
php artisan session:table

// 生成迁移文件

Schema::create('sessions', function ($table) {
    $table->string('id')->unique();
    $table->unsignedInteger('user_id')->nullable();
    $table->string('ip_address', 45)->nullable();
    $table->text('user_agent')->nullable();
    $table->text('payload');
    $table->integer('last_activity');
});
```

```php
php artisan migrate
```

自定义字段


```php
<?php

namespace App\Extension;

use Illuminate\Support\ServiceProvider;

class CustomSessionServiceProvider extends ServiceProvider
{

    public function register()
    {
        $connection = $this->app['config']['session.connection'];
        $table = $this->app['config']['session.table'];

        $this->app['session']->extend('database', function ($app) use ($connection, $table) {
            $lifetime = $this->app->config->get('session.lifetime');
            return new \App\Extension\CustomDatabaseSessionHandler(
                $this->app['db']->connection($connection),
                $table,
                $lifetime,
                $this->app
            );
        });
    }
}

```


```php
namespace App\Extension;

use Illuminate\Contracts\Auth\Guard;
use Illuminate\Session\DatabaseSessionHandler;

class CustomDatabaseSessionHandler extends DatabaseSessionHandler
{
    public function write($sessionId, $data)
    {
        $type = Auth::currentType();

        $user_id = (Auth::type($type)->check()) ? Auth::type($type)->id() : null;

        if ($this->exists) {
            $this->getQuery()->where('id', $sessionId)->update([
                'payload' => base64_encode($data), 'last_activity' => time(), 'user_id' => $user_id, 'user_type' => $type,
            ]);
        } else {
            $this->getQuery()->insert([
                'id' => $sessionId, 'payload' => base64_encode($data), 'last_activity' => time(), 'user_id' => $user_id, 'user_type' => $type,
            ]);
        }

        $this->exists = true;
    }
}
```

## 参考

https://learnku.com/docs/laravel/6.x/session/5143#configuration

https://stackoverflow.com/questions/24280781/creating-our-own-session-handler

https://laracasts.com/discuss/channels/laravel/how-to-store-users-id-in-session-table-laravel-5
