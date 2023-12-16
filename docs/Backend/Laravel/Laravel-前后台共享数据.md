#####  在视图模板中初始化JS变量。

```
<script>
    var app = <?php echo json_encode($array); ?>;
</script>
```
5.5以后可以这么写, 用 @json Blade 指令替代手动 json_encode
```
<script>
    var app = @json($array);
</script>
```
曾经在多语言项目中这么用过。
```
<script>
    window.Laravel = {
        csrfToken: '{{ csrf_token() }}',
        Locale: '<?php echo \App::getLocale(); ?>',
        Languages: <?php echo json_encode(
            [
                'scaffold'         => __('scaffold::t'),
                'module_dashboard' => __('module_dashboard::t'),
                'module_user' => __('module_user::t'),
                'setting' => __('setting::t'),
            ],
            JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);?>
    };
</script>
```

#####  Laravel变量传入在vue组件中
定义组件
```
<script>
export default {
    props: ['surveyData'],
    mounted () {
        // Do something useful with the data in the template
        console.dir(this.surveyData)
    }
}
</script>
```
注入变量
```
<survey-component :survey-data="'{!! json_encode($surveyData) !!}'"></survey-component>
```

参考：
https://medium.com/@m_ramsden/passing-data-from-laravel-to-vue-98b9d2a4bd23
https://laravel-china.org/docs/laravel/5.6/blade/1375
