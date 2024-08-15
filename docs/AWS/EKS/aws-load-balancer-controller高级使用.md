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

## 修改默认rule
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


### 使用 ingressgroup 合并多个 ingress
IngressGroup功能能够将多个Ingress资源分组在一起。

controller将自动合并IngressGroup内所有Ingress的Ingress规则，并创建单个ALB。

此外，Ingress上定义的大多数注释仅适用于该Ingress定义的路径。

默认情况下，Ingresses不属于任何IngressGroup，我们将其视为由Ingress本身组成的“隐式IngressGroup”。

比如，适用于一个LB关联多个目标组，一个目标组要支持grpc协议，另外一个支持http1协议

要建两个ingress，name不一样，但要有相同的annotation `alb.ingress.kubernetes.io/group.name`

这个 ingress 支持 https
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

这个ingress支持grpc
```yaml
kind: Ingress
apiVersion: networking.k8s.io/v1
metadata:
  name: grpcserver
  namespace: mafei
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

### 参考

https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.6/guide/ingress/annotations/#ingressgroup

https://aws.amazon.com/cn/blogs/containers/patterns-for-targetgroupbinding-with-aws-load-balancer-controller/
