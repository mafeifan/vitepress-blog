默认情况下K8s集群中，如果namespace中不存在任何策略，则所有进出该namespace中 Pod 的流量都被允许。这样造成了安全隐患。

所以K8引入了Network Policy网络策略的概念，网络策略可以设置Pod之间的访问权限，只有被授权的Pod才能访问其他Pod。

## 原理

网络策略的实现是通过网络策略的规则来实现的，规则的实现需要策略控制器，策略控制器由第三方网络组件提供，目前有Calico, Weave, Cilium等。

网络策略的规则是一个YAML文件，

## 实例

### 只允许拥有`role=nginx-client`标签的 Pod 访问某些容器

这里创建三个 Pod 和一个网络策略 pc-network-policy

```bash
## 访问目标的nginx pod
k run np-target --image=nginx --labels="app=nginx" --port=80

# 两个访问源，一个带标签role=nginx-client，可以访问np-target，不带的访问不了
k run np-source-1 --image=busybox --labels="role=nginx-client" --command -- sleep 3600
k run np-source-2 --image=busybox --command -- sleep 3600
```

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: pc-network-policy
  namespace: default
spec:
  podSelector:
    matchLabels:
      app: nginx
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          role: nginx-client
    ports:
    - protocol: TCP
      port: 80
```

```bash
# 记下 np-target 的 IP，比如是 10.233.68.42
k get po -o wide

# 分别登录 np-source-1 和 np-source-2 去访问 np-target
mafei@master:~/app$ k exec -it np-source-1 -- sh
/ # curl 10.233.68.42
sh: curl: not found
/ # wget 10.233.68.42
Connecting to 10.233.68.42 (10.233.68.42:80)
saving to 'index.html'
index.html           100% |*****************************************************************************************|   615  0:00:00 ETA
'index.html' saved
/ # exit
mafei@master:~/app$ k exec -it np-source-2 -- sh
/ # wget --timeout=5 10.233.68.42
Connecting to 10.233.68.42 (10.233.68.42:80)
wget: download timed out
/ #
```

证实了网络策略生效了，对没有`role: nginx-client`标签的 Pod 拒绝访问


### CKA考题

Run an nginx Pod in the default namespace. Also run a busybox Pod in the secure namespace. 

Create a NetworkPolicy that only allows access to the nginx Pod from the busybox Pod in the secure namespace and denies all other access. 

创建一个网络策略，只允许命名空间为 secure 的 busybox Pod 访问 nginx Pod，其他的都拒绝访问

```
k create ns secure
k run nginx --image=nginx --port=80 --labels="app=nginx"
```

```yaml
# touch b1.yaml
apiVersion: v1
kind: Pod
metadata:
  name:  busybox1
  namespace: secure
  labels:
    type: monitoring1
spec:
  containers:
    - name: busybox1
      image: busybox
      command: [ "sleep", "3600"]
```

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: only-allow-from-busybox-secure-ns
  namespace: default
spec:
  podSelector:
    matchLabels:
      app: nginx
  policyTypes:
  - Ingress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: secure
    - podSelector:
        matchLabels:
          type: monitoring1
```




### 默认拒绝所有入站流量
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
spec:
  podSelector: {}
  policyTypes:
  - Ingress
```

更多例子参考官网文档：https://kubernetes.io/docs/concepts/services-networking/network-policies/

## 参考

https://kubernetes.io/zh/docs/concepts/services-networking/network-policies/

https://github.com/mafeifan/kubernetes-network-policy-recipes

https://faun.pub/cka-exercises-network-policy-namespace-843bfead629e