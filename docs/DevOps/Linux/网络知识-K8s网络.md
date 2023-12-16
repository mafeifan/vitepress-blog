##  Kubernetes网络模型

Kubernetes 要求所有的网络插件实现必须满足如下要求：

- 一个Pod一个IP
- 所有的 Pod 可以与任何其他 Pod 直接通信，无需使用 NAT 映射
- 所有节点可以与所有 Pod 直接通信，无需使用 NAT 映射
- Pod 内部获取到的 IP 地址与其他 Pod 或节点与其通信时的 IP 地址是同一个。

### 1、Docker容器网络模型

先看下Linux网络名词：

- **网络的命名空间：** Linux在网络栈中引入网络命名空间，将独立的网络协议栈隔离到不同的命令空间中，彼此间无法通信；Docker利用这一特性，实现不同容器间的网络隔离。

- **Veth设备对：** Veth设备对的引入是为了实现在不同网络命名空间的通信。

- **Iptables/Netfilter：** Docker使用Netfilter实现容器网络转发。

- **网桥：** 网桥是一个二层网络设备，通过网桥可以将Linux支持的不同的端口连接起来，并实现类似交换机那样的多对多的通信。

- **路由：** Linux系统包含一个完整的路由功能，当IP层在处理数据发送或转发的时候，会使用路由表来决定发往哪里。

Docker容器网络示意图如下：

