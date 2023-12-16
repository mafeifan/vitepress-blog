软件世界比以往任何时候都更快。为了保持竞争力，在既要求尽快推出新的软件版本的同时，还需要避免中断活跃用户访问，影响用户体验。越来越多企业已将其应用迁移到 Kubernetes 集群。

在 Kubernetes 中有几种不同的方式发布应用，所以为了让应用在升级期间依然平稳提供服务，选择一个正确的发布策略就非常重要了，本篇文章将讲解如何在 Kubernetes 使用滚动更新的方式更新镜像。

## 原理

策略定义为 RollingUpdate 的 Deployment。滚动更新通过逐个替换实例来逐步部署新版本的应用，直到所有实例都被替换完成为止，会有新版旧版同时存在的情况。

```yaml
spec:
  replicas: 4
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 0                    # 决定了配置中期望的副本数之外，最多允许超出的 pod 实例的数量
      maxUnavailable: 25%            # 决定了在滚动升级期间，相对于期望副本数能够允许有多少 pod 实例处于不可用状态
```

上述更新策略执行结果如下图所示

![](https://pek3b.qingstor.com/hexo-blog/hexo-blog/20210819174001.png)

## 使用 Kubernetes 原生方式升级应用

#### 准备
image

```
bebullish/demo:v1
bebullish/demo:v2
```

deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo-dp
spec:
  selector:
    matchLabels:
      app: demo
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%
      maxUnavailable: 25%
  template:
    metadata:
      labels:
        app: demo
    spec: 
      containers:
      - name: demo
        image: bebullish/demo:v1
        ports:
        - containerPort: 8080
```

service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: demo-service
spec:
  selector:
    app: demo
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 8080
    protocol: TCP
```

将上述 `deployment` 以及 `service` 保存为 yaml 文件，使用 `kubectl apply -f` 命令创建 yaml 资源，等待创建成功后，使用 `kubectl get svc` 获取 `EXTERNAL-IP`。

#### 测试
如果使用浏览器测试的话，你会发现每次调用都会返回同一个 pod 的名字，那是因为浏览器发出的请求包含 keepAlive，所以需要使用 curl 来保证每次发出的请求都是重新创建的。

`curl -X GET http://${EXTERNAL-IP}`

![](https://pek3b.qingstor.com/hexo-blog/hexo-blog/20210819174528.png)

#### 升级

升级之前先执行命令，以便查看镜像更新过程

`while true; do curl -X GET http://49.232.125.218 ; done`

更新镜像

`kubectl set image deployment demo-dp demo=bebullish/demo:v2`

#### 查看日志

![](https://pek3b.qingstor.com/hexo-blog/hexo-blog/20210819174649.png)

#### 结论
首先可以发现在更新过程中，程序保持一直可用的状态，在出现了 v2 版本之后，还会出现 v1 版本的日志，说明在这个期间 v1 和 v2 版本是同时存在的，等到 v2 版本的 pod 全部处于就绪状态之后，可以看到所有的请求就都是 v2 版本的了。

## 参考

https://help.coding.net/docs/best-practices/cd/rolling-release.html
