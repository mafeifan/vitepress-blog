Laravel UI 源码分析

laravel/ui 是一个composer包，可以生成登录/注册代码的脚手架，使用方法叫[文档](https://learnku.com/docs/laravel/6.x/frontend/5149#writing-javascript
)

源码结构：

![](https://pek3b.qingstor.com/hexo-blog/hexo-blog/20201103174100.png)

原理比较简单，提供一些命令
```
// 生成基本脚手架
php artisan ui bootstrap
php artisan ui vue
php artisan ui react

// 生成 登录/注册 脚手架...
php artisan ui bootstrap --auth
php artisan ui vue --auth
php artisan ui react --auth
```

比如，执行`php artisan ui vue`会复制源码目录中的`Presets/vue-stubs/`相关文件到到项目目录的resources底下

源码分析 UiServiceProvider
这个文件没啥说的，明显注册服务
```php
<?php

namespace Laravel\Ui;

use Illuminate\Contracts\Support\DeferrableProvider;
use Illuminate\Support\ServiceProvider;

class UiServiceProvider extends ServiceProvider implements DeferrableProvider
{
    /**
     * Register the package services.
     *
     * @return void
     */
    public function register()
    {
        if ($this->app->runningInConsole()) {
            $this->commands([
                AuthCommand::class,
                UiCommand::class,
            ]);
        }
    }

    /**
     * Get the services provided by the provider.
     *
     * @return array
     */
    public function provides()
    {
        return [
            AuthCommand::class,
            UiCommand::class,
        ];
    }
}

```


UiCommand.php

核心文件，描述命令和发生的内容
```php
<?php

namespace Laravel\Ui;

use Illuminate\Console\Command;
use InvalidArgumentException;

class UiCommand extends Command
{
    /**
     * The console command signature.
     *
     * @var string
     */
    protected $signature = 'ui
                    { type : The preset type (bootstrap, vue, react) }
                    { --auth : Install authentication UI scaffolding }
                    { --option=* : Pass an option to the preset command }';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Swap the front-end scaffolding for the application';

    /**
     * Execute the console command.
     *
     * @return void
     *
     * @throws \InvalidArgumentException
     */
    public function handle()
    {
        // 
        if (static::hasMacro($this->argument('type'))) {
            return call_user_func(static::$macros[$this->argument('type')], $this);
        }

        if (! in_array($this->argument('type'), ['bootstrap', 'vue', 'react'])) {
            throw new InvalidArgumentException('Invalid preset.');
        }

        // 这句很牛逼
        // 如果type是vue，就执行 $this->vue()
        // 如果type是react，就执行 $this->react()
        $this->{$this->argument('type')}();

        if ($this->option('auth')) {
            $this->call('ui:auth');
        }
    }

    /**
     * Install the "bootstrap" preset.
     *
     * @return void
     */
    protected function bootstrap()
    {
        Presets\Bootstrap::install();

        $this->info('Bootstrap scaffolding installed successfully.');
        $this->comment('Please run "npm install && npm run dev" to compile your fresh scaffolding.');
    }

    /**
     * Install the "vue" preset.
     *
     * @return void
     */
    protected function vue()
    {
        Presets\Bootstrap::install();
        Presets\Vue::install();

        $this->info('Vue scaffolding installed successfully.');
        $this->comment('Please run "npm install && npm run dev" to compile your fresh scaffolding.');
    }

    /**
     * Install the "react" preset.
     *
     * @return void
     */
    protected function react()
    {
        Presets\Bootstrap::install();
        Presets\React::install();

        $this->info('React scaffolding installed successfully.');
        $this->comment('Please run "npm install && npm run dev" to compile your fresh scaffolding.');
    }
}

```

Vue.php
这里学到一些如何用php解析package.json，操作文件或目录的命令
```php
<?php

namespace Laravel\Ui\Presets;

use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Arr;

class Vue extends Preset
{
    /**
     * Install the preset.
     *
     * @return void
     */
    public static function install()
    {
        // 先检查 resouces/js/components目录是否存在
        static::ensureComponentDirectoryExists();
        // 更新 package.json插入vue相关依赖
        static::updatePackages();
        // 拷贝 vue-stubs/webpack.mix.js 到 resouces/webpack.mix.js
        static::updateWebpackConfiguration();
        // 拷贝 vue-stubs/app.js 到 js/app.js
        static::updateBootstrapping();
        // 拷贝 Vue 相关组件文件到resouces目录
        static::updateComponent();
        // 删除 node_modules 目录和 yarn.lock 文件
        static::removeNodeModules();
    }

    /**
     * Update the given package array.
     *
     * @param  array  $packages
     * @return array
     */
    protected static function updatePackageArray(array $packages)
    {
        return [
            'resolve-url-loader' => '^2.3.1',
            'sass' => '^1.20.1',
            'sass-loader' => '^8.0.0',
            'vue' => '^2.5.17',
            'vue-template-compiler' => '^2.6.10',
        ] + Arr::except($packages, [
            '@babel/preset-react',
            'react',
            'react-dom',
        ]);
    }

    /**
     * Update the Webpack configuration.
     *
     * @return void
     */
    protected static function updateWebpackConfiguration()
    {
        copy(__DIR__.'/vue-stubs/webpack.mix.js', base_path('webpack.mix.js'));
    }

    /**
     * Update the example component.
     *
     * @return void
     */
    protected static function updateComponent()
    {
        (new Filesystem)->delete(
            resource_path('js/components/Example.js')
        );

        copy(
            __DIR__.'/vue-stubs/ExampleComponent.vue',
            resource_path('js/components/ExampleComponent.vue')
        );
    }

    /**
     * Update the bootstrapping files.
     *
     * @return void
     */
    protected static function updateBootstrapping()
    {
        copy(__DIR__.'/vue-stubs/app.js', resource_path('js/app.js'));
    }
}

```

操作vue和react的公共方法

updatePackages php操作编辑package.json

```php
<?php

namespace Laravel\Ui\Presets;

use Illuminate\Filesystem\Filesystem;

class Preset
{
    /**
     * Ensure the component directories we need exist.
     *
     * @return void
     */
    protected static function ensureComponentDirectoryExists()
    {
        $filesystem = new Filesystem;

        if (! $filesystem->isDirectory($directory = resource_path('js/components'))) {
            $filesystem->makeDirectory($directory, 0755, true);
        }
    }

    /**
     * Update the "package.json" file.
     *
     * @param  bool  $dev
     * @return void
     */
    protected static function updatePackages($dev = true)
    {
        if (! file_exists(base_path('package.json'))) {
            return;
        }

        $configurationKey = $dev ? 'devDependencies' : 'dependencies';

        $packages = json_decode(file_get_contents(base_path('package.json')), true);

        $packages[$configurationKey] = static::updatePackageArray(
            array_key_exists($configurationKey, $packages) ? $packages[$configurationKey] : [],
            $configurationKey
        );

        ksort($packages[$configurationKey]);

        file_put_contents(
            base_path('package.json'),
            json_encode($packages, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT).PHP_EOL
        );
    }

    /**
     * Remove the installed Node modules.
     *
     * @return void
     */
    protected static function removeNodeModules()
    {
        tap(new Filesystem, function ($files) {
            $files->deleteDirectory(base_path('node_modules'));

            $files->delete(base_path('yarn.lock'));
        });
    }
}

```

## 参考

https://learnku.com/articles/2769/laravel-pipeline-realization-of-the-principle-of-single-component
https://segmentfault.com/a/1190000022566835
