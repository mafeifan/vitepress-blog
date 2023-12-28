我们装好Jenkins后，需要安装各种插件，但是有时候安装插件经常失败，或者特别慢。
这时候我们更新为国内源.

具体方法：
系统管理 >> 管理插件 >> 高级
将 [升级站点] 更换为
https://mirrors.tuna.tsinghua.edu.cn/jenkins/updates/current/update-center.json
上面配置的是 清华大学开源软件镜像站

类似的还有 https://jenkins-zh.gitee.io/update-center-mirror/tsinghua/update-center.json

jenkins镜像地址列表
http://mirrors.jenkins-ci.org/status.html


#### 指定插件版本
最新全新安装的Jenkins并安装相关插件后发现执行流水线后报错，经过排查，是钉钉通知插件版本导致，最新的2.0在pipeline中不支持
dingtalk，需要降级使用1.9版本，具体方法：

打开 http://updates.jenkins-ci.org/download/plugins
这里列出了所有可安装的插件，然后搜索ding，进到 http://updates.jenkins-ci.org/download/plugins/dingding-notifications/

> ![image.png](https://hexo-blog.pek3b.qingstor.com/images/8927A9AE-180C-46C9-B454-9C249E0F3AB8.png)

点1.9下载，得到文件`dingding-notifications.hpi`
然后回到Jenkins插件管理页面上传即可

> ![image.png](https://hexo-blog.pek3b.qingstor.com/images/A7167A31-ABF0-4B28-A260-BCDE48311634.png)

