比如有一个项目叫sinuo，我们想实现sinuo-admin用户登录后只能查看和构建以sinuo开头的项目名，并且不能修改Job配置。

使用Role-based Authorization Strategy插件，使得不同的账号有不同的权限，不同的项目。可以非常轻松实现上面的需求。

1. 安装过程略，安装后来到Jenkins管理，发现了很多选项，勾选"Role-Based Strategy"并保存
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-1b5294b72106d208.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

2. 安装成功后会多出一个"Manage and Assign Roles"菜单项
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-20bbde56df0e2caa.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

点击后，有三个选项，分别表示管理角色，分配用户给角色和角色策略宏
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-1af37d6c7f3648f5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

3.  我们先添加一个角色，可以添加三种类型的角色，分别是全局角色(比较简单粗暴)，基于项目的(常用) 和 基于节点的(不常用)

> 注意Pattern可以使用正则，如果需要过滤已sinuo开头的项目，可以填写`sinuo.*`填写`sinuo*`会不生效，点击后会列出匹配到的项目

> 注意，如果一个用户及时全局角色又是项目角色，默认全局角色优先级更高，如果希望基于项目维度进行权限控制，除了admin角色，其他全局角色的Job权限及SCM权限留空

列下不易看懂的权限：

Overall: 特殊的权限类，系统级别权限
- Adminster 允许用户更改Jenkins系统级别的配置，开放后可进入Jenkins管理页面
- Read 全局读权限

Job：任务相关的权限
- Discover：如果匿名用户没有Discover权限，直接在浏览器中输入Jenkins任务URL(真实存在)时，会直接跳转到404页面，如果有该权限，则跳转到登录页面
- Workspace：允许查看Jenkins任务的工作空间内容的权限
- Update：允许用户更新构建历史的属性，如手动更新某次构建失败的原因

> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-4bc5ef5b6ae93234.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

4. 然后我们来到分配角色，已经提前创建好了名为sinuo-admin用户，然后把他分配给project-admin角色
![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-ed6bb26fc2d8b9b0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

5. 浏览器新开一个隐身窗口，使用sinuo-admin测试登录，正常的话，他应该只能看到以sinuo开头的项目名称

::: tip
1. 测试时，浏览器开俩窗口，一个正常一个隐藏，一个修改权限，另一个刷新查看权限效果
2. 如果Role-based Authorization Strategy仍然无法满足复杂的权限控制，多搭建几套Jenkins分配给不同团队也未尝不可
:::
