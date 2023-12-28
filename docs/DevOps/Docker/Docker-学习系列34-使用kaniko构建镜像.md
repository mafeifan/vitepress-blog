Docker并不是唯一的容器化工具,可能还有更好的选择, Docker有个弊端, 需要Daemon来运行还需要root特权
比如我想在容器里构建镜像。我需要把`/var/run/docker.sock`挂载在容器里, 然后在容器里构建镜像。
导致我们可以直接执行`docker images`看到所有镜像，甚至删除他们！
在多人开发中这是非常危险的!

这里推荐使用[kaniko](https://github.com/GoogleContainerTools/kaniko), 它是一个非常好的选择。

Kaniko使用自己的“executor”执行构建步骤

下面我们来举个例子

### 1.首先创建一个secret，类型为docker-creds
```bash
export REGISTRY_SERVER=https://index.docker.io/v1/

# Replace `[...]` with the registry username
export REGISTRY_USER=[...]

# Replace `[...]` with the registry password
export REGISTRY_PASS=[...]

kubectl create secret \
    docker-registry regcred \
    --docker-server=$REGISTRY_SERVER \
    --docker-username=$REGISTRY_USER \
    --docker-password=$REGISTRY_PASS
```

### 2.创建一个pod，挂载刚创建的secret

Pod 是 K8s 中的概念

```yaml
---

apiVersion: v1
kind: Pod
metadata:
  namespace: kaniko
  name: kaniko
spec:
  containers:
  - name: kaniko
    image: gcr.io/kaniko-project/executor:debug
    args:
      - '--context=git://github.com/mafeifan/kaniko-demo'
      - '--destination=finleyma/devops-toolkit:1.0.0'
    volumeMounts:
      - name: kaniko-secret
        mountPath: /kaniko/.docker
  restartPolicy: Never
  volumes:
    - name: kaniko-secret
      secret:
        secretName: regcred
        items:
          - key: .dockerconfigjson
            path: config.json
```

镜像名称：`gcr.io/kaniko-project/executor:debug`

注意镜像参数
* `--context` 上下文，可以是仓库地址，压缩包，对象存储地址(S3等)，git仓库，本地路径等。
* `--destination` 目标镜像地址。默认是docker hub，我们还看到它使用了一个secret来获取docker配置文件，然后把它挂载到容器里。

#### 大致流程：
启动 pod，挂载 secret

去`github.com/mafeifan/kaniko-demo`拉代码，里面有一个Dockerfile，构建镜像。上传到 docker hub，名称为 `finleyma/devops-toolkit:1.0.0`。

pod退出

### 3.打开docker hub，确实发现我们的镜像已经创建成功了

https://hub.docker.com/repository/docker/finleyma/devops-toolkit

## 参考
https://github.com/GoogleContainerTools/kaniko

https://www.youtube.com/watch?v=EgwVQN6GNJg
