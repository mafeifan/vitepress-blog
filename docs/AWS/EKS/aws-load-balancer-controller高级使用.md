AWS Load Balancer Controller 是一个控制器，用于帮助管理Kubernetes集群的弹性负载平衡器。

一般我们在EKS上安装AWS Load Balancer Controller附加组件，然后定义ingress，AWS Load Balancer Controller会自动帮我们创建ALB或NLB了


### 传统ingress写法

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    alb.ingress.kubernetes.io/healthcheck-interval-seconds: "300"
    alb.ingress.kubernetes.io/healthcheck-path: /
    alb.ingress.kubernetes.io/healthcheck-protocol: HTTP
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}]'
    alb.ingress.kubernetes.io/load-balancer-name: alb-demo
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/success-codes: "200"
    alb.ingress.kubernetes.io/target-type: ip
  name: alb-demo
  namespace: demo
spec:
  ingressClassName: alb
  rules:
  - http:
      paths:
      - backend:
        path: /*
        pathType: ImplementationSpecific
        service:
          name: svc-nginx
          port:
            number: 80
```

![](https://pek3b.qingstor.com/hexo-blog/202405271135505.png)


```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: alb-demo
  namespace: demo
  annotations:
    alb.ingress.kubernetes.io/healthcheck-interval-seconds: "300"
    alb.ingress.kubernetes.io/healthcheck-path: /
    alb.ingress.kubernetes.io/healthcheck-protocol: HTTP
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}]'
    alb.ingress.kubernetes.io/load-balancer-name: alb-demo
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/success-codes: "200"
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/conditions.rule-header: >
      [{"field":"http-header","httpHeaderConfig":{"httpHeaderName": "X-Customer-Header", "values":["202405271135505"]}},{"field":"path-pattern","pathPatternConfig":{"values":["/*"]}}]
    alb.ingress.kubernetes.io/conditions.default-header: >
      {"type":"fixed-response","fixedResponseConfig":{"contentType":"text/plain","statusCode":"403","messageBody":"Access Deny, please contact to cndevops@x.com"}}
spec:
  ingressClassName: alb
  rules:
  - http:
      paths:
      - path: /*
        backend:
        pathType: Exact
        service:
          name: rule-header
          port:
            name: use-annotation
```

![](https://pek3b.qingstor.com/hexo-blog/202405271149140.png)

### 修改默认rule
default rule 总是一个返回固定响应404的text/plain

下面这个例子
* 添加一个 rule 并指定 target group
* 修改默认 rule，404 转为 403，并自定义响应内容

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: alb-demo
  namespace: demo
  annotations:
    alb.ingress.kubernetes.io/healthcheck-interval-seconds: "300"
    alb.ingress.kubernetes.io/healthcheck-path: /
    alb.ingress.kubernetes.io/healthcheck-protocol: HTTP
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}]'
    alb.ingress.kubernetes.io/load-balancer-name: alb-demo
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/success-codes: "200"
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/actions.rule-tg: >
      {"type":"forward","forwardConfig":{"targetGroups":[{"serviceName":"svc-nginx","servicePort":"80"}]}}
    alb.ingress.kubernetes.io/conditions.rule-tg: >
      [{"field":"http-header","httpHeaderConfig":{"httpHeaderName": "X-DEMO-Header", "values":["1234567"]}}]
    alb.ingress.kubernetes.io/actions.default: |
      {"Type":"fixed-response","FixedResponseConfig":{"ContentType":"application/json","StatusCode":"403","MessageBody":"{ \"code\" : 403, \"message\" : \"Access deny, please contact to cndevops@demo.com\"  }"}}
spec:
  ingressClassName: alb
  defaultBackend:
    service:
      name: default
      port:
        name: use-annotation
  rules:
    - http:
        paths:
          - path: /*
            pathType: ImplementationSpecific
            backend:
              service:
                name: rule-tg
                port:
                  name: use-annotation
```


### 使用 ingressgroup 合并多个 ingress, 使用支持多种协议
IngressGroup功能能够将多个Ingress资源分组在一起。

controller将自动合并IngressGroup内所有Ingress的Ingress规则，并创建单个ALB。

此外，Ingress上定义的大多数注释仅适用于该Ingress定义的路径。

默认情况下，Ingresses不属于任何IngressGroup，我们将其视为由Ingress本身组成的“隐式IngressGroup”。

比如，适用于一个LB关联多个目标组，一个目标组要支持grpc协议，另外一个支持http1协议

要建两个ingress，name不一样，但要有相同的annotation `alb.ingress.kubernetes.io/group.name`

第一个 ingress 支持 https
```yaml
kind: Ingress
apiVersion: networking.k8s.io/v1
metadata:
  name: nginx-http
  namespace: demo
  labels:
    app: grpcserver
    environment: dev
  annotations:
    alb.ingress.kubernetes.io/certificate-arn: >-
      arn:aws-cn:acm:cn-north-1:xxxxxx:certificate/7010f433-9d60-xxxx-xxxx-ecbcd772e3ad
    alb.ingress.kubernetes.io/group.name: demo-ingress-group
    # 注意监听规则的优先级，值越高越靠前
    alb.ingress.kubernetes.io/group.order: '10'
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTPS":443}]'
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
spec:
  ingressClassName: alb
  rules:
    - host: grpcserver.dev.mafeifan.com
      http:
        paths:
          - path: /hello
            pathType: Prefix
            backend:
              service:
                name: svc-nginx
                port:
                  number: 80
```

第二个 ingress 支持 grpc, 最终只创建一个 ALB

> 这种方法也适用于不同命名空间的ingress

```yaml
kind: Ingress
apiVersion: networking.k8s.io/v1
metadata:
  name: grpcserver
  namespace: demo
  labels:
    app: grpcserver
    environment: dev
  annotations:
    alb.ingress.kubernetes.io/backend-protocol-version: GRPC
    # 注意监听规则的优先级，值越高越靠前
    alb.ingress.kubernetes.io/group.order: '100'
    alb.ingress.kubernetes.io/certificate-arn: >-
      arn:aws-cn:acm:cn-north-1:xxxxxx:certificate/7010f433-9d60-xxxx-xxxx-ecbcd772e3ad
    alb.ingress.kubernetes.io/group.name: demo-ingress-group
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}, {"HTTPS":443}]'
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/ssl-redirect: '443'
    alb.ingress.kubernetes.io/target-type: ip
spec:
  ingressClassName: alb
  rules:
    - host: grpcserver.dev.mafeifan.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: grpcserver
                port:
                  number: 50051
```

最终生成LB效果如下:

![](https://pek3b.qingstor.com/hexo-blog/202408152143721.png)

![](https://pek3b.qingstor.com/hexo-blog/202408152144217.png)

![](https://pek3b.qingstor.com/hexo-blog/202408152144717.png)


### https协议不使用443端口

上面的写法中，grpc 和 https 都占用了443端口，导致 https 不得不使用 `/hello` path 前缀，

我们继续优化， 修改 nginx-http 让https走8001端口，grpcserver保持不变

```yaml
kind: Ingress
apiVersion: networking.k8s.io/v1
metadata:
  name: nginx-http
  namespace: demo
  labels:
    app: grpcserver
    environment: dev
  annotations:
    alb.ingress.kubernetes.io/certificate-arn: >-
      arn:aws-cn:acm:cn-north-1:xxxxxx:certificate/7010f433-9d60-xxxx-xxxx-ecbcd772e3ad
    alb.ingress.kubernetes.io/group.name: demo-ingress-group
    # 注意监听规则的优先级，值越高越靠前
    alb.ingress.kubernetes.io/group.order: '10'
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTPS":8001}]'
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
spec:
  ingressClassName: alb
  rules:
    - host: grpcserver.dev.mafeifan.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: svc-nginx
                port:
                  number: 80
```

![](https://pek3b.qingstor.com/hexo-blog/202408160001252.png)


### EKS外的ALB目标指向EKS集群内service对应的IP或Instance

流程：

* 不通过ingress方式创建ALB，绑定安全组 `sg-08d041a8f0b0`
* 创建ALB的监听，比如80
* 创建一个目标组,IP类型并绑定到这个ALB，拿到ARN: `arn:aws-cn:elasticloadbalancing:cn-north-1:xxxxx:targetgroup/mafei-demo/dec5f112d848f90c`
  * 此时目标组的目标为空
* EKS 已存在service, svc-nginx  

创建一个TargetGroupBinding，这样目标组的目标IP就是EKS中对应Pod的IP，如果扩缩Pod，目标组的IP会相应的发生变化

```yaml
apiVersion: elbv2.k8s.aws/v1beta1
kind: TargetGroupBinding
metadata:
  namespace: mafei
  name: mafei-demo-tgb
spec:
  serviceRef:
    # route traffic to the k8s service
    name: svc-nginx  
    # the port of service
    port: 80    
  targetGroupARN: arn:aws-cn:elasticloadbalancing:cn-north-1:xxxxx:targetgroup/mafei-demo/dec5f112d848f90c
  networking:
    ingress:
      - from:
          - securityGroup:
              # 一般写为ALB的SG
              # EKS所在的安全组会添加一条规则，允许来自这个 ALB SG 的流量
              groupID: sg-08d041a8f0b0
        ports:
          - port: 80
            # Allow all TCP traffic from ALB SG
            protocol: TCP
```

### 参考

https://docs.amazonaws.cn/eks/latest/userguide/aws-load-balancer-controller.html

https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.6/guide/ingress/annotations/#ingressgroup

https://aws.amazon.com/cn/blogs/containers/patterns-for-targetgroupbinding-with-aws-load-balancer-controller/

https://aws.amazon.com/cn/blogs/china/use-aws-load-balancer-controller-s-targetgroupbinding-function-to-realize-flexible-load-balancer-management/
