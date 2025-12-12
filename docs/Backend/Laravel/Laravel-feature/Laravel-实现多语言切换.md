Laravel 默认是支持多语言功能的, 我们可以快速实现

### 创建语种文件
`config/app` 中，应用默认语言是英文
```php
    /*
    |--------------------------------------------------------------------------
    | Application Locale Configuration
    |--------------------------------------------------------------------------
    |
    | The application locale determines the default locale that will be used
    | by the translation service provider. You are free to set this value
    | to any of the locales which will be supported by the application.
    |
    */

    'locale' => 'en',
```

resource/lang/ 是语言包目录，默认也只有英文
需要其他语种，可以到这个[项目](https://github.com/caouecs/Laravel-lang)下载


假设我们这个项目需要实现荷兰语和英语
在`resource/lang/`下新建 nl 目录, 对应的文件也拷贝过来

最后为了灵活配置和扩展,新建`config/locale.php`
内容如下：
```php
<?php

return [

    /*
     * Whether or not to show the language picker, or just default to the default
     * locale specified in the app config file
     *
     * @var bool
     */
    'status' => true,

    /*
     * Available languages
     *
     * Add your language code to this array.
     * The code must have the same name as the language folder.
     * Be sure to add the new language in an alphabetical order.
     *
     * The language picker will not be available if there is only one language option
     * Commenting out languages will make them unavailable to the user
     *
     * @var array
     */
    'languages' => [
        /*
         * Key is the Laravel locale code
         * Index 0 of sub-array is the Carbon locale code
         * Index 1 of sub-array is the PHP locale code for setlocale()
         * Index 2 of sub-array is whether or not to use RTL (right-to-left) css for this language
         */
        // 'ar'    => ['ar', 'ar_AR', true],
        // 'da'    => ['da', 'da_DK', false],
        // 'de'    => ['de', 'de_DE', false],
        // 'el'    => ['el', 'el_GR', false],
        'en'    => ['en', 'en_US', false],
        // 'es'    => ['es', 'es_ES', false],
        // 'fr'    => ['fr', 'fr_FR', false],
        // 'id'    => ['id', 'id_ID', false],
        // 'it'    => ['it', 'it_IT', false],
        'nl'    => ['nl', 'nl_NL', false],
        // 'pt_BR' => ['pt_BR', 'pt_BR', false],
        // 'ru'    => ['ru', 'ru-RU', false],
        // 'sv'    => ['sv', 'sv_SE', false],
        // 'th'    => ['th', 'th_TH', false],
    ],
];

```

### 前端，创建dropdown menu

创建 `resources/views/includes/lang.blade.php`
```php
<div class="dropdown-menu lang-menu">
    @foreach (array_keys(config('locale.languages')) as $lang)
        @if ($lang != App::getLocale())
            <a class="dropdown-item" href="/lang/{{$lang}}">{{trans('menus.language-picker.langs.'.$lang)}}</a>
        @endif
    @endforeach
</div>

```
从配置读所有语言，并只显示当前没有选中的语言，比如当前默认是en，配了两种语言en和nl。所以只显示nl

修改 `resources/views/layouts/app.blade.php`

```php
<!-- Right Side Of Navbar -->
<ul class="navbar-nav ml-auto">
    <li class="nav-item dropdown">
        <a href="#" class="nav-link dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
            {{ trans('menus.language-picker.language') }}
            <span class="caret"></span>
        </a>

        @include('includes.lang')
    </li>
    @yield('navigation')
</ul>
```

关于 `trans('menus.language-picker.language')`
需要新建 `resouces/lang/en/menus` 是整个系统菜单区域的语言翻译文件
```php
<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Menus Language Lines
    |--------------------------------------------------------------------------
    |
    | The following language lines are used in menu items throughout the system.
    | Regardless where it is placed, a menu item can be listed here so it is easily
    | found in a intuitive way.
    |
    */

    'Home' => 'Home',

    'language-picker' => [
        'language' => 'Language',
        /*
         * Add the new language to this array.
         * The key should have the same language code as the folder name.
         * The string should be: 'Language-name-in-your-own-language (Language-name-in-English)'.
         * Be sure to add the new language in alphabetical order.
         */
        'langs' => [
            'ar'    => 'Arabic',
            'da'    => 'Danish',
            'de'    => 'German',
            'el'    => 'Greek',
            'en'    => 'English',
            'es'    => 'Spanish',
            'fr'    => 'French',
            'id'    => 'Indonesian',
            'it'    => 'Italian',
            'nl'    => 'Dutch',
            'pt_BR' => 'Brazilian Portuguese',
            'ru'    => 'Russian',
            'sv'    => 'Swedish',
            'th'    => 'Thai',
        ],
    ],
];

```

前端效果如下：

![image.png](https://pek3b.qingstor.com/hexo-blog/images/2019/11/20/4fd14c21dd7fdcdeb9ab38b4dd86a81c.png)

### 后端
切换时需要请求api，然后把新的语言存到session中，还需要创建一个中间件，请求过来时候，判断下从session中读语言

首先`routes/web.php`中添加一个路由

```
// Switch between the included languages
 Route::get('lang/{lang}', 'LanguageController@swap');
```
 
然后创建`LanguageController.php`

`php artisan make:controller LanguageController`

```php
<?php

namespace App\Http\Controllers;

/**
 * Class LanguageController.
 */
class LanguageController extends Controller
{
    /**
     * @param $lang
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function swap($lang)
    {
        \App::setLocale($lang);

        session()->put('locale', $lang);

        return redirect()->back();
    }
}

```

接着创建中间件
`php artisan make:middle Localization`

```php
<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\TrimStrings as Middleware;

class Localization extends Middleware
{
    public function handle($request, \Closure $next)
    {
        if (session()->has('locale')) {
            \App::setLocale(session()->get('locale'));
        }
        return $next($request);
    }
}

```
 
别忘了为了让中间件生效，需要在`app/Http/Kernel.php`中加入相应的配置
```php
    /**
     * The application's route middleware groups.
     *
     * @var array
     */
    protected $middlewareGroups = [
        'web' => [
            \App\Http\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
            // \Illuminate\Session\Middleware\AuthenticateSession::class,
            \Illuminate\View\Middleware\ShareErrorsFromSession::class,
            \App\Http\Middleware\VerifyCsrfToken::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
            // 加到最下面
            Localization::class,
        ],
```

### 参考
https://www.larashout.com/how-to-create-multilingual-website-using-laravel-localization
