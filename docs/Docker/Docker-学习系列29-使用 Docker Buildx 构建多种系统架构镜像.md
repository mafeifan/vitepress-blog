Docker Buildx 是一个 docker CLI 插件，其扩展了 docker 命令，支持 Moby BuildKit 提供的功能。提供了与 docker build 相同的用户体验，并增加了许多新功能。
BuildKit 是下一代的镜像构建组件，主要特点有很多，本文主要使用其可以编译多种系统架构的特性。

网址：https://github.com/moby/buildkit

需要注意的是，该功能仅适用于 Docker v19.03+ 版本。


本文将讲解如何使用 Buildx 构建多种系统架构的镜像。
在开始之前，已经默认你在 Linux 系统（各大发行版）下安装好了 64 位的 Docker。
在写本文时，Docker 最新版本号是 20.10.0。


```
$ docker version

Client: Docker Engine - Community
 Version:           20.10.0
 API version:       1.41
 Go version:        go1.13.15
 Git commit:        7287ab3
 Built:             Tue Dec  8 18:59:53 2020
 OS/Arch:           linux/amd64
 Context:           default
 Experimental:      true

Server: Docker Engine - Community
 Engine:
  Version:          20.10.0
  API version:      1.41 (minimum version 1.12)
  Go version:       go1.13.15
  Git commit:       eeddea2
  Built:            Tue Dec  8 18:57:44 2020
  OS/Arch:          linux/amd64
  Experimental:     false
 containerd:
  Version:          1.4.3
  GitCommit:        269548fa27e0089a8b8278fc4fc781d7f65a939b
 runc:
  Version:          1.0.0-rc92
  GitCommit:        ff819c7e9184c13b7c2607fe6c30ae19403a7aff
 docker-init:
  Version:          0.19.0
  GitCommit:        de40ad0
ubuntu@VM-16-4-ubuntu:~$
```

### 1. 启用 Buildx
buildx 命令属于实验特性，因此首先需要开启该特性。
上面的查看 Docker 版本返回的内容中，如果出现`Experimental: true`字样就代表已经开启该特性了。
下面的这一步骤就可以省略。
编辑`~/.docker/config.json` 文件，新增如下内容（以下的演示适用于事先不存在 .docker 目录的情况下）
```
$ mkdir ~/.docker
$ cat > ~/.docker/config.json <<EOF
{
"experimental": "enabled"
}
EOF
```
Linux/macOS 下或者通过设置环境变量的方式（不推荐）：

`$ export DOCKER_CLI_EXPERIMENTAL=enabled`


### 2. 新建 builder 实例

在 Docker 19.03+ 版本中可以使用 docker buildx build 命令使用 BuildKit 构建镜像。该命令支持 --platform 参数可以同时构建支持多种系统架构的 Docker 镜像，大大简化了构建步骤。

由于 Docker 默认的 builder 实例不支持同时指定多个 --platform ，我们必须首先创建一个新的 builder 实例。
`$ docker buildx create --name mybuilder --driver docker-container`

返回新的 builder 实例名，为「mybuilder」

`mybuilder`

使用新创建好的 builder 实例

`$ docker buildx use mybuilder`

查看已有的 builder 实例

```
$ docker buildx ls
NAME/NODE    DRIVER/ENDPOINT             STATUS   PLATFORMS
mybuilder *  docker-container
  mybuilder0 unix:///var/run/docker.sock inactive 
default      docker
  default    default                     running  linux/amd64, linux/386
```

Docker 在 linux/amd64 系统架构下是不支持 arm 架构镜像，因此我们可以运行一个新的容器（emulator）让其支持该特性，Docker 桌面版则无需进行此项设置。
* 方法一：

`$ docker run --rm --privileged docker/binfmt:a7996909642ee92942dcd6cff44b9b95f08dad64`

注：docker/binfmt 可以参考网址：https://hub.docker.com/r/docker/binfmt/tags 获取最新镜像

* 方法二（推荐）：

`$ docker run --rm --privileged tonistiigi/binfmt --install all`

去参考网址：https://hub.docker.com/r/tonistiigi/binfmt 获取最新镜像。目前（2021/09/02 更新）的 Qemu version: 6.0.0

### 3. 新建 Dockerfile 文件
要想构建多种系统架构的镜像，还需要一个支持的 Dockerfile 文件。
以下是一个示例的 Dockerfile 文件。
参考链接：https://github.com/teddysun/across/blob/master/docker/kms/Dockerfile.architecture

该 Dockerfile 文件内容如下：

