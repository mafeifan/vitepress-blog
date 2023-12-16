本文参照了 https://cloud.google.com/kubernetes-engine/docs/how-to/load-balance-ingress#gcloud

创建流程：创建两个 deployment 和对应的 service，最后基于这两个service创建ingress。
最终实现效果，当访问

* 当客户端将请求发送到网址路径为 "/" 的负载平衡器时，请求将被转发到端口 60000 上的 hello-world Service。

* 当客户端将请求发送到网址路径为 "/kube" 的负载平衡器时，请求将被转发到端口 80 上的 hello-kubernetes Service。

### 大致流程：
deployment -> service -> ingress

hello-kubernetes-deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello-kubernetes-deployment
spec:
  selector:
    matchLabels:
      greeting: hello
      department: kubernetes
  replicas: 3
  template:
    metadata:
      labels:
        greeting: hello
        department: kubernetes
    spec:
      containers:
        - name: hello-again
          image: "gcr.io/google-samples/node-hello:1.0"
          env:
            - name: "PORT"
              value: "8080"

```

hello-kubernetes-service.yaml
```yaml
apiVersion: v1
kind: Service
metadata:
  name: hello-kubernetes
spec:
  # 同时具有 greeting: hello 标签和 department: kubernetes 标签的任何 Pod 都是 Service 的成员。
  type: NodePort
  selector:
    greeting: hello
    department: kubernetes
  ports:
    # 当请求发送到 TCP 端口 80 上的 Service 时，它将被转发到 TCP 端口 8080 上的某个成员 Pod。
    - protocol: TCP
      port: 80
      targetPort: 8080
```

hello-world-deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello-world-deployment
spec:
  selector:
    matchLabels:
      greeting: hello
      department: world
  replicas: 3
  template:
    metadata:
      labels:
        greeting: hello
        department: world
    spec:
      containers:
        - name: hello
          image: "gcr.io/google-samples/hello-app:2.0"
          env:
            - name: "PORT"
              value: "50000"
```

hello-world-service.yaml
```yaml
apiVersion: v1
kind: Service
metadata:
  name: hello-world
spec:
  type: NodePort
  selector:
    greeting: hello
    department: world
  ports:
    - protocol: TCP
      port: 60000
      # 当请求发送到 TCP 端口 60000 上的 Service 时，它将被转发到 TCP 端口 50000 上的某个成员 Pod
      targetPort: 50000
```


选中刚创建的两个service

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2a2e733e3cb044f2927df92faef396eb~tplv-k3u1fbpfcp-watermark.image)


配置路径


![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a3363e606ec742c0963a31f95eb4d0e2~tplv-k3u1fbpfcp-watermark.image)

最后我们可以预览yaml
```yaml
---
apiVersion: "extensions/v1beta1"
kind: "Ingress"
metadata:
  name: "my-ingress"
  namespace: "default"
spec:
  rules:
  - http:
      paths:
      - path: "/*"
        backend:
          serviceName: "hello-world"
          servicePort: 60000
      - path: "/kube"
        backend:
          serviceName: "hello-kubernetes"
          servicePort: 80
```

查看刚创建的ingress
`kubectl get ingress my-ingress --output yaml`

```
status:
  loadBalancer:
    ingress:
    - ip: 34.117.148.159
```
google cloud会自动创建负载均衡器并暴露一个IP地址，比如 34.117.148.159，访问根路径和/kube会返回期望的结果拉

PS:真实情况是我怎么访问这个IP都显示超时，检查了防火墙也没有问题，无奈我联系Google cloud人工客服，虽然他们只能看懂英文，不过很好沟通。
最终确认是IP被墙了，在外国访问是正常的... 你可以打开浏览器的代理


## 参考
https://cloud.google.com/kubernetes-engine/docs/tutorials/http-balancer

https://cloud.google.com/kubernetes-engine/docs/how-to/load-balance-ingress#gcloud