![](https://k8s-1252881505.cos.ap-beijing.myqcloud.com/k8s-2/docker-network.png)



### 2、Pod 网络

**问题：** Pod是K8S最小调度单元，一个Pod由一个容器或多个容器组成，当多个容器时，怎么都用这一个Pod IP？

**实现：** k8s会在每个Pod里先启动一个infra container小容器，然后让其他的容器连接进来这个网络命名空间，然后其他容器看到的网络试图就完全一样了。即网络设备、IP地址、Mac地址等。这就是解决网络共享的一种解法。在Pod的IP地址就是infra container的IP地址。

![](https://k8s-1252881505.cos.ap-beijing.myqcloud.com/k8s-2/c-to-c.png)



在 Kubernetes 中，每一个 Pod 都有一个真实的 IP 地址，并且每一个 Pod 都可以使用此 IP 地址与其他 Pod 通信。

Pod 之间通信会有两种情况：

- 两个Pod在同一个Node上
- 两个Pod在不同Node上

**先看下第一种情况：两个Pod在同一个Node上**

同节点Pod之间通信道理与Docker网络一样的，如下图：

![](https://k8s-1252881505.cos.ap-beijing.myqcloud.com/k8s-2/pod-to-pod-2.gif)

1. 对 Pod1 来说，eth0 通过虚拟以太网设备（veth0）连接到 root namespace；
2. 网桥 cbr0 中为 veth0 配置了一个网段。一旦数据包到达网桥，网桥使用ARP 协议解析出其正确的目标网段 veth1；
3. 网桥 cbr0 将数据包发送到 veth1；
4. 数据包到达 veth1 时，被直接转发到 Pod2 的 network namespace 中的 eth0 网络设备。



**再看下第二种情况：两个Pod在不同Node上**

K8S网络模型要求Pod IP在整个网络中都可访问，这种需求是由第三方网络组件实现。

![](https://k8s-1252881505.cos.ap-beijing.myqcloud.com/k8s-2/pod-to-pod-3.gif)

### 3、CNI（容器网络接口）

CNI（Container Network Interface，容器网络接口)：是一个容器网络规范，Kubernetes网络采用的就是这个CNI规范，CNI实现依赖两种插件，一种CNI Plugin是负责容器连接到主机，另一种是IPAM负责配置容器网络命名空间的网络。

CNI插件默认路径：

```
# ls /opt/cni/bin/
```

地址：https://github.com/containernetworking/cni

当你在宿主机上部署Flanneld后，flanneld 启动后会在每台宿主机上生成它对应的CNI 配置文件（它其实是一个 ConfigMap），从而告诉Kubernetes，这个集群要使用 Flannel 作为容器网络方案。

CNI配置文件路径：

```
/etc/cni/net.d/10-flannel.conflist
```

当 kubelet 组件需要创建 Pod 的时候，先调用dockershim它先创建一个 Infra 容器。然后调用 CNI 插件为 Infra 容器配置网络。

这两个路径在kubelet启动参数中定义： 

```
 --network-plugin=cni \
 --cni-conf-dir=/etc/cni/net.d \
 --cni-bin-dir=/opt/cni/bin
```

## 4.3 Kubernetes网络组件之 Flannel

Flannel是CoreOS维护的一个网络组件，Flannel为每个Pod提供全局唯一的IP，Flannel使用ETCD来存储Pod子网与Node IP之间的关系。flanneld守护进程在每台主机上运行，并负责维护ETCD信息和路由数据包。

### 1、Flannel 部署

 https://github.com/coreos/flannel 

```
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
```

### 2、 Flannel工作模式及原理

Flannel支持多种数据转发方式：

- UDP：最早支持的一种方式，由于性能最差，目前已经弃用。
- VXLAN：Overlay Network方案，源数据包封装在另一种网络包里面进行路由转发和通信
- Host-GW：Flannel通过在各个节点上的Agent进程，将容器网络的路由信息刷到主机的路由表上，这样一来所有的主机都有整个容器网络的路由数据了。

#### VXLAN

```
# kubeadm部署指定Pod网段
kubeadm init --pod-network-cidr=10.244.0.0/16

# 二进制部署指定
cat /opt/kubernetes/cfg/kube-controller-manager.conf
--allocate-node-cidrs=true \
--cluster-cidr=10.244.0.0/16 \
```



```
# kube-flannel.yml
net-conf.json: |
    {
      "Network": "10.244.0.0/16",
      "Backend": {
        "Type": "vxlan"
      }
    }
```



为了能够在二层网络上打通“隧道”，VXLAN 会在宿主机上设置一个特殊的网络设备作为“隧道”的两端。这个设备就叫作 VTEP，即：VXLAN Tunnel End Point（虚拟隧道端点）。下图flannel.1的设备就是VXLAN所需的VTEP设备。示意图如下：

![](https://k8s-1252881505.cos.ap-beijing.myqcloud.com/k8s-2/flanneld-vxlan.png)



如果Pod 1访问Pod 2，源地址10.244.1.10，目的地址10.244.2.10 ，数据包传输流程如下：

1. **容器路由：**容器根据路由表从eth0发出

   ```
   / # ip route
   default via 10.244.0.1 dev eth0 
   10.244.0.0/24 dev eth0 scope link  src 10.244.0.45 
   10.244.0.0/16 via 10.244.0.1 dev eth0 
   ```

 2. **主机路由：**数据包进入到宿主机虚拟网卡cni0，根据路由表转发到flannel.1虚拟网卡，也就是，来到了隧道的入口。

    ```
    # ip route
    default via 192.168.31.1 dev ens33 proto static metric 100 
    10.244.0.0/24 dev cni0 proto kernel scope link src 10.244.0.1 
    10.244.1.0/24 via 10.244.1.0 dev flannel.1 onlink 
    10.244.2.0/24 via 10.244.2.0 dev flannel.1 onlink 
    ```

  3. **VXLAN封装：**而这些VTEP设备（二层）之间组成二层网络必须要知道目的MAC地址。这个MAC地址从哪获取到呢？其实在flanneld进程启动后，就会自动添加其他节点ARP记录，可以通过ip命令查看，如下所示：

     ```
     # ip neigh show dev flannel.1
     10.244.1.0 lladdr ca:2a:a4:59:b6:55 PERMANENT
     10.244.2.0 lladdr d2:d0:1b:a7:a9:cd PERMANENT
     ```

4. **二次封包：**知道了目的MAC地址，封装二层数据帧（容器源IP和目的IP）后，对于宿主机网络来说这个帧并没有什么实际意义。接下来，Linux内核还要把这个数据帧进一步封装成为宿主机网络的一个普通数据帧，好让它载着内部数据帧，通过宿主机的eth0网卡进行传输。

   ![](https://k8s-1252881505.cos.ap-beijing.myqcloud.com/k8s-2/vxlan-pkg.png)

5. **封装到UDP包发出去：**现在能直接发UDP包嘛？到目前为止，我们只知道另一端的flannel.1设备的MAC地址，却不知道对应的宿主机地址是什么。

   flanneld进程也维护着一个叫做FDB的转发数据库，可以通过bridge fdb命令查看：

   ```
# bridge fdb show  dev flannel.1
   d2:d0:1b:a7:a9:cd dst 192.168.31.61 self permanent
   ca:2a:a4:59:b6:55 dst 192.168.31.63 self permanent
   ```
   
   可以看到，上面用的对方flannel.1的MAC地址对应宿主机IP，也就是UDP要发往的目的地。使用这个目的IP进行封装。

 6. **数据包到达目的宿主机：**Node1的eth0网卡发出去，发现是VXLAN数据包，把它交给flannel.1设备。flannel.1设备则会进一步拆包，取出原始二层数据帧包，发送ARP请求，经由cni0网桥转发给container。



#### Host-GW

host-gw模式相比vxlan简单了许多， 直接添加路由，将目的主机当做网关，直接路由原始封包。 

下面是示意图：

![](https://k8s-1252881505.cos.ap-beijing.myqcloud.com/k8s-2/flanneld-hostgw.png)

```
# kube-flannel.yml
net-conf.json: |
    {
      "Network": "10.244.0.0/16",
      "Backend": {
        "Type": "host-gw"
      }
    }
```

当你设置flannel使用host-gw模式,flanneld会在宿主机上创建节点的路由表：

```
# ip route
default via 192.168.31.1 dev ens33 proto static metric 100 
10.244.0.0/24 dev cni0 proto kernel scope link src 10.244.0.1 
10.244.1.0/24 via 192.168.31.63 dev ens33 
10.244.2.0/24 via 192.168.31.61 dev ens33 
192.168.31.0/24 dev ens33 proto kernel scope link src 192.168.31.62 metric 100 
```

目的 IP 地址属于 10.244.1.0/24 网段的 IP 包，应该经过本机的 eth0 设备发出去（即：dev eth0）；并且，它下一跳地址是 192.168.31.63（即：via 192.168.31.63）。

一旦配置了下一跳地址，那么接下来，当 IP 包从网络层进入链路层封装成帧的时候，eth0 设备就会使用下一跳地址对应的 MAC 地址，作为该数据帧的目的 MAC 地址。

而 Node 2 的内核网络栈从二层数据帧里拿到 IP 包后，会“看到”这个 IP 包的目的 IP 地址是 10.244.1.20，即 container-2 的 IP 地址。这时候，根据 Node 2 上的路由表，该目的地址会匹配到第二条路由规则（也就是 10.244.1.0 对应的路由规则），从而进入 cni0 网桥，进而进入到 container-2 当中。