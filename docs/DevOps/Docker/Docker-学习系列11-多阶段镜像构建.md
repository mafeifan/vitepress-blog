从Docker版本`17.05.0-ce`开始，就支持了一种新的构建镜像的方法，叫做：多阶段构建(Multi-stage builds)，旨在解决Docker构建应用容器中的一些痛点。
在日常构建容器的场景中，经常会遇到在同一个容器中进行源码的获取，编译和生成，最终才构建为镜像。这样做的劣势在于：

* 不得不在容器中安装构建程序所必须的运行时环境
* 不得不在同一个容器中，获取程序的源码和构建所需的一些生态工具
* 构建出的镜像甚至包含了程序源码和一些不必要的文件，导致容器镜像尺寸偏大

当然，还有一种稍微优雅的方式，就是我们事先在外部将项目及其依赖库编译测试打包好后，再将其拷贝到构建目录中，这种虽然可以很好地规避第一种方式存在的风险点，但是也需要考虑不同镜像运行时，对于程序运行兼容性所带来的差异。

其实，这些痛点，Docker也想到了，官方提供了简便的多阶段构建 (multi-stage build) 方案。所谓多阶段构建，也即将构建过程分为多个阶段，在同一个Dockerfile中，通过不同的阶段来构建和生成所需要的应用文件，最终将这些应用文件添加到一个release的镜像中。这样做能完全规避上面所遇到的一系列问题。
实现多阶段构建，主要依赖于新提供的关键字：`from`和`as`。

下面举个前端的例子：
```bash
# build stage
FROM node:9.11.1-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# production stage
FROM nginx:1.13.12-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```
第一阶段：拷贝源文件到镜像中，生成用于生产环境需要的静态资源文件
第二阶段：启动一个nginx容器，托管第一阶段的静态文件


```bash
# 编译阶段
FROM golang:1.10.3

COPY server.go /build/

WORKDIR /build

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 GOARM=6 go build -ldflags '-w -s' -o server

# 运行阶段
FROM scratch

# 从编译阶段的中拷贝编译结果到当前镜像中
COPY --from=0 /build/server /

ENTRYPOINT ["/server"]
```

这个 Dockerfile 的玄妙之处就在于 COPY 指令的 --from=0 参数，从前边的阶段中拷贝文件到当前阶段中，多个FROM语句时，0代表第一个阶段。
除了使用数字，我们还可以给阶段命名，比如：

```bash
# 编译阶段 命名为 builder
FROM golang:1.10.3 as builder

# ... 省略

# 运行阶段
FROM scratch

# 从编译阶段的中拷贝编译结果到当前镜像中
COPY --from=builder /build/server /
```

更为强大的是，COPY --from 不但可以从前置阶段中拷贝，还可以直接从一个已经存在的镜像中拷贝。比如，

```bash
FROM ubuntu:16.04

COPY --from=quay.io/coreos/etcd:v3.3.9 /usr/local/bin/etcd /usr/local/bin/
```

我们直接将etcd镜像中的程序拷贝到了我们的镜像中，这样，在生成我们的程序镜像时，就不需要源码编译etcd了，直接将官方编译好的程序文件拿过来就行了。

有些程序要么没有apt源，要么apt源中的版本太老，要么干脆只提供源码需要自己编译，使用这些程序时，我们可以方便地使用已经存在的Docker镜像作为我们的基础镜像。
但是我们的软件有时候可能需要依赖多个这种文件，我们并不能同时将 nginx 和 etcd 的镜像同时作为我们的基础镜像（不支持多根），这种情况下，使用 `COPY --from` 就非常方便实用了。

多阶段构建的Dockerfile看起来像是把两个或者更多的Dockerfile合并在了一起，这也即多阶段的意思。
`as`关键字用来为构建阶段赋予一个别名，这样，在另外一个构建阶段中，可以通过`from`关键字来引用和使用对应关键字阶段的构建输出，并打包到容器中。

甚至，我们还可以使用更多的构建阶段来构建不同的应用，最终将这些构建产出的应用，合并到一个最终需要发布的镜像中。
我们可以看一个更复杂一点的栗子：

```bash
from debian as build-essential
arg APT_MIRROR
run apt-get update
run apt-get install -y make gcc
workdir /src

from build-essential as foo
copy src1 .
run make

from build-essential as bar
copy src2 .
run make

from alpine
copy --from=foo bin1 .
copy --from=bar bin2 .
cmd ...
```

再来一个Laravel项目的多阶段构建( 自己加的内容)
第一阶段：使用compose安装PHP依赖
第二阶段：安装node，并安装前端依赖然后生成编译后的文件
第三阶段：拷贝PHP依赖及前端build后的文件到项目运行目录
```bash
#
# PHP Dependencies
#
FROM composer:1.7 as vendor

COPY database/ database/

COPY composer.json composer.json
COPY composer.lock composer.lock

RUN composer install \
    --ignore-platform-reqs \
    --no-interaction \
    --no-plugins \
    --no-scripts \
    --prefer-dist

#
# Frontend
#
FROM node:8.11 as frontend

RUN mkdir -p /app/public

COPY package.json webpack.mix.js yarn.lock /app/
COPY resources/assets/ /app/resources/assets/

WORKDIR /app

RUN yarn install && yarn production

#
# Application
#
FROM php:7.2-apache-stretch

COPY . /var/www/html
COPY --from=vendor /app/vendor/ /var/www/html/vendor/
COPY --from=frontend /app/public/js/ /var/www/html/public/js/
COPY --from=frontend /app/public/css/ /var/www/html/public/css/
COPY --from=frontend /app/mix-manifest.json /var/www/html/mix-manifest.json
```

多阶段构建的好处不言而喻，既可以很方便地将多个彼此依赖的项目通过一个Dockerfile就可轻松构建出期望的容器镜像，并且不用担心镜像太大、源码泄露等风险。
不得不说，这是一个非常不错的改进。

### 参考：
* https://docs.docker.com/develop/develop-images/multistage-build/
* https://yq.aliyun.com/articles/181178
* https://laravel-news.com/multi-stage-docker-builds-for-laravel
* https://maichong.io/help/docker/dockerfile-multi-stage.html
