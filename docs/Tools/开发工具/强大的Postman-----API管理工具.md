Postman是大家常用的API管理及测试工具。
他可能比你想象中的更强大。
个人最近研究了一波，简单总结一下。
1. Postman工具有chrome扩展和独立客户端，推荐安装独立客户端。
2. Postman有个workspace的概念，workspace 分 personal 和 team类型。
personal workspace 只能查看和管理自己的的API，team workspace 可添加成员和设置成员权限，成员之间可共同管理API。
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-e56b0ffce470a77a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
3. 每个workspace可管理多个collection，我们可以发布collection，即生成在线API文档。
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-58f464ccf5925497.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
4. collection及每个collection包含的API中的描述支持markdown
5. 每个API支持写测试用例，下图 snippet 提供了很多测试示例
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-424b0f2f52bfd009.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
6. Postman提供了一个专门跑API测试的GUI工具，叫 Runner， 配好循环次数，测试之间的时间间隔，然后针对某collection中的目录或上传collection就可以进行测试了。
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-4639d62d7c26983f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
7. Postman本身提供了一套[Postman API](https://docs.api.getpostman.com/)可以操作collection，environment等，不过要先申请一个api_key。通过他可以以请求的方式操作自己写的API。
8. GUI工具需要我们手动点击触发跑测试，还无法做到完全自动化，好在Postman提供了CLI工具叫做 [newman](https://www.npmjs.com/package/newman)，是一个NodeJS项目。
9. 下面的代码非常简单，配好要测试的collection和 environment，执行 `node index.js` 就能看到测试用例的结果。这里配置的是在命令行和html中显示报告。
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-4a9a1bdd2589006d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这里我找了漂亮的 [Postman Report Html模板](https://github.com/MarcosEllys/awesome-newman-html-template)
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-fe83daa1d32e00e0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
10. 这样基本可以实现了 API测试自动化

#### 注意事项
1. 使用Postman要注意有配额限制，尤其是team workspace和调用API。超出后需要掏钱升级。team 中的 member 越多，收费越高。
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-20f7b55dd5f2dbb7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

不过免费的一般基本够用。
2. Postman的功能不止如此，还支持Fork, pull request，monitor监控等功能，大家可以查看官方文档。
3. 关于免费和收费版的[区别](https://www.getpostman.com/pricing)


