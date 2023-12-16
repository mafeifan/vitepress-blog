## Laravel 路由模型绑定

我们在使用路由的时候一个很常见的使用场景就是根据资源 ID 查询资源信息：

```php
Route::get('note/{id}', function ($id) {
    $task = \App\Models\Note::findOrFail($id);
});
```

Laravel 提供了一个「路由模型绑定」功能来简化上述代码编写，
通过路由模型绑定，我们只需要定义一个特殊约定的参数名（比如 {note}）来告知路由解析器需要从 Eloquent 记录中根据给定的资源 ID 去查询模型实例，
并将查询结果作为参数传入而不是资源 ID。

有两种方式来实现路由模型绑定：**隐式绑定**和**显式绑定**。

### 隐式绑定
使用路由模型绑定最简单的方式就是将路由参数命名为可以唯一标识对应资源模型的字符串（比如 $note 而非 $id），
然后在闭包函数或控制器方法中对该参数进行类型提示，此处参数名需要和路由中的参数名保持一致：
```php
Route::get('note/{note}', function (\App\Models\Note $note) {
    dd($note); // 打印 $note 明细
});
```

这样就避免了我们传入 $id 后再进行查询，而是把这种模板式代码交由 Laravel 框架底层去实现。

由于路由参数`（{note}）`和方法参数（$note）一样，并且我们约定了 $note 类型为 `\App\Models\Note`，
Laravel 就会判定这是一个路由模型绑定，每次访问这个路由时，应用会将传入参数值赋值给 `{note}`，
然后默认以参数值作为资源 ID 在底层通过 Eloquent 查询获取对应模型实例，并将结果传递到闭包函数或控制器方法中。

路由模型绑定默认将传入 `{note}` 参数值作为模型主键 ID 进行 Eloquent 查询，你也可以自定义查询字段，这可以通过在模型类中重写 `getRouteKeyName()` 来实现

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    public function getRouteKeyName() {
        return 'slug';  // 以Note的slug字段作为路由模型绑定查询字段
    }
}
```

比如在note表中


id | title | slug
------------ | ------------- | -------------
1 | hello world | hello-world


note list页面中，我们可以直接这么写，其中生成的href地址会形如`note/1`,`note/2`,

```php
@foreach($notes as $note)
    <li class="list-group-item">
        <a href="{{ url('note', [$note]) }}">
            {{ $note->title }}
        </a>
        <span class="pull-right">{{ $note->updated_at->diffForHumans() }}</span>
    </li>
@endforeach
```

如果我们在`getRouteKeyName`方法中指定了新的字段名，比如`slug`
则生成的url就会变为`note/hello-world`这样对SEO很有帮助

### 显式绑定
显式绑定需要手动配置路由模型绑定，通常需要在 App\Providers\RouteServiceProvider 的 boot() 方法中新增如下这段配置代码：
```php
public function boot()
{
    // 显式路由模型绑定
    Route::model('note_model', Note::class);

    parent::boot();
}
```
编写完这段代码后，以后每次访问包含 {task_model} 参数的路由时，路由解析器都会从请求 URL 中解析出模型 ID ，然后从对应模型类 Task 中获取相应的模型实例并传递给闭包函数或控制器方法：
```php
Route::get('note/model/{note_model}', function (\App\Models\Note $note) {
    dd($note);
});
```

由于在正式开发中，出于性能的考虑通常会对模型数据进行缓存，此外在很多情况下，需要关联查询才能得到我们需要的结果，所以并不建议过多使用这种路由模型绑定。


## 参考
https://learnku.com/docs/laravel/6.x/routing/5135#cbc0a0


