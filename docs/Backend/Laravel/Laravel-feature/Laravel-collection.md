Laravel 集合是 Laravel 框架中一个十分有用的工具。

## 集合（Collection)

`Illuminate\Support\Collection`类了提供一个便捷的操作数组的封装。

集合 `Collection` 类实现了部分 PHP 和 Laravel 的接口，例如：

`ArrayAccess`- 用于操作数组对象的接口。
`IteratorAggregate`- 用于创建外部迭代器的接口。
`JsonSerializable`

## 创建一个新的集合
一个集合可以使用collect()帮助函数基于一个数组被创建或者直接通过`Illuminate\Support\Collection`类实例化。

一个非常简单的使用collect()帮助函数的示例：

$newCollection = collect([1, 2, 3, 4, 5]);
dd($newCollection);

## Eloquent ORM 集合
Eloquent ORM 的调用会以集合的形式返回数据
```php
/**
 * 从用户表获取用户列表
 */
public function getUsers()
{
    $users = User::all();
    dd($users);
}
```
该控制器方法会返回一个如下显示的所有用户的 Laravel 集合。

你可以通过箭头符号便捷的访问集合属性。至于实例，想要获取 $users 集合的第一个用户的名字，我们可以这样做。

```php    
/**
*  获取第一个用户的名字
*/
public function firstUser()
{
   $user = User::first();
   dd($user->name);
}
```

## 实例1
有如下订单数组，要求按日期分组计算出总价
```php
$orders = [
	[
		'id'    => 1,
		'price' => 9.8,
		'qty'   => 2,
		'date'  => '2018-10-10'
	],
	[
		'id'    => 2,
		'price' => 3.8,
		'qty'   => 1,
		'date'  => '2018-10-10'
	],
	[
		'id'    => 3,
		'price' => 5.0,
		'qty'   => 2,
		'date'  => '2018-10-11'
	]
];
```

期望结果:
```php
 ["2018-10-10"]=> float(23.4) ["2018-10-11"]=> float(10)
```

过程：
```php
$result = collect($orders)->groupBy('date')->map(function ($item) {
    return $item->sum(function ($item) {
                return $item['price'] * $item['qty'];
            }
        );
    }
);

dd($result->all());

```

## 实例2
使用tap调试集合
有时候我们希望在某集合处理过程中查看结果，这时可以使用tap
```php
$items = [
    ['name' => 'David Charleston', 'member' => 1, 'active' => 1],
    ['name' => 'Blain Charleston', 'member' => 0, 'active' => 0],
    ['name' => 'Megan Tarash', 'member' => 1, 'active' => 1],
    ['name' => 'Jonathan Phaedrus', 'member' => 1, 'active' => 1],
    ['name' => 'Paul Jackson', 'member' => 0, 'active' => 1]
];

return collect($items)
    ->where('active', 1)
    ->tap(function($collection){
        // 输出  David Charleston, Megan Tarash, Jonathan Phaedrus, Paul Jackson 
        return var_dump($collection->pluck('name'));
    })
    ->where('member', 1)
    ->tap(function($collection){
        // 输出  David Charleston, Megan Tarash, Jonathan Phaedrus
        return var_dump($collection->pluck('name'));
    });
```

Tap vs Pipe

Laravel 也提供了另一个类似 `tap` 的集合操作方法 -- `pipe`，两者在集合调用上很类似，却有一个主要的区别：

通过调用 `tap` 方法不会改变原集合的结果，而 `pipe` 方法会根据返回值修改元集合的结果。示例如下：

```php
return collect($items)
    ->where('active', 1)
    ->pipe(function ($collection) {
        return $collection->push(['name' => 'John Doe']);
    });
// David Charleston, Megan Tarash, Jonathan Phaedrus, Paul Jackson, John Doe
```

## 实例3
常用技巧
使用map添加新属性

```php
$items = [
    ['name' => 'Finley Ma', 'age' => 18],
    ['name' => 'Jack Zhang', 'age' => 28],
];

$result = collect($items)
    ->map(function ($item, $key) {
       // 根据name追加一个firstName属性
       $item['firstName'] = explode(' ',$item['name'])[1];
       return $item;
    })
    // 指定数组的key为age，value为firstName
    ->pluck('firstName', 'age')
    ->all();

// [['18' => 'Ma'], ['28' => 'Zhang']]
dd($result);
```


## 参考
* [教程：Laravel 集合（Collection）的基础用法](https://learnku.com/laravel/t/26110)
* [官方文档](https://learnku.com/docs/laravel/6.x/collections/5161)
* [Laravel 集合类中 GroupBy 方法的使用技巧](https://learnku.com/laravel/t/8713/the-use-of-the-groupby-method-in-the-laravel-collection-class)
