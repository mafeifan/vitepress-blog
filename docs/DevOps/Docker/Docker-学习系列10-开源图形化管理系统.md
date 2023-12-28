2019-11-6 更新 [lazydocker](https://github.com/jesseduffield/lazydocker) 终端UI的docker和docker-compose

2019-3-8 更新 [dockstation](https://dockstation.io/) Docker的GUI管理工具
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-aaad497aabec7f5e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-cab0bbf35db95f74.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



#### 为什么需要docker图形化管理平台？
命令行虽然效率高，但太专业，不够直观，而且多主机管理不方便。
图形化管理系统还可以和用户角色管理等关联起来。不用太多的专业知识也能很快上手。
#### 都有哪些开源免费的docker图形化管理平台？
截至当前(2018年) Rancher 和 portainer 比较火，star数量都将近1w。还有个shipyard，但是作者已经停止维护，并推荐使用前面两款。

Portainer 比 Rancher 要轻量，如果刚接触 Docker，建议先使用这个。如果要图形化管理 Kubernetes  就用 Rancher。

## Portainer - 轻量的 Docker UI管理系统

> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-eaa69a845ab89428.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-93857d2ec1052009.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

先看下 Portainer ，以 Windows 为例，Portainer 可以运行在容器中，也可以下载编译后的包。比如这里我下载的是 portainer-1.19.2-windows-amd64.tar.gz

下载最新的发行版本 https://github.com/portainer/portainer/releases
解压到新建的portainer目录中，这个目录底下再新建保存数据的目录 portainer_data
打开命令行执行下面的命令，然后浏览器就可以访问了
`./portainer.exe -p :9000 --template-file templates.json --data ./portainer_data/`

具体细节参考：
https://portainer.readthedocs.io/en/latest/deployment.html#quick-start
关于在Windows运行的教程
http://blog.airdesk.com/2017/10/windows-containers-portainer-gui.html

## Rancher - 针对 Kubernetes 企业级管理系统

文档： [Rancher](https://rancher.com/docs/rancher/v2.x/en/quick-start-guide/deployment/quickstart-manual-setup/) 。

下面放几张图：
1. 装好后，打开先让设置管理员密码：
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-9d7720d226bc6f2d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
2. 然后让添加一个集群，先修改语言为中文。
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-f3ffd82a4feaf9d4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
3. 填写信息，呃，好像是配置Kubernates。还没有研究到这里
先到这里吧。有空再研究。
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-02cafc5cb18c7063.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-16d6303508e1d675.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## cadvisor - 容器监控工具 
有时候需要监控每个容器的运行情况。
google出品了[cAdvisor](https://github.com/google/cadvisor)
运行后，可打开web界面查看所有的容器， 镜像。
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-f86d81e3bc40d1ea.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

点击某容器，可查看具体的CPU，内存，网络，文件系统的运行情况
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-7404a3e9f389222e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-5c06e6e73103654e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

cAdvisor提供的页面非常简洁。
页面上的数据可以通过他[暴露的API](https://github.com/google/cadvisor/blob/master/docs/api.md)直接获取，可以把 cAdvisor 定位为一个监控数据收集器，收集和导出数据是它的强项，而非展示数据。所以可以结合其他工具一块使用。

## lazydocker - 终端用户界面
lazydocker，一个简单的 docker 和 docker-compose 终端用户界面，用更懒惰的方式来管理所有的 docker。

其界面采用 gocui 开发。
> ![image.png](https://static.oschina.net/uploads/space/2019/0630/141740_uL43_3734192.gif)

