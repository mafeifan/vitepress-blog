要点：
* Laravel 有 2 种主要方式来实现用户授权：gates 和策略。
* Gates 接受一个当前登录用户的实例作为第一个参数。并且接收可选参数，比如相关的Eloquent 模型。
* 用命令生成策略 `php artisan make:policy PostPolicy --model=Post`
带`--model`参数生成的内容包含CRUD方法
* Gate用在模型和资源无关的地方，Policy正好相反。
```
<?php

namespace App\Policies;

use App\User;
use App\Post;
use Illuminate\Auth\Access\HandlesAuthorization;

class PostPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the post.
     *
     * @param  \App\User  $user
     * @param  \App\Post  $post
     * @return mixed
     */
    public function view(User $user, Post $post)
    {
        //
    }

    /**
     * Determine whether the user can create posts.
     *
     * @param  \App\User  $user
     * @return mixed
     */
    public function create(User $user)
    {
        //
    }

    /**
     * Determine whether the user can update the post.
     *
     * @param  \App\User  $user
     * @param  \App\Post  $post
     * @return mixed
     */
    public function update(User $user, Post $post)
    {
        //
    }

    /**
     * Determine whether the user can delete the post.
     *
     * @param  \App\User  $user
     * @param  \App\Post  $post
     * @return mixed
     */
    public function delete(User $user, Post $post)
    {
        //
    }
}

```

操作流程:
1. 新建Post表及Model文件
`php artisan make:migrate create_posts_table`
`php artisan make:model Post`
表信息
```
    public function up()
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->increments('id');
            $table->string('title');
            $table->integer('user_id')->unsigned();
            $table->text('body');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->timestamps();
        });
    }
```
填充数据，打开UserFactory添加
```
$factory->define(App\Post::class, function (Faker $faker) {
	return [
		'title' => $faker->sentence,
		'body' => $faker->paragraph,
		'user_id' => factory(\App\User::class)->create()->id,
	];
});
```
Post表内容
![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-f3ca21de1f0d860a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

2. routes/web.php添加
`Route::resource('posts', 'PostsController');`

3. 定义Gate
打开 Proviers/AuthServiceProvider.php，修改boot方法
```
    public function boot()
    {
        $this->registerPolicies();

        // Gates 接受一个用户实例作为第一个参数，并且可以接受可选参数，比如 相关的 Eloquent 模型：
	    Gate::define('update-post', function ($user, $post) {
		    // return $user->id == $post->user_id;
		    return $user->owns($post);
	    });
    }
```
这里，在User模型中定义了own方法
```
    public function owns($post)
    {
    	return $post->user_id === $this->id;
    }
```
4. PostsController中，只写一个show方法
```
    // Gate 演示
	public function show($id)
	{
		$post = Post::findOrFail($id);

		\Auth::loginUsingId(2);

		$this->authorize('update-post', $post);

		if (Gate::denies('update-post', $post)) {
			abort(403, 'sorry');
		}


		// compact('post') 等价于 ['post' => $post]
		return view('posts.view', compact('post'));
		// return $post->title;
	}
```
5. 访问 `/posts/1`。会报403。这是因为我们是用user_id为2登录。

![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-555198e22bd1e106.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

6. 如果注释 `$this->authorize('update-post', $post);`，就会显示：
![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-28a14f6b24e744ae.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

7. 视图中判断Policy，如果post的user_id是当前登录用户，显示编辑链接。
```
@can('update', $post)
<a href="#">编辑</a>
@endcan
```
@can 和 @cannot 各自转化为如下声明：
```
@if (Auth::user()->can('update', $post))
    <!-- 当前用户可以更新博客 -->
@endif

@unless (Auth::user()->can('update', $post))
    <!-- 当前用户不可以更新博客 -->
@endunless
```

参考：https://d.laravel-china.org/docs/5.5/authorization