```
FROM --platform=$TARGETPLATFORM alpine:latest AS builder
WORKDIR /root
RUN apk add --no-cache git make build-base && \
    git clone --branch master --single-branch https://github.com/Wind4/vlmcsd.git && \
    cd vlmcsd/ && \
    make

FROM --platform=$TARGETPLATFORM alpine:latest
LABEL maintainer="Teddysun <i@teddysun.com>"

COPY --from=builder /root/vlmcsd/bin/vlmcsd /usr/bin/vlmcsd
EXPOSE 1688
CMD [ "vlmcsd", "-D", "-e" ]
```

`$TARGETPLATFORM` 是内置变量，由 --platform 参数来指定其值。
由于是基于 alpine 的镜像来制作的，而 alpine 是支持以下 7 种系统架构的，因此我们制作的镜像也就跟着支持这 7 种系统架构。

`linux/amd64, linux/arm/v6, linux/arm/v7, linux/arm64, linux/386, linux/ppc64le, linux/s390x`

更友好一点的架构名称如下：

`amd64, arm32v6, arm32v7, arm64v8, i386, ppc64le, s390x`

这里穿插一句吐槽。
简单统计了一下，ARM 的系统架构有如下各种简称：
```
arm64, armv8l, arm64v8, aarch64
arm, arm32, arm32v7, armv7, armv7l, armhf
arm32v6, armv6, armv6l, arm32v5, armv5,  armv5l, armel, aarch32
```

看完了是不是很想打人？
而对比 Intel 和 AMD 的就简单多了：
```
x86, 386, i386, i686
x86_64, x64, amd64
```

### 4. 构建镜像
先来本地构建一个。

git clone 刚才的示例 Dockerfile 文件，并进入其目录下

`$ cd ~ && git clone https://github.com/teddysun/across.git && cd across/docker/kms/`

在本地构建支持 7 种 platform 的镜像

`$ docker buildx build --platform linux/amd64,linux/arm/v6,linux/arm/v7,linux/arm64,linux/ppc64le,linux/s390x,linux/386 -t teddysun/kms -o type=local,dest=.docker -f ./Dockerfile.architecture .`

docker buildx build 的具体参数含义，参考下面的官方文档
https://docs.docker.com/engine/reference/commandline/buildx_build/

做完上面的那一步，实际上是把构建好的镜像放在了本地路径下。
此时我们再来查看一下已有的 builder 实例。

```
$ docker buildx ls
NAME/NODE    DRIVER/ENDPOINT             STATUS  PLATFORMS
mybuilder *  docker-container                    
  mybuilder0 unix:///var/run/docker.sock running linux/amd64, linux/arm64, linux/riscv64, linux/ppc64le, linux/s390x, linux/386, linux/arm/v7, linux/arm/v6
default      docker                              
  default    default                     running linux/amd64, linux/386
```

你会发现 mybuilder 下存在 8 种支持的架构（riscv64 目前还用不上，但是已经支持）。

此时查看一下 docker image 的运行情况，会发现存在一个名为 `buildx_buildkit_mybuilder0` 的容器在运行。
这是刚才在本地构建时，自动创建的，切记不要将其停止，也不要删除。

```
$ docker ps -as
CONTAINER ID        IMAGE                           COMMAND           CREATED             STATUS              PORTS             NAMES                        SIZE
be753fa16090        moby/buildkit:buildx-stable-1   "buildkitd"       15 minutes ago      Up 15 minutes                         buildx_buildkit_mybuilder0   0B (virtual 78.6MB)
```

再来构建一个多系统架构镜像，并将构建好的镜像推送到 Docker 仓库（也就是 hub.docker.com）。

在此操作之前，你需要事先注册一个账号（演示过程省略），并登录。
登录命令如下：

`$ docker login`

输入你的用户名和密码即可登录。

注意，以下演示的命令中 tag 的前面是我的用户名 finley，如果你想制作自己的镜像，请自行替换为你自己的用户名。
使用 `--push` 参数构建好的镜像推送到 Docker 仓库。
此时仍然是在刚才的 ~/across/docker/kms 目录下，文件 `Dockerfile.architecture` 是为多系统架构构建准备的。
命令如下：

`$ docker buildx build --platform linux/386,linux/amd64,linux/arm/v6,linux/arm/v7,linux/arm64,linux/ppc64le,linux/s390x -t finley/kms --push -f ./Dockerfile.architecture .`

命令执行成功后，你就会在 Docker Hub 看到你上传的镜像啦。


### 5. 写在最后
在制作多系统架构的 Docker 镜像时，建议使用 CPU 比较强或者多核心的 VPS 来构建，否则会非常耗时。

## 参考

https://github.com/moby/buildkit

https://teddysun.com/581.html

https://kubesphereio.com/post/docker-image-operation-guide-for-building-arm-x86-architecture/
