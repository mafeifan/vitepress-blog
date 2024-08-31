众所周知的原因，docker.com,docker.io 地址被屏蔽了，导致国内无法直接拉取docker hub官方镜像，为了长远考虑，最好都替换为自己的私有仓库地址。
更退一步，替换为国内可用的镜像地址。

对于Kubersphere来说。替换分为几个方面：

第一步

`kubectl -n kubesphere-system patch cc ks-installer -p '{"spec":{"local_registry":"registry.cn-beijing.aliyuncs.com"}}' --type=merge`

基本能替换 kubesphere-system 命名空间的镜像

对于 kubesphere-monitoring-system 由于Kubersphere整合了开源的prometheus-operator，直接改deployment或stateful的image是不生效的，
要改CRD，原因这个配置项应该是PrometheusOperator在控制，具体可以参考文档看看 [api-reference](https://prometheus-operator.dev/docs/api-reference/api/#monitoring.coreos.com/v1.Prometheus)

修改 prometheus 用到的镜像地址
```bash
kubectl edit prometheus -n kubesphere-monitoring-system k8s

# 修改image部分
# 注意版本，替换为正在使用的

  containers:
    - image: 'registry.cn-beijing.aliyuncs.com/kubesphereio/prometheus:v2.39.1'
      name: prometheus
    - image: >-
        registry.cn-beijing.aliyuncs.com/kubesphereio/prometheus-config-reloader:v0.55.1
      name: config-reloader
  evaluationInterval: 1m
  image: 'registry.cn-beijing.aliyuncs.com/kubesphereio/prometheus:v2.39.1'
  initContainers:
    - image: >-
        registry.cn-beijing.aliyuncs.com/kubesphereio/prometheus-config-reloader:v0.55.1
      name: init-config-reloader
```

直接在界面里编辑也可以
![](https://pek3b.qingstor.com/hexo-blog/202408310849766.png)

同样的，修改 alertmanager 用到的镜像地址
```bash
kubectl edit alertmanager -n kubesphere-monitoring-system main

  containers:
    - image: 'registry.cn-beijing.aliyuncs.com/kubesphereio/alertmanager:v0.23.0'
      name: alertmanager
    - image: >-
        registry.cn-beijing.aliyuncs.com/kubesphereio/prometheus-config-reloader:v0.55.1
      name: config-reloader
  image: 'registry.cn-beijing.aliyuncs.com/kubesphereio/alertmanager:v0.23.0'
```

## 参考

https://ask.kubesphere.io/forum/d/23693-prometheus-k8s-zhe-ge-statefulset-zhong-de-init-config-reloader-jing-xiang-di-zhi-ru-he-xiu-gai

https://prometheus-operator.dev/docs/api-reference/api/#monitoring.coreos.com/v1.Prometheus
