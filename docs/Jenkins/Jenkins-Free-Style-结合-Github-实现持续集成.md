#### 大致流程:
Github 提交代码 -> 触发WebHook  -> 触发Jenkins 执行 build

#### Github 部分：
1. 建立仓库：
https://github.com/mafeifan/docker-express-demo
这是一个非常简单的Node Express的项目，自带Dockerfile文件，我们需要每次push代码，在Jenkins服务器上构建新的Docker镜像和容器。

2. 生成 personal access token (如果是私有项目)

> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-81bcaa0da30bfb62.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

3. 配置项目的Webhook地址
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-deaac0a8d8435383.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

地址获取在Jenkins系统设置页面，还可以覆盖默认的地址

> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-9fce07eef6021df7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


#### Jenkins  部分
1. 安装 Github 插件 (一般默认就会安装)
2. 添加 Jenkins credentials
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-d33f3f13cdc47a5b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

我们发现credentials分好几种，对于公有仓库，选择用户名和密码即可，如果是私有仓库可以选择“ssh username with private key” 或者 "Secret" (内容填入刚生成的Github token)
ID 自己起，要唯一，创建后无法修改
3. 创建Item，类型选择"FreeStyle Project"
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-586f84d6b2df1e84.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

2. 配置
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-ff8e607658af457a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-7d44ba65614e1232.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


#### 总结
1. 流程非常简单，只是个人练习，不要运用在正式项目中
2. 有很多优化的地方，比如build后需要执行的shell脚本完全可以放入到项目仓库中受版本控制
