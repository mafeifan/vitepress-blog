理解Laravel中的 Macroable

计算机科学里的宏（Macro)，是一种批量处理的称谓。
比如有些重复的动作，可以打包记录为一个宏，给宏名字，调用这个宏，就等于执行这一系列动作了。

下面看下Laravel中宏的源码实现

## 源码分析
```php
<?php
trait Macroable
{
    /**
     * The registered string macros.
     *
     * @var array
     */
    protected static $macros = [];

    /**
     * Register a custom macro.
     *
     * @param  string  $name
     * @param  object|callable  $macro
     * @return void
     */
    public static function macro($name, $macro)
    {
        static::$macros[$name] = $macro;
    }

    /**
     * Mix another object into the class.
     *
     * @param  object  $mixin
     * @param  bool  $replace
     * @return void
     *
     * @throws \ReflectionException
     */
    public static function mixin($mixin, $replace = true)
    {
        // 通过反射获取该对象中所有公开和受保护的方法
        $methods = (new ReflectionClass($mixin))->getMethods(
            ReflectionMethod::IS_PUBLIC | ReflectionMethod::IS_PROTECTED
        );

        foreach ($methods as $method) {
            if ($replace || ! static::hasMacro($method->name)) {
                // 设置方法可访问，因为受保护的不能在外部调用
                $method->setAccessible(true);
                // 调用 macro 方法批量创建宏指令
                static::macro($method->name, $method->invoke($mixin));
            }
        }
    }

    /**
     * Checks if macro is registered.
     *
     * @param  string  $name
     * @return bool
     */
    public static function hasMacro($name)
    {
        return isset(static::$macros[$name]);
    }

    /**
     * Dynamically handle calls to the class.
     *
     * @param  string  $method
     * @param  array  $parameters
     * @return mixed
     *
     * @throws \BadMethodCallException
     */
    public static function __callStatic($method, $parameters)
    {
        if (! static::hasMacro($method)) {
            throw new BadMethodCallException(sprintf(
                'Method %s::%s does not exist.', static::class, $method
            ));
        }

        $macro = static::$macros[$method];

        if ($macro instanceof Closure) {
            return call_user_func_array(  ($macro, null, static::class), $parameters);
        }

        return $macro(...$parameters);
    }

    /**
     * Dynamically handle calls to the class.
     *
     * @param  string  $method
     * @param  array  $parameters
     * @return mixed
     *
     * @throws \BadMethodCallException
     */
    public function __call($method, $parameters)
    {
        if (! static::hasMacro($method)) {
            throw new BadMethodCallException(sprintf(
                'Method %s::%s does not exist.', static::class, $method
            ));
        }

        $macro = static::$macros[$method];

        if ($macro instanceof Closure) {
            return call_user_func_array($macro->bindTo($this, static::class), $parameters);
        }

        return $macro(...$parameters);
    }
}

class Father
{
    public function say()
    {
        return function () {
            echo 'say';
        };
    }

    public function show()
    {
        return function () {
            echo 'show';
        };
    }

    protected function eat()
    {
        return function () {
            echo 'eat';
        };
    }

    protected function test()
    {
         echo 'eat';
    }
}

class Child
{
    use Macroable;
}

// 批量绑定宏指令
Child::mixin(new Father);

$child = new Child;
// 输出:say
$child->say();
// 输出:show
$child->show();
// 输出:eat
$child->eat();
// 因为 Macroable 加了 __callStatic 支持静态调用
$child::eat();
// 这样调用会报错，因为test返回的不是闭包
$child->test();
```

## Laravel中使用
在Laravel中，很多类都实现了Macroable，比如下列（in Laravel5.4）
```php
Illuminate\Database\Query\Builder
Illuminate\Database\Eloquent\Builder
Illuminate\Database\Eloquent\Relations\Relation
Illuminate\Http\Request
Illuminate\Http\RedirectResponse
Illuminate\Http\UploadedFile
Illuminate\Routing\Router
Illuminate\Routing\ResponseFactory
Illuminate\Routing\UrlGenerator
Illuminate\Support\Arr
Illuminate\Support\Str
Illuminate\Support\Collection
Illuminate\Cache\Repository
Illuminate\Console\Scheduling\Event
Illuminate\Filesystem\Filesystem
Illuminate\Foundation\Testing\TestResponse
Illuminate\Translation\Translator
Illuminate\Validation\Rule
```
我们就可以这么搞
```php
use Illuminate\Support\Collection;

// 定义一个宏
Collection::macro('someMethod', function ($arg1 = 1, $arg2 = 1) {
    // count 是 collection对象内置的方法
    return $this->count() + $arg1 + $arg2;
});

// 调用宏
// 我们只是向类中添加了一个以前不存在的方法，而无需接触任何源文件。

$coll = new Collection([1, 2, 3]);
echo $coll->someMethod(1, 2);
```

使用macro往一个类中添加新方法
```php
$macroableClass = new class() {
    use Macroable;
};

$macroableClass::macro('concatenate', function(... $strings) {
   return implode('-', $strings);
};

$macroableClass->concatenate('one', 'two', 'three'); // returns 'one-two-three'
```

使用mixin方法往一个类追加多个方法
```php
$mixin = new class() {
    public function mixinMethod()
    {
       return function() {
          return 'mixinMethod';
       };
    }
    
    public function anotherMixinMethod()
    {
       return function() {
          return 'anotherMixinMethod';
       };
    }
};

$macroableClass->mixin($mixin);

$macroableClass->mixinMethod() // returns 'mixinMethod';

$macroableClass->anotherMixinMethod() // returns 'anotherMixinMethod';
```


也就是说，我们可以通过宏扩展原有的功能，看这个例子，[往Query Build中添加list方法](https://stackoverflow.com/questions/43396489/add-lists-method-in-query-builder-in-laravel-5-4)

把宏定义添加到`AppServiceProvider`文件的boot方法中，这样可以在全局使用啦
```php
Collection::macro('firstNth', function($take) {
    // 加 static 确保返回 collection 类型
    return new static(array_slice($this->item, 0, $take));
});
```

## 参考
https://asklagbox.com/blog/laravel-macros

https://learnku.com/articles/35970

https://github.com/spatie/macroable
