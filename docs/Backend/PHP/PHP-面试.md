作为一名专业的PHP开发人员，一定要懂得流行的技术规范，如果连规范都不知道，怎么能保证写出规范的代码呢？

### 1. 说说 PSR规范 (PHP Standard Recommendations)
[https://learnku.com/docs/psr](https://learnku.com/docs/psr)，
比较重要的规范是[PSR-4 自动加载规范]([https://learnku.com/docs/psr/psr-4-autoloader-example/1609](https://learnku.com/docs/psr/psr-4-autoloader-example/1609)
)


### 2. new static() 和 new self() 的区别

两个都是new对象
1. 他们的区别只有在继承中才能体现出来，如果没有任何继承，那么这两者是没有区别的。
2. new self()返回的实例是万年不变的，无论谁去调用，都返回同一个类的实例，而new static()则是由调用者决定的。

```php
class Father {
    public function getNewFather() {
        return new self();
    }

    public function getNewCaller() {
        return new static();
    }
}

class Sun1 extends Father {
}

class Sun2 extends Father {
}

$sun1 = new Sun1();
$sun2 = new Sun2();

// Father
print get_class($sun1->getNewFather());
// Sun1
print get_class($sun1->getNewCaller());
// Father
print get_class($sun2->getNewFather());
// Sun2
print get_class($sun2->getNewCaller());
```

get_class()方法是用于获取实例所属的类名。

### 3.  ...可变数量

```php
<?php
function sum(...$numbers) {
    $acc = 0;
    foreach ($numbers as $n) {
        $acc += $n;
    }
    return $acc;
}

echo sum(1, 2, 3, 4);

echo sum(1,2,3,4,5,6)
```

### 4. 兼容数组和多参数的写法

这是Laravel文件系统中删除文件方法的源码
如果删除多个文件，可以传数组或多个参数

```php
    public function delete($paths)
    {
        $paths = is_array($paths) ? $paths : func_get_args();

        $success = true;

        foreach ($paths as $path) {
            try {
                if (! @unlink($path)) {
                    $success = false;
                }
            } catch (ErrorException $e) {
                $success = false;
            }
        }

        return $success;
    }
```


总结：该函数接受可变数量的参数。参数将作为数组传递给给定变量
