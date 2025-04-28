在 Gitlab Pipeline 里我们经常要将代码打包为 docker image 并推送到镜像仓库，而为了完成 docker push
动作需要定义 `service: ['docker:dind']`，不然 docker push 无法成功

典型的流水线例子如下：

```yaml
stages: 
  - create-image
build-image-job:
  stage: create-image
  image: docker
  services:
    - docker:dind
  script:
    - echo $CI_REGISTRY_PASSWORD | docker Login -U $CI_REGISTRY_USER $CI_REGISTRY --password-stdin
    - docker build -t $$CI_REGISTRY_IMAGE/myapp:1.2-
    - docker push $$CI_REGISTRY_IMAGE/myapp:1.2-
    - docker images
```

为什么非得定义 services 呢？

这里先从Docker的 C/S 架构讲起

## Docker 的 C/S（客户端/服务器）架构

Docker 采用典型的 C/S（客户端/服务器）架构
```aiignore
┌─────────────────┐      REST API       ┌─────────────────────────────┐
│   Docker 客户端  │<─────────────────── │      Docker 服务器           │
│   (docker CLI)  │    HTTP/UNIX Socket │     (Docker Daemon)         │
└─────────────────┘                     │   ┌─────────────────────┐   │
                                        │   │  Containers         │   │
                                        │   │  Images             │   │
                                        │   │  Networks           │   │
                                        │   │  Volumes            │   │
                                        │   └─────────────────────┘   │
                                        └─────────────────────────────┘
```

### 组件说明


#### 客户端 (Client)

* Docker CLI (docker 命令)
* Docker API 客户端
* Docker Compose
* 其他第三方工具
* 服务器 (Server)

#### 服务端 Docker daemon (dockerd)
* 容器运行时 (containerd)
* 存储驱动
* 网络驱动
* 插件系统

### 工作流程

1. 用户输入 docker 命令
2. Docker CLI 解析命令
3. 通过 API 发送请求到 daemon
4. Daemon 处理请求
5. 返回结果给客户端

示例：运行容器:

docker run nginx
```
│
├─► 1. CLI 解析命令
│
├─► 2. 发送 API 请求到 daemon
│
├─► 3. Daemon 检查本地是否有镜像
│
├─► 4. 如无镜像则从仓库拉取
│
├─► 5. 创建并启动容器
│
└─► 6. 返回容器 ID 给客户端
```

### 客户端环境变量

```bash
# 指定 Docker daemon 地址
DOCKER_HOST=tcp://remote-host:2375

# 指定 TLS 设置
DOCKER_TLS_VERIFY=1
DOCKER_CERT_PATH=/path/to/certs
```

### 优势

* 客户端和服务器可以分开部署
* 支持远程管理
* 便于第三方集成
* 支持 TLS 加密
* 可以通过 API 开发自定义工具

### 常见使用场景

本地开发: 

```
docker ps
```

远程管理: 
```
# 通过 TCP 连接远程 daemon
docker -H tcp://remote:2375 ps
```

## 进一步

### 深入了解镜像 docker 和 docker:dind 的具体区别

打开 `https://hub.docker.com/_/docker` 仔细阅读

发现 docker镜像 `docker:28`, `docker:dind`, `docker:28-dind` 是等价的

而 `docker:cli`, `docker:28-cli` 也是等价的，只不过 tag 不一样

进一步查看他们的 Dockerfile: [docker:dind](https://github.com/docker-library/docker/blob/master/28/dind/Dockerfile) 和 [docker:cli](https://github.com/docker-library/docker/blob/master/28/cli/Dockerfile)
直接扔给 Gemini 帮忙分析对比，对于 Docker28 版本的 Dockerfile 得出以下结论：

### docker:cli
* docker:cli 是基于 alpine:3.21
* docker:cli 安装的有 docker 命令行工具, buildx插件,docker-compose插件

### docker:dind 
* docker:dind 是基于 docker:cli, 包含了 docker:cli 的所有功能,并在此基础上增加了运行 Docker daemon 所需的额外组件
* 额外组件有 git, iptables(IPv4 防火墙), ip6tables(IPv6 防火墙), openssl(SSL 支持), xz, zfs, pigz, e2fsprogs 等文件系统工具
* 额外组件还有 dockerd (Docker daemon), containerd, ctr, runc 这些容器运行时工具
* 暴露端口 EXPOSE 2375 2376  # Docker daemon API 端口
* 特有的存储卷, VOLUME /var/lib/docker  # Docker 持久化存储

### 使用场景

* docker:cli:
  * 适用于只需要执行 Docker 命令的场景
  * 需要连接外部 Docker daemon
  
* docker:dind:
  * 适用于需要完整 Docker 环境的场景
  * 可以独立运行容器
  * CI/CD 环境中的容器构建

### 网络配置

* docker:cli:
    * 无特殊网络要求
* docker:dind:
  * 需要暴露 Docker daemon 端口
  * 需要配置网络隔离

## 参考

https://docs.gitlab.com/ci/services/

https://docs.docker.com/reference/cli/dockerd/
