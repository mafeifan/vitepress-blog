我们以这个[tarampampam/node-docker](https://github.com/tarampampam/node-docker)

这个是我自己常用的镜像，作者制作的很优秀，有以下特点：

1. 基于官方的[node基础镜像](https://hub.docker.com/_/node?tab=tags)，加入了git,bash,openssh这三个常用的工具
2. 支持多个arm64，armv7，amd64等5种架构
3. 基于Github actions同步官方镜像的tag，每小时重新制作，举个例子，目前node的文档版本是v14，
我如果 `docker run tarampampam/node:lts-alpine`, `node -v` 会返回14，这样没错。
但是如果第二天官方的lts变为了node16。`tarampampam/node:lts-alpine`也需要更新为16。
Github actions支持定时任务的，作者写了个[脚本](https://github.com/tarampampam/node-docker/blob/master/.github/scripts/utils.js)，
每小时去[Dockerhub](https://hub.docker.com/_/node?tab=tags)抓tag，和上游保持更新。

阅读他的代码可以学习github actions一些知识，回头我再详细介绍

