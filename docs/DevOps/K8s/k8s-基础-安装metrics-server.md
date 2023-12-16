查看集群中 Pod 或 Node 的 CPU 及内存占用，可以使用`kubectl top node`命令

执行后发现报如下错误，这是因为没有安装 Metrics 服务

```
W0228 15:00:55.748791    2774 top_node.go:119] Using json format to get metrics. Next release will switch to protocol-buffers, switch early by passing --use-protocol-buffers flag
error: Metrics API not available
```

阅读文档，安装服务：https://github.com/kubernetes-sigs/metrics-server

打开 components.yaml 搜 image 发现镜像源是 k8s.gcr.io/metrics-server/metrics-server, 国内不下来

fuck!! 去 docker hub 搜索个其他的镜像源 dyrnq/metrics-server, 将 components.yaml 中的 `k8s.gcr.io/metrics-server/metrics-server` 替换为 `dyrnq/metrics-server`

修改启动参数
```
   - --kubelet-insecure-tls
   - --kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname
```

```
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

```bash
# 检查执行，确保出现了 metrics-server
mafei@master:~$ k get po -A | grep "metrics"

# top 命令正常了, 完工
mafei@master:~$ k top pod -A
W0228 15:32:42.454163   35558 top_pod.go:140] Using json format to get metrics. Next release will switch to protocol-buffers, switch early by passing --use-protocol-buffers flag
NAMESPACE     NAME                                       CPU(cores)   MEMORY(bytes)
kube-system   calico-kube-controllers-846b5f484d-xd9rc   1m           17Mi
kube-system   calico-node-hdg2c                          35m          122Mi
kube-system   calico-node-rwk2k                          33m          122Mi
kube-system   coredns-b5648d655-n6sff                    3m           11Mi
kube-system   coredns-b5648d655-st4nj                    2m           11Mi
kube-system   kube-apiserver-master                      58m          436Mi
kube-system   kube-controller-manager-master             19m          52Mi
kube-system   kube-proxy-jft2t                           4m           21Mi
kube-system   kube-proxy-qbzdv                           1m           21Mi
kube-system   kube-scheduler-master                      3m           18Mi
kube-system   metrics-server-6647799c9-4c65s             3m           15Mi
kube-system   nodelocaldns-59d8n                         3m           12Mi
kube-system   nodelocaldns-px57k                         2m           13Mi
```



