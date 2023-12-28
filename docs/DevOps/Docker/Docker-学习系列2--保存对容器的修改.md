[接上篇](https://www.jianshu.com/p/0dedba35e922)

Docker容器虽然运行起来了。

但遇到了新的问题：

1. 容器内安装的服务器是nginx，对于ThinkPHP项目，还需要一些额外的配置，简单的说在apache服务器下运行 http://localhost:8088/home/Index/index 能正常返回结果，而nginx下返回404，必须要写成  http://localhost:8088/index.php?m=home&c=Index&a=demo
所以我需要修改nginx配置文件，使其支持。
2. 由于容器本身是无状态的，如果进到容器里修改完配置文件，关闭docker，下次在启动后还是原样，我需要保存修改。

下面是解决方法：

1.  镜像为了精简并没有安装VIM编辑器，编辑文件不方便，要先安装 `apt-get update; apt-get install vim` 
注意，如果执行 apt-get update 超时了，试试翻墙。或者替换为国内源。
2. `vi /etc/nginx/sites-enabled/default` 编辑并修改配置文件，记得最好先备份
3. 修改完新开个窗口 
先执行 `docker ps ` 查看正在运行的容器，复制 container id。
然后 `docker commit [OPTIONS] CONTAINER [REPOSITORY[:TAG]]` 如 docker commit cb439fb2c714 finley/phpenv:tp3.2
commit 会基于对container的修改创建一个新的镜像
具体用法请参见官方文档：[commit](https://docs.docker.com/engine/reference/commandline/commit/)

::: warning
经查，不推荐更改运行中的容器配置，容器本身是无状态的，当然也可以通过进入容器内部的方式进行更改: docker exec -it 这样的更改是无法持久化保存的，当容器重启后，更改就丢失了，正确的做法是将需要持久化保存的数据放在挂载的存储卷中，当配置需要改变时直接删除重建。
:::

回顾：
```
# 从仓库拉镜像
docker pull eriksencosta/php-dev
# 基于上面的镜像加入了自己的修改并提交为自己的镜像，还打了tag
docker commit cb439fb2c714  finleyma/php-dev:tp3.2
```

问题：
这个项目的环境是有了，但是是多人开发，我如何将我的配好的镜像分享给他人呢？
请见下篇
