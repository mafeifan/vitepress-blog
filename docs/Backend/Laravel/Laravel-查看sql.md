方法一：

我们有时候想测试一段代码生产的 SQL 语句，比如: 我们想看 App\User::all(); 产生的 SQL 语句，我们简单在 routes.php 做个实验即可：

//app/Http/routes.php
```
Route::get('/test-sql', function() {
    DB::enableQueryLog();
    $user = App\User::all();
    return response()->json(DB::getQueryLog());
});
```
然后我们在浏览器打开 http://www.yousite.com/test-sql 即可看到 $user = User::all(); 所产生的 SQL 了。
```
[
    {
        query: "select * from `users` where `users`.`deleted_at` is null",
        bindings: [ ],
        time: 1.37
    }
]
```

参考：http://blog.csdn.net/leedaning/article/details/53792727
