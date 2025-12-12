本篇告诉你：
1. 如何在 Jenkins 中添加一个远程 Docker 作为构建项目的 Cloud 
2. 如何在这个 Cloud 中指定代码仓库并打包 Docker 镜像
3. 将镜像 push 到官方的 Docker Hub 仓库

实验前提：

两台服务器，一个跑Jenkins，另一台运行Docker服务端（注意需要开放远程访问）

目前Docker已经成为众多流水线中关键的组成部分之一。
容器化具有的简单性，灵活性以及隔离性可以让我们定制特定的而且能够精确重复的环境。容器化部署也越来越流行。

关于Docker的基本概念和使用方法，可以参见我写的[系列](https://www.jianshu.com/nb/27940088)。

这里我需要两台主机(测试时可以是同一个机器)，一台运行Jenkins，另一台运行Docker，作为Jenkins的代理节点。

当Jenkins启动pipeline工作时，同时连接并启动这个代理节点，由他完成构建镜像的工作，当流水线完成之后，Jenkins会停止并删除运行这些镜像的容器，使用这种方法需要配置[Docker插件](https://github.com/jenkinsci/docker-plugin)

> 好处：Jenkins master 节点只负责调控，具体的构建任务下放到Docker代理节点中去，解决master空间不够等问题

安装插件之后Jenkins的系统配置页面会多出一个Cloud部分。
需要填写连接Docker的配置信息
Name: 给Docker主机起个别名
Docker Host URI： 如 `tcp://192.168.10.10:2375` ，连接本机Docker，如果连其他主机上的Docker服务端，需要Docker宿主机开放远程访问，具体见[Docker 学习系列21 远程连接Docker]([https://www.jianshu.com/p/90b10c6d729d](https://www.jianshu.com/p/90b10c6d729d)
)
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-f4ec2bce59d0ee51.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

集成Docker插件后，在管理Jenkins页面中会多出一个Docker入口
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-445753b14661b058.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

点击后能看到配置过的分配给Jenkins实例的Docker服务器列表
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-dc64e4ec0a66e443.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

再点进去能看到正在运行的容器和拥有的镜像

> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-b486164e0d72d04d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### Cloud 构建Docker镜像并上传到指定仓库
接下来我们新建一个 freestyle 项目

1. 配置代码仓库，注意仓库中要有Dockerfile，以我的这个[公开仓库](https://github.com/mafeifan/docker-express-demo)为例

2. Build - Add build step 添加新的构建步骤 - Build / Publish Docker Image

* Directory for Dockerfile: 因为Dockerfile就在代码中的根目录，这里不填
* Cloud：选择刚刚配置的 Docker Cloud 名字
* Image： 要打包上传的镜像名
*  Registry Credentials： 注意这里，要添加一个类型是username/password的可以登录docker仓库的credentials
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-166fb30323dc7d57.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

3. 构建，查看输出信息

> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-66d51c93000106f4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

4. 检查
Docker Hub 可以看到刚刚上传的镜像
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-9af5097fc19165dd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

同时Docker Cloud中也多出了一个刚刚打包的镜像

> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-4830bce63f8e93bb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 参考
[https://docs.docker.com/engine/reference/commandline/dockerd/#daemon-configuration-file](https://docs.docker.com/engine/reference/commandline/dockerd/#daemon-configuration-file)
[https://www.jianshu.com/p/2ad009ae95ad](https://www.jianshu.com/p/2ad009ae95ad)
[jenkins slave docker容器化](https://www.jianshu.com/p/40c7d82cb560)
