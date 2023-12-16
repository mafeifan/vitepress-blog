## 问题1  为什么可以直接用Facade

比如`Cache::get('key');`

Laravel 的入口文件是 public/index.php，此文件载入了 autoload.php, app.php 2个文件：

```php
require __DIR__.'/../bootstrap/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
```

顾名思义 autoload.php 实现了自动加载，app.php 和容器相关。

初始化容器的过程这里不详细解说，不是本文重点。

初始化容器后，执行了以下代码：

```php
// 得到 App\Http\Kernel 实例对象
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
 
// 执行对象handle 方法，此方法继承自 Illuminate\Foundation\Http\Kernel
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);
```

让我们去看下 handle() 做了些什么：

```php
public function handle($request)
{
    //......省略......
    $response = $this->sendRequestThroughRouter($request);
    //......省略......
}
```

sendRequestThroughRouter 方法：

```php
protected function sendRequestThroughRouter($request)
{
    //......省略......
    // 启动一些启动器，诸如异常处理，配置，日志，Facade，运行环境监测等
    $this->bootstrap();
    //......省略......
}
```

bootstrap 方法：

```php
public function bootstrap()
{
    if (! $this->app->hasBeenBootstrapped()) {
       $this->app->bootstrapWith($this->bootstrappers());
    }
}
```

$this->bootstrappers() 中返回 $this->bootstrappers 保存的数据：


```php
protected $bootstrappers = [
    'Illuminate\Foundation\Bootstrap\DetectEnvironment',
    'Illuminate\Foundation\Bootstrap\LoadConfiguration',
    'Illuminate\Foundation\Bootstrap\ConfigureLogging',
    'Illuminate\Foundation\Bootstrap\HandleExceptions',
    // 可以看到 
    'Illuminate\Foundation\Bootstrap\RegisterFacades',
    'Illuminate\Foundation\Bootstrap\RegisterProviders',
    'Illuminate\Foundation\Bootstrap\BootProviders',
];
```

`RegisterFacades`此类就是实现 Facade 的一部分，bootstrap 方法中 `$this->app->bootstrapWith` 会调用类的 bootstrap 方法：

```php
class RegisterFacades
{
    public function bootstrap(Application $app)
    {
        //......省略......
        AliasLoader::getInstance($app->make('config')->get('app.aliases'))->register();
    }
}
```

$app->make('config')->get('app.aliases') 返回的是 config/app.php 配置文件中 'aliases' 键对应的值，

我们继续往下看 AliasLoader::getInstance 方法：

```php
    /**
     * Get or create the singleton alias loader instance.
     *
     * @param  array  $aliases
     * @return \Illuminate\Foundation\AliasLoader
     */
    public static function getInstance(array $aliases = [])
    {
        if (is_null(static::$instance)) {
            return static::$instance = new static($aliases);
        }

        $aliases = array_merge(static::$instance->getAliases(), $aliases);

        static::$instance->setAliases($aliases);

        return static::$instance;
    }
```

回头再看 

`AliasLoader::getInstance($app->make('config')->get('app.aliases'))->register();`中调用了 AliasLoader->register 方法：


```php
public function register()
{
    if (!$this->registered) {
        $this->prependToLoaderStack();
        
        $this->registered = true;
    }
}
```

prependToLoaderStack 方法：

这里注册了当前对象中 load 方法为自动加载函数

```php
protected function prependToLoaderStack()
{
    spl_autoload_register([$this, 'load'], true, true);
}
```

load 方法：


```php
public function load($alias)
{
    if (isset($this->aliases[$alias])) {
        return class_alias($this->aliases[$alias], $alias);
    }
}
```


这里的 $this->aliases 即是 AliasLoader:getInstance 中实例化一个对象： new static($aliases)  时构造函数中设置的：

```php
private function __construct($aliases)
{
    $this->aliases = $aliases;

```


这里 class_alias 是实现 Facade 的核心要点之一，该函数原型：

`bool class_alias ( string $original, string $alias[, bool $autoload = TRUE ] )`

第三个参数默认为 true，意味着如果原始类（string $original）没有加载，则自动加载。
更多该函数的解释请自行翻阅手册。

## 问题2  为什么可以像静态方法一样调用任何类的方法

打开`vendor/laravel/framework/src/Illuminate/Support/Facades/Cache.php`

```php
class Cache extends Facade
{
    /**
     * Get the registered name of the component.
     *
     * @return string
     */
    protected static function getFacadeAccessor()
    {
        return 'cache';
    }
}
```

看一下 父类 Illuminate\Support\Facades，发现父类中实现了魔术方法 __callStatic：

```php
    public static function __callStatic($method, $args)
    {
        $instance = static::getFacadeRoot();

        if (! $instance) {
            throw new RuntimeException('A facade root has not been set.');
        }

        return $instance->$method(...$args);
    }
```

**谜底就是通过魔术方法去实现的。**



## 自己实现

```php
namespace Illuminate\Support\Facades {
    
    class Facades {
        public function __call($name, $params) {
            return call_user_func_array([$this, $name], $params);
        } 
        public static function __callStatic($name, $params) {
            return call_user_func_array([new static(), $name], $params);
        }  
    }
    
    class Cache extends Facades {
        protected function fn($a, $b) {
            echo "function parameters: ${a} and ${b}<br>";    
        }
        protected function static_fn($a, $b) {
            echo "static function parameters: ${a} and ${b}<br>";      
        }
    }
    
}
namespace {
    
    class Autoload {
        public $aliases;
        public function __construct($aliases = []) {
            $this->aliases = $aliases;
        }
        public function register() {
            spl_autoload_register([$this, 'load'], true, true);
            return $this;
        }
        public function load($alias) {
            if (isset($this->aliases[$alias])) {
                return class_alias($this->aliases[$alias], $alias);
            }    
        }
    }
    
    $aliases = [
        'Cache' => Illuminate\Support\Facades\Cache::class,
    ];
    $autoloader = (new Autoload($aliases))->register();
    Cache::fn(3,6);
    Cache::static_fn(4,7);
    
}
```

## 参考

https://blog.csdn.net/hizzana/article/details/53212323
