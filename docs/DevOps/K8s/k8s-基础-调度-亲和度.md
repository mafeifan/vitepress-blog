## topologyKey

topology 就是拓扑的意思，是一个范围的概念，比如一个 Node、一个机柜、一个机房或者是一个地区（如杭州、上海）等，实际上对应的还是 Node 上的标签。

这里的 `topologyKey` 对应的是 `Node` 上的标签的 `Key`（没有Value）

```
# 这是master节点拥有的标签

k get nodes --show-labels

beta.kubernetes.io/arch=amd64
beta.kubernetes.io/os=linux
kubernetes.io/arch=amd64
kubernetes.io/hostname=master
kubernetes.io/os=linux
node-role.kubernetes.io/control-plane=
node-role.kubernetes.io/master=
```


其实 topologyKey 就是用于筛选 Node 的。通过这种方式，我们就可以将各个 Pod 进行跨集群、跨机房、跨地区的调度了。

比如 `topologyKey: "kubernetes.io/hostname"` 按照节点名称的不同，分散Pod到各个节点上面。


这里 Pod 的亲和性规则是：

这个 Pod 要调度到的 Node 必须有一个标签为 `app:dp-demo` 的 Pod(说白了，每个Node要保证只有一个app:dp-demo的Pod)。
且该 Node 必须有一个 Key 为 kubernetes.io/hostname 的标签，即 Node 必须属于 kubernetes.io/hostname 拓扑域。

这里有个有趣的现象，由于我这里只有两个 node，而 replicas: 3，造成一个Pod始终处于 pending 状态

```
dp-demo-6544cdf96-bscdt   1/1     Running   0          15m   10.233.70.5    master   <none>           <none>
dp-demo-6544cdf96-kzwlv   1/1     Running   0          15m   10.233.68.62   vm2      <none>           <none>
dp-demo-6544cdf96-zgqd2   0/1     Pending   0          15m   <none>         <none>   <none>           <none>
```


```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dp-demo
spec:
  selector:
    matchLabels:
      app: dp-demo
  replicas: 3
  template:
    metadata:
      labels:
        app: dp-demo
    spec:
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchExpressions:
              - key: app
                operator: In
                values:
                - dp-demo
            topologyKey: "kubernetes.io/hostname"
        #  反亲和度    
        podAntiAffinity:
          # 尽量让 Pod 不要调度到这样的 Node
          # 其中包含一个 Key 为 kubernetes.io/hostname 的标签，且该 Node 上有标签为 security: S2 的 Pod。
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: security
                  operator: In
                  values:
                  - S2
              topologyKey: kubernetes.io/hostname      
      containers:
      - name: nginx
        image: nginx-alpine
```

