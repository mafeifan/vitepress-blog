原文：https://docs.docker.com/ci-cd/github-actions/

可以直接fork这个[项目](https://github.com/usha-mandya/SimpleWhaleDemo)练习
这里假设你已有docker hub账号，先登录，进到https://hub.docker.com/settings/security生成access token，注意好记好。
然后打开Github到`Settings > Secrets > New secret`添加两条记录：

* 键名：DOCKER_HUB_USERNAME，值是Docker hub的用户名
* 键名：DOCKER_HUB_ACCESS_TOKEN，值是刚才复制的access token，值类似c292155d-1bd7-xxxx-xxxx-4da75bedb178

关于参见 [buildx](https://segmentfault.com/a/1190000021166703)
修改`.github/workflows/main.yml`文件
```yaml
name: CI to Docker Hub 

on:
  push:
        branches: [ master ]
   # tags:
   #   - "v*.*.*"

jobs:

  build:
    runs-on: ubuntu-latest
    steps:
      -
        name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v1
      -
        name: Login to DockerHub
        uses: docker/login-action@v1 
        with:
          username: ${{ secrets.DOCKER_HUB_USERNAME }}
          password: ${{ secrets.DOCKER_HUB_ACCESS_TOKEN }}
      -
        name: Build and push
        id: docker_build
        uses: docker/build-push-action@v2
        with:
          push: true
          tags: finleyma/simplewhale:latest
          build-args: |
            arg1=value1
            arg2=value2
      -
        name: Image digest
        run: echo ${{ steps.docker_build.outputs.digest }}
```

## 参考

* https://docs.docker.com/ci-cd/github-actions/
* https://segmentfault.com/a/1190000021166703
* https://github.com/docker/build-push-action
