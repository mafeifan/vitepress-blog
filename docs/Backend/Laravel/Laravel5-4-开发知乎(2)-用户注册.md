注册流程： 用户注册必须填写邮箱地址 -> 发送验证邮箱 -> 激活登录成功
相关扩展： [Laravel-SendCloud](https://github.com/NauxLiu/Laravel-SendCloud)

1. Laravel是自带登录，忘记密码，找回密码等auth相关的逻辑的，执行 `php artisan make:auth` 就会多出来这些相关文件，具体 [参见](https://www.cnblogs.com/zhangbao/p/7224294.html)。页面的右上角就能看到注册，登录的链接了。

2. 配置邮箱，使用上面的Laravel-SendCloud
3. 修改注册逻辑，修改 `RegisterController.php` 的create方法
```
	protected function create(array $data)
	{
		$user = User::create([
			'name' => $data['name'],
			'email' => $data['email'],
			// TODO 通过配置读取
			'avatar' => '/images/avatars/default.png',
			'confirmation_token' => str_random(40),
			'password' => bcrypt($data['password']),
			'api_token' => str_random(60),
			'settings' => ['city' => '']
		]);
        // 发送激活邮件
		$this->sendVerifyEmailToUser($user);
        \Flash::success('一封激活邮件已发送到 '.$data['email'].' 请激活');
		return $user;
	}

```
