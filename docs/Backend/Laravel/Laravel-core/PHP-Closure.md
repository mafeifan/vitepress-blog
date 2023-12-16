最近在看laravel底层代码时, 发现代码中有很多原生PHP的`Closure::bind`用法
下面循序渐进的的解释下：

跟JS一样，PHP中我们可以直接定义一个函数
```php
$say = function(){
	return '我是匿名函数'. "\n";
};

echo $say();
```

闭包也可以当做参数传入到其他函数中

```php
function test(Closure $callback){
	return $callback();
}

echo test($say);
```

在类中，我们无法直接访问一个私有属性

```php
class Person {
    private $name = 'finley';
    private static $age = '18';
}

$p = new Person();

// 报错: Error: Cannot access private property Person::$name
$p->name;

// 报错: Error: Cannot access private property Person::$age
$p::$age;
```

如果把private类型改为public才可以

::: tip
在不改变访问类型的情况下可以通过`Closure::bind`访问类的私有属性！
:::

```php
// 首先定义一个匿名函数。注意里面的$this，这时还不知道他代表哪个对象
$getName = function() {
	return $this->name;
};

// Closure::bind 
// 第一个参数传匿名函数
// 第二参数传绑定到匿名函数的对象
// 第三个参数传绑定给闭包的类作用域(如果需要访问的属性，如name是公有的，可以不传第三个参数)
// Closure::bind 返回一个全新的匿名的函数
$t1 = Closure::bind($getName, new Person(), 'Person');

// Finley
echo $t1();

$getAge = function() {
	return Person::$age;
};

// 对于静态属性，因为Person::$age属于正常使用，第二个参数可以写null，当然写new Person也不会报错
$t2 = Closure::bind($getAge, null, 'Person');

echo $t2();
```

## 总结

总结：
1、一般匿名函数中有$this->name类似这样用 $this访问属性方式时，你在使用bind绑定时 ，第二个参数肯定要写，写出你绑定那个对象实例，第三个参数要不要呢，要看你访问的这个属性，在绑定对象中的权限属性，如果是private，protected 你要使用第三个参数 使其变为公有属性, 如果本来就是公有，你可以省略，也可以不省略
2、一般匿名函数中是  类名::静态属性  类似这样的访问方式(比如例子中A::$age)，你在使用bind绑定时，第二个参数可以写null,也可以写出具体的对象实例，一般写null就行(写了具体对象实例多此一举)，第三个参数写不写还是得看你访问的这个静态属性的权限是 private 还是 public,如果是私有private或受保护protected的，你就得第三个参数必须写，才能使其权限变为公有属性 正常访问，如果本来就是公有public可以不用写，可以省略
