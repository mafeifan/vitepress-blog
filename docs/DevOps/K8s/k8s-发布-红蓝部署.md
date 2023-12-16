## 名词

**蓝绿(blue/green)：**

一句话：新版本与旧版本一起存在，然后切换流量

详细说明： 蓝绿发布，是在生产环境稳定集群之外，额外部署一个与稳定集群规模相同的新集群，并通过流量控制，逐步引入流量至新集群直至
100%，原先稳定集群将与新集群同时保持在线一段时间，期间发生任何异常，可立刻将所有流量切回至原稳定集群，实现快速回滚。直到全部验证成功后，下线老的稳定集群，新集群成为新的稳定集群。

蓝绿部署流程图

![](https://pek3b.qingstor.com/hexo-blog/hexo-blog/20210819175818.png)

蓝绿发布的流程，包括：蓝绿发布开始、蓝绿初始化、蓝绿验证、蓝绿取消或完成上线。

#### K8S中如何实现蓝绿部署

* 通过k8s service label标签来实现蓝绿发布
* 通过Ingress 控制器来实现蓝绿发布
* 通过Istio来实现蓝绿发布，或者像Istio类似的服务


#### K8S中如何实现蓝绿部署

service.yaml 文件

```yaml
apiVersion: v1
kind: Service
metadata:
  name: demo
  namespace: default
  labels:
    app: demo
spec:
  ports:
    - port: 80
      targetPort: http
      protocol: TCP
      name: http
  # 注意这里我们匹配 app 和 version 标签，当要切换流量的时候，我们更新 version 标签的值，比如：v2
  selector:
    app: demo
    version: v1
```

蓝 v1-deploy.yaml 文件

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo1-deployment
  namespace: default
  labels:
    app: demo
    version: v1
spec:
  replicas: 1
  revisionHistoryLimit: 3
  ## 滚动发布策略
  strategy:
    rollingUpdate:
      maxSurge: 30%
      maxUnavailable: 30%
  selector:
    matchLabels:
      app: demo
      version: v1
  template:
    metadata:
      labels:
        app: demo
        version: v1
    spec:
      containers:
        - name: demo1
          image: mritd/demo
          ## 存活探针
          ## https://kubernetes.io/zh/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes
          livenessProbe:
            httpGet:
              path: /
              port: 80
              scheme: HTTP
            initialDelaySeconds: 30
            timeoutSeconds: 5
            periodSeconds: 30
            successThreshold: 1
            failureThreshold: 5
          # 就绪探针
          readinessProbe:
            httpGet:
              path: /
              port: 80
              scheme: HTTP
            initialDelaySeconds: 30
            timeoutSeconds: 5
            periodSeconds: 10
            successThreshold: 1
            failureThreshold: 5
          ports:
            - name: http
              containerPort: 80
              protocol: TCP
```

绿 v2-deploy.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo2-deployment
  namespace: default
  labels:
    app: demo
    version: v2
spec:
  replicas: 1
  revisionHistoryLimit: 3
  strategy:
    rollingUpdate:
      maxSurge: 30%
      maxUnavailable: 30%
  selector:
    matchLabels:
      app: demo
      version: v2
  template:
    metadata:
      labels:
        app: demo
        version: v2
    spec:
      containers:
        - name: demo2
          image: mritd/demo
          livenessProbe:
            httpGet:
              path: /
              port: 80
              scheme: HTTP
            initialDelaySeconds: 30
            timeoutSeconds: 5
            periodSeconds: 30
            successThreshold: 1
            failureThreshold: 5
          readinessProbe:
            httpGet:
              path: /
              port: 80
              scheme: HTTP
            initialDelaySeconds: 30
            timeoutSeconds: 5
            periodSeconds: 10
            successThreshold: 1
            failureThreshold: 5
          ports:
            - name: http
              containerPort: 80
              protocol: TCP
```

上面定义的资源对象中，最重要的就是Service 中 label selector的定义：

```yaml
selector:
  app: demo
  version: v1
```

#### 部署与测试

部署v1 v2 deploy服务 和 service服务

`$ kubectl  apply -f service.yaml -f v1-deploy.yaml -f v2-deploy.yaml`

测试流量是否到v1版本

```
# 登陆任意一个pod，向 demo service 发起请求
$ while sleep 0.3; do curl http://demo; done

# 输出日志
Host: demo1-deployment-b5bd596d8-dw27b, Version: v1
Host: demo1-deployment-b5bd596d8-dw27b, Version: v1
```

切换入口流量从v1 到 v2

`$ kubectl patch service demo -p '{"spec":{"selector":{"version":"v2"}}}'`

测试流量是否到v2版本

```
# 登陆任意一个pod，向 demo service 发起请求
$ while sleep 0.3; do curl http://demo; done

# 输出日志
Host: demo2-deployment-b5bd596d8-dw27b, Version: v2
Host: demo2-deployment-b5bd596d8-dw27b, Version: v2
```

## 参考

https://cloud.tencent.com/developer/article/1638413
