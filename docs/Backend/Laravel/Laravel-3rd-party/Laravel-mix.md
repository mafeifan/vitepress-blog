Laravel Mix 对 Webpack 进行了封装，是 Laravel 自带的扩展包。也不限于Laravel项目使用。
使用非常简单,详见[官方文档](https://laravel-mix.com/)
目前我在某项目中使用的配置
```js
const mix = require('laravel-mix');


/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix
    .extract()
    .scripts([
        'resources/js/vendor/metisMenu.js',
        'resources/js/vendor/jquery.mask.min.js',
        'resources/js/vendor/bootstrap.bundle.js',
        'resources/js/vendor/moment-2.24.0.js',
        'resources/js/vendor/tempusdominus-bootstrap-4.js',
        'resources/js/vendor/popper.min.js',
        'resources/js/vendor/select2.min.js',
        'resources/js/vendor/jquery.dataTables.min.js',
        'resources/js/vendor/dataTables.bootstrap4.min.js',
    ], 'public/js/third-party.js')
    .js('resources/js/app.js', 'public/js')
    .styles([
        'resources/css/metisMenu.css',
        'resources/css/tempusdominus-bootstrap-4.css',
        'resources/css/select2.min.css',
        'resources/css/select2-bootstrap4.css',
        'resources/css/dataTables.bootstrap4.min.css',
        'resources/css/nprogress.css',
    ], 'public/css/vendor.css')
    .sass('resources/sass/app.scss', 'public/css');

if (mix.inProduction()) {
    mix.version();
} else {
    if (process.env.MIX_PROXY_HOST) {
        // mix.browserSync({
        //     proxy: process.env.MIX_PROXY_HOST
        // });
    }
}
```

注意事项:
1. extract()方法会提取所有import来自node_modules中的类库并合并到vendor.js中
2. 当使用extract方法会自动生成一个manifest.js文件，这个文件是运行时代码，帮助缓存vendor.js
3. 最终js目录会生成app.js、manifest.js、third-party.js和vendor.js，在blade中也要按上面的顺序加载
4. 
```html
<script src="{{ mix('js/manifest.js') }}"></script>
<script src="{{ mix('js/vendor.js') }}"></script>
<script src="{{ mix('js/app.js') }}"></script>
<script src="{{ mix('js/third-party.js') }}"></script>

```
