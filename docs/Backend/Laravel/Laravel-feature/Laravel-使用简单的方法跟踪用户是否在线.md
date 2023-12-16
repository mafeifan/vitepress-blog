## 需求

系统的用户列表中添加一个绿点，表示他们是否在线。

## 方案

启动一个nodejs服务器追踪每个用户的socket连接，优点：准确，实时，缺点：麻烦

## 进一步方案

记录所有用户的上次的活动时间，只要超过一定当前时间，就判断为离线。

优点：实现简单，快速
缺点：可能需要为用户表添加字段，加重数据库负担

## 最终方案

我们不使用数据库，使用缓存。

为了保证在每个请求触发，需要创建一个middleware中间件
`php artisan make:middleware LogLastUserActivity`

内容如下：
```php
// 判断是否是有效的登录用户
if(Auth::check()) {
    // 缓存只存储5分钟
    $expiresAt = Carbon::now()->addMinutes(5);
    Cache::put('user-is-online-' . Auth::user()->id, true, $expiresAt);
}
```

关于[缓存](https://learnku.com/docs/laravel/6.x/cache/5160)

接下来，打开`app/Http/Kernel.php`,在`protected $middlewareGroups`的web中追加
` \App\Http\Middleware\LogLastUserActivity::class,`

最后，添加一个方法从缓存中读数据
在 `app/User.php` 我们添加下面的方法:
```php
public function isOnline()
{
    return Cache::has('user-is-online-' . $this->id);
}
```
这样，在页面中调用方法
```php
@if($user->isOnline())
    user is online!!
@endif
```

