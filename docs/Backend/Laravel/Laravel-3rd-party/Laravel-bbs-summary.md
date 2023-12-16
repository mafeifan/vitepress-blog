这个[bbs项目](https://github.com/summerblue/larabbs )是laravel社区大佬写的，很有学习意义，抽空看了下。

今天抽空总结一下，吸取一些优秀的地方。

首先打开`composer.json`看看项目中用到了哪些第三方类库


mews/captcha
很明显，生成验证码

mews/purifier
这个是html过滤，因为是bbs系统，过滤用户输入的内容

overtrue/pinyin
把汉字转换成拼音，主要是转换帖子标题，方便SEO

spatie/laravel-permission
这个类库很常见，权限控制，具体见[文档](https://docs.spatie.be/laravel-permission/v3/introduction/)

[summerblue/administrator](https://github.com/summerblue/administrator)
快速的生成后台管理页面及功能

[summerblue/laravel-active](https://github.com/dwightwatson/active)
提供了一些工具方法，比如判断是否是当前路由，当前控制器，是否包含了某查询参数等功能

[viacreative/sudo-su](https://github.com/viacreative/sudo-su)
很有意思的类库，安装后，页面右下角有个用户列表，可以选择不同的用户身份登录系统，非常方便开发期调试使用


来看下目录结构，还是非常清晰的

![](https://pek3b.qingstor.com/hexo-blog/images/20200807180822.png)


再来看下路由

除去第三方带的的`_debugbar`, `_ignition`, `Frozennode\Administrator`, `horizon`

剩下的就是自己写的，topic，reply，user的增删改

![](https://pek3b.qingstor.com/hexo-blog/images/20200807181509.png)


挑一下比较重要的功能介绍下

1. 添加文章

顺着路由走
`routes/web.php`  发现了

`Route::resource('topics', 'TopicsController', ['only' => ['index', 'create', 'store', 'update', 'edit', 'destroy']]);`

打开` TopicsController`

```php
    public function store(TopicRequest $request, Topic $topic)
    {
        $topic->fill($request->all());
        $topic->user_id = Auth::id();
        $topic->save();

        return redirect()->to($topic->link())->with('success', '成功创建话题！');
    }
```

很简单，重点是`app/Observers/TopicObserver.php`

```
class TopicObserver
{
    public function saving(Topic $topic)
    {
        // XSS 过滤
        $topic->body = clean($topic->body, 'user_topic_body');

        // 生成话题摘录
        $topic->excerpt = make_excerpt($topic->body);
    }

    public function saved(Topic $topic)
    {
        // 如 slug 字段无内容，即使用翻译器对 title 进行翻译
        if ( ! $topic->slug) {

            // 推送任务到队列
            dispatch(new TranslateSlug($topic));
        }
    }

    public function deleted(Topic $topic)
    {
        \DB::table('replies')->where('topic_id', $topic->id)->delete();
    }
}
```

这里用到了[Model观察器](https://learnku.com/docs/laravel/6.x/eloquent/5176#observers)，来监听保存事件

::: tip
observers的使用场景：
当保存话题成功后，需要调用第三方服务，把话题标题从汉字转为拼音，同时要过滤内容，根据内容生成摘要，这些保存后的后续操作都可以放到观察者中。
:::
