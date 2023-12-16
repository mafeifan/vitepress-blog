先看 [文档](https://d.laravel-china.org/docs/5.5/middleware)
Laravel 中间件提供了一种方便的机制来过滤进入应用的 HTTP 请求。
这里实现一个只有admin角色才能访问特定路由的功能

1. 新建middleware
`php artisan make:middleware MustBeAdmin`

2. 打开生成的 `\app\Http\Middleware\MustBeAdmin.php` 修改handle方法
关于hasRole方法上一篇有讲解
这里在请求前判断用户角色是否是admin，如果条件满足进到下一个中间件。不满足返回首页。
```
    public function handle($request, Closure $next)
    {
    	   // 前置
	    if ($request->user()->hasRole('admin')) {
		    return $next($request);
	    }
	    return redirect('/');
    }
```

3. 让系统识别中间件。打开 `\app\Http\Kernel` 
在 $routeMiddleware 数组里追加 
`'mustAdmin' => \App\Http\Middleware\MustBeAdmin::class,` 

4. 关于中间件的调用非常灵活，比如
* 在 routes\web.php 中 
`Route::resource('posts', 'PostsController')->middleware('mustAdmin');`
* 在控制器中
```
class PostsController extends Controller
{

	public function __construct()
	{
		$this->middleware('mustAdmin', ['only' => 'show']);
	}
...
```
5. 项目中用到过的中间件

### 例1 
在route中定义哪些角色可以访问，通过 `role:ADMIN,TEACHER` 知，role是中间件名字，后面的 `ADMIN,TEACHER` 是参数。
routes.php
```
Route::group(['middleware' => ['web', 'auth', 'role:ADMIN,TEACHER'], 'namespace' => '\StudentTrac\Guides\Controllers'],
    function () {
        Route::resource('guides', 'GuidesController', ['only' => ['index']]);
        Route::resource('guides/admin', 'AdminController', ['only' => ['index', 'edit']]);
    }
);
```
/app/Http/Middleware/Role.php
```
    public function handle($request, Closure $next, $role)
    {
        //  ['ADMIN', 'TEACHER']
    	$roles = func_get_args();
    	$roleIds = [];
        // 根据role名字拿到对应的id
		foreach ($roles as $index => $role) {
            // 为什么这么判断我也忘了
			if ($index < 2) continue;
			$roleIds[] = config('roles.' . trim($role));
		}

        // 判断当前用户的roleId是否存在
        if (! in_array((int)$this->auth->user()->RoleId, $roleIds)) {
            return response('Unauthorized', 403);
        }

        return $next($request);
    }
```
config/roles.php
```
return [
    /*
     * Role id for role.
     */
    'ADMIN'    => 1,
    'STUDENT'  => 2,
    'GUARDIAN' => 3,
    'TEACHER'  => 4,
    'SUPPORTSTAFF' => 5,
    'AUDITOR' => 6,
    'CURRICULUM' => 7,
    'CLIENTADMINISTRATOR' => 8,
];
```
