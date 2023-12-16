版本:6.0

打开根目录的`public/index.php`

```php
// 定义常量，记录laravel框架启动时候的时间
define('LARAVEL_START', microtime(true));

// 加载composer包
require __DIR__.'/../vendor/autoload.php';

// 引导应用对象,返回真正的应用对象
// 这个比较重要，后续会更有详细的介绍
$app = require_once __DIR__.'/../bootstrap/app.php';

// 获取内核对象
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

// 处理请求，返回响应对象
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

// 发送响应到浏览器
$response->send();

// 终止此次请求
$kernel->terminate($request, $response);
```
