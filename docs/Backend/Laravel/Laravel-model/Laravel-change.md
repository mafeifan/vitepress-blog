模型变更自动更新某字段

在创建模型对象时设置某些字段的值，大概是最受欢迎的例子之一了。 一起来看看在创建模型对象时，你想要生成 UUID 字段 该怎么做。

模型文件中
```php
public static function boot()
{
  parent::boot();
  self::creating(function ($model) {
    $model->uuid = (string)Uuid::generate();
  });

  static::updating(function($model)
  {
    // 写点日志啥的
    // 覆盖一些属性，类似这样 $model->something = transform($something);
  });
}

```

2. 
`php artisan make:observer UserObserver --model=User`
