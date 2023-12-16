```php
interface Food {
    public function weight();
}

class Apple implements Food {
   public function __contructur($weight) {
      return $this->weight = $weight;
   }

    public function weight() {
      return $this->weight;
    }
}

// 绑定容器
app()->bind('weight', function() {
   return new Apple(100);
});

// 上面的等价写法


// 等价于 dd(app('weight'));
dd(resolve('weight'));
```
