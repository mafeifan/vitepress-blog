实现基于user，role，permission三表的权限管理
因为一个用户可能拥有多种role，而一种role能同时被多个用户拥有。所以要建立多对多关系。
[参见文档](https://d.laravel-china.org/docs/5.5/eloquent-relationships#%E5%A4%9A%E5%AF%B9%E5%A4%9A)
1. 建立这三个表及关联表
```
    public function up()
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name');
            $table->string('label')->nullable();
            $table->timestamps();
        });

	    Schema::create('permissions', function (Blueprint $table) {
		    $table->increments('id');
		    $table->string('name');
		    $table->string('label')->nullable();
		    $table->timestamps();
	    });

	    Schema::create('permission_role', function (Blueprint $table) {
		    $table->integer('permission_id')->unsigned();
		    $table->integer('role_id')->unsigned();

		    $table->foreign('permission_id')
		          ->references('id')
		          ->on('permissions')
		          ->onDelete('cascade');

		    $table->foreign('role_id')
		          ->references('id')
		          ->on('roles')
		          ->onDelete('cascade');

		    $table->primary(['permission_id', 'role_id']);
	    });

	    Schema::create('role_user', function (Blueprint $table) {
		    $table->integer('role_id')->unsigned();
		    $table->integer('user_id')->unsigned();

		    $table->foreign('user_id')
		          ->references('id')
		          ->on('users')
		          ->onDelete('cascade');

		    $table->foreign('role_id')
		          ->references('id')
		          ->on('roles')
		          ->onDelete('cascade');

		    $table->primary(['user_id', 'role_id']);
	    });
    }
```
2. 建立模型关联

User模型
```
...
	public function roles()
	{
		return $this->belongsToMany(Role::class);
	}
...
```
Role模型
```
class Role extends Model
{
	public function permissions()
	{
		return $this->belongsToMany(Permission::class);
	}

    // $role = Role::first(); $p = Permission::first();  
    // $role->givePermission($p);
	public function givePermission(Permission $permission)
	{
		return $this->permissions()->save($permission);
	}
}
```
Permission模型
```
class Permission extends Model
{
	public function roles()
	{
		return $this->belongsToMany(Role::class);
	}
}

```
3. 添加记录，这里我们添加一个admin的role和名为edit_form的permission，并且让admin拥有edit_form权限。
![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-d5bf911740335823.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

执行完 $role->givePermission($permission);会发现permission_role表多了一条记录

![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-7155bfcd3593a6b7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

添加role和user的关系，将id为1的用户角色修改为admin。
![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-d3c1e183e6939926.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

会发现role_user表多了一条记录
![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-0839d6b4e4e155e0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
> `$user->roles()->detach($role);` 可以删除这条记录
`$user->roles()->attach($role);` 新增记录
4. 修改AuthServiceProvider.php，从数据库从读取所有的permission信息并设置Gate。让配置生效。
```
    public function boot()
    {
        $this->registerPolicies();

        // Gates 接受一个用户实例作为第一个参数，并且可以接受可选参数，比如 相关的 Eloquent 模型：
	    foreach($this->getPermission() as $permission) {
	    	// dd($permission->roles);
	    	Gate::define($permission->name, function($user) use ($permission) {
	    		// 返回collection
	    		return $user->hasRole($permission->roles);
		    });
	    }

    }

	public function getPermission()
	{
		return Permission::with('roles')->get();
    }
```
给User模型添加hasRole方法
```
	public function hasRole($role)
	{
		if (is_string($role)) {
			return $this->roles->contains('name', $role);
		}

		// intersect 移除任何指定 数组 或集合内所没有的数值。最终集合保存着原集合的键：
		return !!$role->intersect($this->roles)->count();
	}
```
5. 修改视图，测试，如果当前登录用户的id是1，就可以看到'编辑'链接
```
@can('edit_form')
<a href="#">编辑</a>
@endcan
```
6. 总结

$this->roles() 与 $this->roles 有什么不同，什么情况下使用呢？ 
$this->roles() 返回 QueryBuilder ，$this->roles 返回一个 Collection
