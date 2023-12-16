参考：https://learnku.com/articles/18107

在使用链式操作的时候，例如：

`return $user->avatar->url`;

如果 `$user->avatar` 为 null，就会引起 `(E_ERROR) Trying to get property 'url' of non-object` 错误。

这个是非常常见的错误，下面介绍几种解决的方法：

1. 常规方法：使用 isset:

`if(isset($user->avatar->url)) return $user->avatar->url; else return 'defaultUrl';`

2. PHP7 可以使用 ?? (NULL 合并操作符) :

`return $user->avatar->url ?? 'not exist avatar'`

3. Laravel 5.5 及以上可以使用 optional 辅助函数:

[详见](https://learnku.com/docs/laravel/5.7/helpers/1320#method-optional)

optional 函数可以接受任何参数，并且允许你访问该对象的属性或者调用方法。如果给定的对象是 null ， 那么属性和方法会简单地返回 null 而不是产生一个错误：

```php
return optional($user->address)->street;

{!! old('name', optional($user)->name) !!}
```

Laravel 5.7 中，optional 函数还可以接受 匿名函数 作为第二个参数：

```php
/**
 * 如果第一个参数不为 null, 则调用闭包
 * 详见 https://laravel\com/docs/5.7/helpers#method-optional
 */
return optional(User::find($id), function ($user) {
    return new DummyUser;
});
```
4. 使用 object_get 辅助函数

`return object_get($user->avatar, 'url', 'default');`

这个函数原意是用来已 . 语法来获取对象中的属性，例如：

`return object_get($user, 'avatar.url', 'default');`

```php
if (! function_exists('data_get')) {
    /**
     * Get an item from an array or object using "dot" notation.
     *
     * @param  mixed   $target
     * @param  string|array  $key
     * @param  mixed   $default
     * @return mixed
     */
    function data_get($target, $key, $default = null)
    {
        if (is_null($key)) {
            return $target;
        }
        $key = is_array($key) ? $key : explode('.', $key);
        while (! is_null($segment = array_shift($key))) {
            if ($segment === '*') {
                if ($target instanceof Collection) {
                    $target = $target->all();
                } elseif (! is_array($target)) {
                    return value($default);
                }
                $result = [];
                foreach ($target as $item) {
                    $result[] = data_get($item, $key);
                }
                return in_array('*', $key) ? Arr::collapse($result) : $result;
            }
            if (Arr::accessible($target) && Arr::exists($target, $segment)) {
                $target = $target[$segment];
            } elseif (is_object($target) && isset($target->{$segment})) {
                $target = $target->{$segment};
            } else {
                return value($default);
            }
        }
        return $target;
    }
}
```

5. 使用 data_get 辅助函数，这个函数可以非常方便的从数组或对象中取数据

[源码](https://github.com/laravel/framework/blob/ba6e666dc7c5ed84213472387fe0851f625d131a/src/Illuminate/Support/helpers.php#L128)

`return data_get($user, 'avatar.url', 'default');`  或

`return data_get($user, ['avatar', 'url'], 'default');`

```php
if (! function_exists('data_get')) {
    /**
     * Get an item from an array or object using "dot" notation.
     *
     * @param  mixed   $target
     * @param  string|array|int  $key
     * @param  mixed   $default
     * @return mixed
     */
    function data_get($target, $key, $default = null)
    {
        if (is_null($key)) {
            return $target;
        }
        $key = is_array($key) ? $key : explode('.', $key);
        while (! is_null($segment = array_shift($key))) {
            if ($segment === '*') {
                if ($target instanceof Collection) {
                    $target = $target->all();
                } elseif (! is_array($target)) {
                    return value($default);
                }
                $result = [];
                foreach ($target as $item) {
                    $result[] = data_get($item, $key);
                }
                return in_array('*', $key) ? Arr::collapse($result) : $result;
            }
            if (Arr::accessible($target) && Arr::exists($target, $segment)) {
                $target = $target[$segment];
            } elseif (is_object($target) && isset($target->{$segment})) {
                $target = $target->{$segment};
            } else {
                return value($default);
            }
        }
        return $target;
    }
}
```
