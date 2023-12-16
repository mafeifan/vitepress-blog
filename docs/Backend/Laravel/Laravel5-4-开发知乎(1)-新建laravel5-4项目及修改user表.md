本节新建一个全新的laravel5.4项目及为user表添加一些字段

1. 新建laravel项目
`laravel new zhihu-app`
2. 配置.env，主要改下数据库连接信息
3. 配置vhost，如果用的homestead，可能还要改他的配置文件

4.  修改user表
打开 `2014_10_12_000000_create_users_table.php`
添加一些字段
```
  public function up()
  {
    Schema::create('users', function (Blueprint $table) {
      $table->increments('id');
      $table->string('name')->unique();
      $table->string('email')->unique();
      $table->string('password');
      $table->string('avatar');
      // 激活token
      $table->string('confirmation_token');
      // 是否激活邮箱
      $table->smallInteger('is_active')->default(0);
      $table->integer('questions_count')->default(0);
      $table->integer('answers_count')->default(0);
      $table->integer('comments_count')->default(0);
      $table->integer('favorites_count')->default(0);
      $table->integer('likes_count')->default(0);
      $table->integer('followers_count')->default(0);
      $table->integer('followings_count')->default(0);
      $table->string('api_token', 64)->unique();
      // 注意这里需要mysql5.7以上 支持json格式
      $table->json('settings')->nullable();
      $table->rememberToken();
      $table->timestamps();
    });
  }
```

5. 执行 `php artisan migrate` 生成user table
