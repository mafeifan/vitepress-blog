## Docker In Docker 

就是在docker内运行Docker,一个常用的场景是我们用Docker起了一个Jenkins，Jenkins构建项目的时候，为了保证项目环境是干净的，
也需要拉一个docker镜像，把项目放到干净的容器中。

## 在Docker容器中运行Docker
在Docker中实现Docker的三种方法

1. 通过挂载docker.sock（DooD方法）运行docker
2. dind 方法
3. 使用Nestybox sysbox Docker运行时

### 方法1：使用[/var/run/docker.sock]的Docker中运行Docker
`/var/run/docker.sock`是默认的Unix套接字。套接字用于在同一主机上的进程之间进行通信。
Docker守护程序默认情况下侦听docker.sock。
如果您在运行Docker守护程序的主机上，则可以使用`/var/run/docker.sock`管理容器。

例如，如果运行以下命令，它将返回docker engine的版本。

`curl --unix-socket /var/run/docker.sock http://localhost/version`

要在docker内部运行docker，要做的只是在默认Unix套接字docker.sock作为卷的情况下运行docker。
`-v /var/run/docker.sock:/var/run/docker.sock`

::: warning
如果您的容器可以访问docker.sock，则意味着它具有对docker守护程序的更多特权。因此，在实际项目中使用时，请了解并使用安全隐患。
因为容器的docker可以访问并删除宿主机的所有镜像
:::

现在，从容器中应该能够执行docker命令来构建镜像并将其推送到镜像仓库。
在这里，实际的docker操作发生在运行docker容器的VM主机上，而不是在容器内部进行。
意思是，即使您正在容器中执行docker命令，也指示Docker客户端通过以下docker.sock方式连接到VM主机docker-engine。

上面的意思是，假如Jenkins是运行在容器中，在Jenkins中执行`docker run...`和在服务器上(就是宿主机)直接执行`docker run`效果一样。
这样很方便，但是也比较危险。

### 方法2：Docker In Docker

此方法实际上在容器内部创建一个子容器。仅当确实要在容器中包含容器和镜像时才使用此方法。
否则，建议使用第一种方法。为此，只需要使用带有dind标签的官方docker镜像即可。

建立一个以`docker:dind`为镜像，名字为some-docker的docker容器

`docker run --privileged --name some-docker -v /my/own/var-lib-docker:/var/lib/docker -d docker:dind`

使用exec登录到容器。
`docker exec -it some-docker /bin/sh`

登录后可以执行docker build等docker命令了

::: warning
为了对主机环境的完全访问，--privileged 特权模式是必须的
:::

### 方法3：使用Sysbox运行时的Docker中的Docker

[Sysbox](https://github.com/nestybox/sysbox) 是nestybox公司旗下的一款产品，当允许Docker容器充当虚拟服务器，
能够在其中运行Systemd、Docker和Kubernetes等软件，操作容易且具有适当的隔离。

比前两种好处是避免了访问宿主机

1. 安装sysbox运行时环境
2. 使用sysbox运行时标志启动docker容器，还使用官方的docker:dind镜像
`docker run --runtime=sysbox-runc --name sysbox-dind -d docker:dind`
3. 进入sysbox-dind容器
`docker exec -it sysbox-dind /bin/sh
4. 可以在里面构建docker镜像了

## 总结

使用docker.sock和dind方法在docker中运行docker的安全性较差，因为它具有对docker守护程序的完全特权


## 参考

https://forum.gitlab.com/t/why-services-docker-dind-is-needed-while-already-having-image-docker/43534/7
