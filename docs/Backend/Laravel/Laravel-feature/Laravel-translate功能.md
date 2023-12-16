项目支持多语言切换是很常见的功能，Laravel本身支持本地化，详见[官方文档](https://learnku.com/docs/laravel/6.x/localization/5148)

简单说先创建语言包文件

比如项目要支持英语和荷兰语，需要创建`resources/lang/en/auth.php`和`resources/lang/nl/auth.php`

```php
<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Authentication Language Lines
    |--------------------------------------------------------------------------
    |
    | The following language lines are used during authentication for various
    | messages that we need to display to the user. You are free to modify
    | these language lines according to your application's requirements.
    |
    */
    'User Name' => 'User Name',
    'Password' => 'Password',
    'Employee Login' => 'Employee Login',
    'failed' => 'Please check your account information.',
    'sub-domain' => 'Login failed, Sub-domain or Company not match.',
    'throttle' => 'Too many login attempts. Please try again in :seconds seconds.',

];

```

然后在php文件和模板文件就可以引用了
```php
// PHP中
echo __('auth.Password');
trans('auth.Password');


// 模板中
{{ __('auth.Password') }}

@lang('auth.Password')
```

为了让前端知道我们现在使用的哪种语言,我们将语言输出到JS中
打开`resources/views/layouts/app.blade.php`

添加，一定要保证在app.js上面，因为默认情况下，app.js里面包含了Vue
```javascript
<script>
    window.Laravel = {
        csrfToken: '{{ csrf_token() }}',
        Locale: '<?php echo \App::getLocale(); ?>',
        Languages: <?php echo json_encode(['dashboard' => __('auth')], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);?>
    };
</script>
<script src="{{ mix('js/app.js') }}"></script>
```


输出结果
```javascript
<script>
window.Laravel = {
    csrfToken: 'am9VXxfFaONZdOQHp4P7V1rP9tUdiK85j8KoJrB3',
    Locale: 'en',
    Languages: {
        "dashboard": {
            "User Name": "User Name",
            "Password": "Password",
            "Employee Login": "Employee Login",
            "failed": "Please check your account information.",
            "sub-domain": "Login failed, Sub-domain or Company not match.",
            "throttle": "Too many login attempts. Please try again in :seconds seconds."
        }
    }    
};
</script>
```

然后打开app.js
```javascript
const i18n = new VueI18n({
    locale: window.Laravel.Locale || 'en',
    // 需定义，详见 https://kazupon.github.io/vue-i18n/zh/started.html#html 
    messages,
});
```


### 参考
* https://learnku.com/docs/laravel/6.x/localization/5148
* https://kazupon.github.io/vue-i18n/zh/introduction.html
