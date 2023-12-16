## 概念

组件图

![](http://pek3b.qingstor.com/hexo-blog/20220122141009.png)

![](http://pek3b.qingstor.com/hexo-blog/20220122141413.png)

* Control Plane组件：etcd, kube-controller-manager, kube-scheduler, kube-apiserver
* node组件：kubelet, kube-proxy, container runtime
* 额外的：DNS, Web UI, Monitoring, Logging

## Kubernetes组件
我们平时做开发的过程中所使用的服务器（即宿主机），在Kubernetes集群中被称为Node节点。

同时在Kubernetes中存在一个或者多个Master节点控制多个宿主机实现集群，整个Kubernetes的核心调度功能基本都在Master节点上。

Kubernetes的主要功能通过五个大组件组成：

* kubelet：安装在Node节点上，用以控制Node节点中的容器完成Kubernetes的调度逻辑
* ControllerManager：是我们上述所讲的控制器模式的核心管理组件，管理了所有Kubernetes集群中的控制器逻辑
* API Server：服务处理集群中的api请求，我们一直写的kubectl，其实就是发送给API Server的请求，请求会在其内部进行处理和转发
* Scheduler：负责Kubernetes的服务调度，比如控制器只是控制Pod的编排，最后的调度逻辑是由Scheduler所完成并且发送请求给kubelet执行的
* Etcd：这是一个分布式的数据库存储项目，由CoreOS开发，最终被RedHat收购成为Kubernetes的一部分，它里面保存了Kubernetes集群中的所有配置信息，比如所有集群对象的name，IP，secret，configMap等所有数据，其依靠自己的一致性算法可以保证在系统中快速稳定的返回各种配置信息，因此这也是Kubernetes中的核心组件

> kube-controller-manager,kube-apiserver,kube-scheduler,etcd是以静态Pod方式运行，kubelet是系统进程
> 
> [为控制平面组件生成静态 Pod 清单](https://kubernetes.io/zh/docs/reference/setup-tools/kubeadm/implementation-details/#generate-static-pod-manifests-for-control-plane-components)

## 定制化功能
除了各种强大的组件功能之外，Kubernetes也给用户提供了极高的自由度。

为了实现这种高度的自由，Kubernetes给用户提供了三个公开的接口，分别是：

* CNI（Container Networking Interface，容器网络接口）：其定义了Kubernetes集群所有网络的链接方式，整个集群的网络都通过这个接口实现。只要实现了这个接口内所有功能的网络插件，就可以作为Kubernetes集群的网络配置插件，其内部包括宿主机路由表配置、7层网络发现、数据包转发等等都有各式各样的小插件，这些小插件还可以随意配合使用，用户可以按照自己的需求自由定制化这些功能
* CSI（Container Storage Interface，容器存储接口）定义了集群持久化的一些规范，只要是实现这个接口的存储功能，就可以作为Kubernetes的持久化插件
* CRI（Container Runtime Interface，容器运行时接口）：在Kubernetes的容器运行时，比如默认配置的Docker在这个集群的容器运行时，用户可以自由选择实现了这个接口的其他任意容器项目，比如之前提到过的 containerd 和 rkt

这里讲一个有趣的点：CRI。

Kubernetes的默认容器是Docker，但是由于项目初期的竞争关系，Docker其实并不满足Kubernetes所定义的CRI规范，那怎么办呢？

为了解决这个问题，Kubernetes专门为Docker编写了一个叫DockerShim的组件，即Docker垫片，用来把CRI请求规范，转换成为Docker操作Linux的OCI规范（对，就是第二部分提到的那个OCI基金会的那个规范）。但是这个功能一直是由Kubernetes项目维护的，只要Docker发布了新的功能Kubernetes就要维护这个DockerShim组件。

于是，这个近期的消息——Kubernetes将在明年的版本v1.20中删除删除DockerShim组件，意味着从明年的新版本开始，Kubernetes将全面不支持Docker容器的更新了。

但其实这对我们普通开发者来说可能并没有什么影响，最坏的结果就是我们的镜像需要从Docker换成其他Kubernetes支持的容器镜像。

不过根据这这段时间各个云平台放出的消息来看，这些平台都会提供对应的转换措施，比如我们还是提供Docker镜像，平台在发布运维的时候会把这些镜像转换成其他镜像；又或者这些平台会自行维护一个DockerShim来支持Docker，都是有解决方案的。

### Pod

* Pod里的容器运行在一个逻辑上的"主机"上,它们使用相同的网络名称空间(也就是说,同一Pod里的容器使用相同的IP和相同的端口段区间)和相同的进程间通信(IPC)名称空间.
它们也可以共享存储卷.这些特性使它们可以更有效的通信.并且pod可以使你把紧密耦合的应用容器作为一个单元来管理.
* 这就意味着同一个Pod内的容器可以通过localhost来连接对方的端口
* 每个Pod都拥有一个独立的IP地址，并假定所有Pod都在一个可以直接连通的、扁平的网络空间中
* **为了使Pod保持运行，Pod应该执行某些任务**，否则Kubernetes会发现它是不必要的，因此退出。有很多方法可以使Pod保持运行。 
    * 在运行容器时发出睡眠命令。
    * 在容器内运行无限循环。

睡眠命令
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: busybox
  labels:
    app: busybox
spec:
  containers:
  - name: busybox
    image: busybox
    ports:
    - containerPort: 80
    command: ["/bin/sh", "-ec", "sleep 1000"]
```

无限循环
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: busybox
  labels:
    app: busybox
spec:
  containers:
  - name: busybox
    image: busybox
    ports:
    - containerPort: 80
    command: ["/bin/sh", "-ec", "while :; do echo '.'; sleep 5 ; done"]
```

Just sleep forever
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: ubuntu
spec:
  containers:
  - name: ubuntu
    image: ubuntu:latest
    # Just sleep forever
    command: [ "sleep" ]
    args: [ "infinity" ]
```

### Pod控制器
Pod控制器是Pod启动的一种模板，来保证K8S里启动的Pod应始终按照预期运行（副本数，生命周期，健康状态检查等） 

在生产环境，我们一般不会直接创建Pod，通常使用Deployment和StatefulSet来替代。因为Pod一旦出现问题，比如资源不足，网络不通等，无法自动重启，扩容，转移等。

K8S内提供了众多的Pod控制器，常用的有：
* Deployment (最常用的Pod控制器，可以指定副本数，健康状态检查，Deployment 创建的 Pod 并不是唯一的，也不会保留它们的状态，因此可以简化无状态应用的扩缩和更新过程。)
* StatefulSet (有状态应用要求保存或永久保存其状态。有状态应用使用永久性存储空间（例如永久性卷）保存数据，以供服务器或其他用户使用。可以创建 Kubernetes StatefulSet，以部署有状态应用。StatefulSet 创建的 Pod 具有唯一标识符，可以安全有序地进行更新。)
* ReplicaSet (已废弃，被Deployment取代)
* DaemonSet (守护程序在分配的节点中持续执行后台任务，而无需用户干预。守护进程示例包括像 Fluentd 之类的日志收集器和监控服务。可以创建 Kubernetes DaemonSet，以在集群上部署守护进程。DaemonSet 在每个节点创建一个 Pod，您可以选择 DaemonSet 应部署的一个特定节点)
* Job (创建一个或多个Pod可靠的执行任务，任务完成Pod会被终止，失败才会自动创建新的Pod。跟Deployment不同，假如某Deployment的副本数为3，Deployment会始终保持这个数量，而对于Job，Pod执行完就完了，不会始终保持)
* CronJob (按指定的时间计划去执行Job)
* 创建Pod 会以 `pod-ip-address.my-namespace.pod.cluster.local` 这种形式被指派一个 DNS A 记录。`[Pod-name].[Service-name-ClusterIP].[namespace].cluster.local`

### 静态Pod
静态 Pod 在指定的节点上由 kubelet 守护进程直接管理，不需要 API Server 监管

静态 Pod 永远都会绑定到一个指定节点上的 Kubelet。

特点：
名称以连字符开头的节点主机名作为后缀。如 kube-controller-manager,kube-apiserver-master,kube-scheduler-master，根据名称判断是静态Pod还是普通Pod。

kubectl delete pod 删除无效，需要转移定义文件，kubelet 会定期扫描配置的目录,如 `mv /etc/kubelet.d/static-web.yaml /tmp`


### DaemonSet
随着node的新增而创建或node的移除而销毁，就是说确保node上运行相同的pod，适合监控或日志收集。
> DaemonSet的Pod必须有RestartPolicy值必须是Always或空


### 存活探针livenessProbe和就绪探针readiness的区别

有些pod可能需要时间来加载配置或数据，或者可能需要执行预热过程以防止第一个用户请求时间太长影响了用户体验。在这种情况下，不希望该pod立即开始接收请求，尤其是在运行的实例可以正确快速地处理请求的情况下。不要将请求转发到正在启动的pod中，直到完全准备就绪。

与存活探针不同，如果容器未通过准备检查，则不会被终止或重新启动。这是存活探针与就绪探针之间的重要区别。


### 解释有状态和无状态
容器化应⽤程序最困难的任务之⼀，就是设计有状态分布式组件的部署体系结构

由于⽆状态组件可能没有预定义的启动顺序、集群要求、点对点 TCP 连接、唯⼀的⽹络标识符、正常的启动和终⽌要求等，因此可以很容易地进⾏容器化

有状态诸如数据库，⼤数据分析系统，分布式key/value 存储和 message brokers 可能有复杂的分布式体系结构

特点：有状态的pod挂了之后会恢复，恢复的时候名称的生成总是和原先挂之前保持一模一样，无状态的Pod名字后缀是随机的，挂了之后会被重新命名。

### Namespace
命名空间，隔离K8S资源的方法。比如有两个项目，都想运行名为backend的deployment，那么可以创建两个namespace，隔离这两个deployment

### Service

* 在K8S的世界里，虽然每个Pod会被分配一个单独的IP地址，但是这个IP地址会随着Pod的销毁而消失
* Service(服务)就是解决这个问题的核心概念
* 一个Service可以看做一组提供相同服务Pod的对外访问接口
* Service作用于哪些Pod是通过标签选择器来定义的（这个非常灵活，他把一些复杂的东西解耦了，也是K8S设计强大的地方之一，后续会讲到）
* 当你创建一个服务 时， Kubernetes 会创建一个相应的 DNS 条目。该条目的形式是 `<服务名称>.<名字空间名称>.svc.cluster.local`

### Service类型

* ClusterIP: 在群集中的内部IP上公布服务,外界无法访问，集群内可访问（默认）
* LoadBalance：在云环境中（需要云供应商可以支持）创建一个集群外部的负载均衡器，并为使用该负载均衡器的 IP 地址作为服务的访问地址。此时 ClusterIP 和 NodePort 的访问方式仍然可用。
* NodePort：使用 NAT 在集群中每个的同一端口上公布服务。这种方式下，可以通过访问集群中任意节点+端口号的方式访问服务 `<NodeIP>:<NodePort>`。此时 ClusterIP 的访问方式仍然可用


### Service 中的 port
* port是暴露在cluster ip上的端口，:port提供了集群内部客户端访问service的入口
* nodePort 提供了集群外部客户端访问 Service 的一种方式
* targetPort 是 pod 上的端口

### Ingress
* Ingress是K8S集群里工作的OSI网络参考模型下，第7层的应用，对外暴露的接口
* Service只能进行L4流量调度，表现形式是IP+Port
* Ingress则可以调度不同的业务领域，不同URL访问路径的业务流量，比如可以配置访问backend.aa.com，转发到名为backend的deployment应用，
  访问frontend.aa.com，转发到名为访问frontend的deployment应用

### configmap
configmap的数据可以来自三种类型：字面量，文件和目录

### Role 和 ClusterRole的区别
在 Role 中，定义的规则只适⽤于单个命名空间，也就是和 namespace 关联的
⽽ClusterRole 是集群范围内的，因此定义的规则不受命名空间的约束

### Subject
分三种，user account，group，service account

### RoleBinding 和 ClusterRoleBinding
简单来说就是把声明的 Subject 和我们的 Role 进⾏绑定的过程(给某个⽤户绑定上操作的权限)

RoleBinding 只会影响到当前 namespace 下⾯的资源操作权限
ClusterRoleBinding 会影响到所有的 namespace。

### 命令行

`kubectl scale` 不止Deployment，还能对ReplicaSet, Replication Controller, or StatefulSet设置副本数


## 参考

[Docker与k8s的恩怨情仇](https://www.cnblogs.com/powertoolsteam/p/15155422.html)
