来源：https://docker-curriculum.com/
这篇文章不错，可以作为第一篇 docker 的入门，我简单总结了下。顺便重温下之前的内容。
如果你是刚学docker，最好跟着敲一遍。

1. 安装Docker，略过，请自行去官方文档查
2. 执行 `docker pull busybox` 去官方拉镜像
BusyBox 是一个集成了三百多个最常用Linux命令和工具的软件。
简单的说BusyBox就好像是个大工具箱，它集成压缩了 Linux 的许多工具和命令，也包含了 Android 系统的自带的shell。
3. 使用 `docker images` 查看镜像
4. 创建容器启动 `docker run busybox`
会看到啥都没有发生，因为没有提供任何命令，容器启动后，运行个空命令就退出了。
5. 如果提供个命令呢 `docker run busybox echo "hello from busybox"`
这个能看到输出了，但是容器执行完依然退出了。
6. 我想查看正在运行的容器 `docker ps`
没有任何输出
试试 `docker ps -a` 可以看到刚刚运行过的容器了，注意 status 列
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-d2b328d30cc4fd03.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
7. 如果想以交互式方式运行容器，并进入容器终端，就用 `docker run -it busybox sh` 注意 -it 一般是同时出现的
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-cd0c5ba98c0a9f31.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

::: tip
* `-t`  tty的缩写 终端控制台
* `-i`  interactive 可交互缩写

如果想知道 run 后面都能带什么参数及含义，请使用 `docker run --help`
:::

8. 一些术语：
* Docker Daemon - Docker为C/S架构，服务端为docker daemon，在后台运行，用于管理，构建，分发容器
* Docker Client - 就是经常用的命令行工具
* Docker Hub - 分享，查找镜像资源的网站

## WEBAPPS WITH DOCKER
9. 我们运行一个容器 `docker run --rm prakhar1989/static-site`  
[prakhar1989/static-site](https://hub.docker.com/r/prakhar1989/static-site/) 是作者维护的镜像
`--rm  当退出容器时自动移除`
这里容器启动会显示了 nginx is running，但没有告诉更多的信息
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-48370494e43ee722.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
按 ctrl+c 退出
10. 使用  `docker run -d -P --name static-site prakhar1989/static-site`
-d  放到后台运行
-P 将容器内应用运行使用的端口暴露出来 （ Publish all exposed ports to random ports）
--name 给容器起个名字

> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-7fcb7ac5b3b368cb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

端口有了，可以打开站点了，还可以使用 `docker run -p 8888:80 prakhar1989/static-site` 指定端口
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-8372f40ed3291b96.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

同时运行了两个容器
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-6e2b30efb61a838f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

11. 暂停容器用 `docker stop static-site` static-site 是我们给运行时给容器起的名字，也可以用ID
12. 后面内容是使用 Dockerfile 构建自己的镜像并上传到AWS。由于之前讲过而且aws国内使用不方便，此处略过。
13. 当docker安装后，会自动创建三个网络
```bash
$ docker network ls
NETWORK ID          NAME                DRIVER              SCOPE
c2c695315b3a        bridge              bridge              local
a875bec5d6fd        host                host                local
ead0e804a67b        none                null                local
```
默认使用的是 bridge 桥接。使用 `docker network inspect bridge` 在 Containers 下面看到正在使用该网络方式的所有容器。默认所有的容器都会使用bridge，通过刚才的命令还可以看到每个容器分配到的内部IP。 一般是 172.17.0.xx。 为了安全及方便，我们需要使某几个容器之间使用自己的桥接网络，如何做到呢？

14. 使用 `docker network` 创建一个新的bridge网络，比如 `docker network create foodtrucks-net`
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-91bd41ce9bebd25f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
15. 运行 Elasticsearch 容器并把刚创建的网络分配给他
`docker run -d --name es --net foodtrucks-net -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:6.3.2`
16. 然后运行Python Flask 容器，并进到bash终端
`docker run -it --rm --net foodtrucks-net finleyma/foodtrucks-web bash`
来测试下能否访问到 Elasticsearch 容器
`curl es:9200` 
::: tip
访问容器网络没有输入容器的IP地址，用的容器名称表示，这种能力叫 automatic service discovery，自动服务发现，原理也比较简单
/etc/hosts 里有条记录，es为键名，值就是实际IP，由于IP是动态的，使用名字更不容易出错。
:::
备注：elasticsearch挺占内存的，我服务器4G内存，在docker运行启动后出现了警告
