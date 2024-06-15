传统ingress写法

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
      [{"field":"http-header","httpHeaderConfig":{"httpHeaderName": "X-Customer-Header2", "values":["202405271135505"]}},{"field":"path-pattern","pathPatternConfig":{"values":["/*"]}}]
    alb.ingress.kubernetes.io/conditions.default-header: >
      {"type":"fixed-response","fixedResponseConfig":{"contentType":"text/plain","statusCode":"403","messageBody":"Access Deny, please contact to cndevops@x.com"}}
  name: alb-demo
  namespace: demo
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

* 修改默认rule，404 改为 403
* 添加指定target group

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
    alb.ingress.kubernetes.io/actions.rule-tg: >
      {"type":"forward","forwardConfig":{"targetGroups":[{"serviceName":"svc-nginx","servicePort":"80"}]}}
    alb.ingress.kubernetes.io/conditions.rule-tg: >
      [{"field":"http-header","httpHeaderConfig":{"httpHeaderName": "X-DEMO-Header", "values":["1234567"]}}]
    alb.ingress.kubernetes.io/actions.default: |
      {"Type":"fixed-response","FixedResponseConfig":{"ContentType":"application/json","StatusCode":"403","MessageBody":"{ \"code\" : 403, \"message\" : \"Access deny, please contact to cndevops@demo.com\"  }"}}
  name: alb-demo
  namespace: demo
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
