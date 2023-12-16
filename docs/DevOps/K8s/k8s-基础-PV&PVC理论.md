## 卷的核心是一个目录

卷的核心是一个目录，其中可能存有数据，Pod 中的容器可以访问该目录中的数据。 

所采用的特定的卷类型将决定该目录如何形成的、使用何种介质保存数据以及目录中存放的内容。

## 数据卷（Volume）

我们对数据的要求：

1. pod 或 node 挂了，数据依然存在；
2. pod 或 node 重启，数据依然存在。
3. 数据保存在 Pod 外部

查看k8s支持的存储类型

`kubectl explain pod.spec.volumes` 

数据卷（Volume）是Pod与外部存储设备进行数据传递的通道，也是Pod内部容器间、Pod与Pod间、Pod与外部环境进行数据共享的方式。

数据卷（Volume）定义了外置存储的细节，并内嵌到Pod中作为Pod的一部分。其实质是外置存储在Kubernetes 系统的一个资源映射，当负载需要使用外置存储的时候，可以从数据卷（Volume）中查到相关信息并进行存储挂载操作。

> 数据卷（Volume）生命周期和Pod一致，即Pod被删除的时候，数据卷（Volume）也一起被删除（Volume中的数据是否丢失取决于Volume的具体类型）。

Kubernetes提供了非常丰富的Volume类型，常用的Volume类型分类如下：
|  数据卷（Volume）分类|描述|  
|  ----  | ----  |
|  本地存储|	适用于本地存储的数据卷，例如HostPath、emptyDir等。本地存储卷的特点是数据保存在集群的特定节点上，并且不能随着应用漂移，节点停机时数据即不再可用。|  
|  网络存储	|适用于网络存储的数据卷，例如Ceph、GlusterFS、NFS、iSCSI等。网络存储卷的特点是数据不在集群的某个节点上，而是在远端的存储服务上，使用存储卷时需要将存储服务挂载到本地使用。|  
Secret和ConfigMap|	Secret和ConfigMap是特殊的数据卷，其数据是集群的一些对象信息，该对象数据以卷的形式被挂载到节点上供应用使用。|  
|  PVC|	一种数据卷定义方式，将数据卷抽象成一个独立于Pod的对象，这个对象定义（关联）的存储信息即存储卷对应的真正存储信息，供Kubernetes负载挂载使用。|  

## 卷类型 - emptyDir

emptyDir类型的Volume在Pod分配到Node上时被创建，Kubernetes会在Node上自动分配一个目录，因此无需指定宿主机Node上对应的目录文件。 这个目录的初始内容为空，当Pod从Node上移除时，emptyDir中的数据会被永久删除。

常见场景: 作为从崩溃中恢复的备份点； 存储那些那些需要长久保存的数据，例web服务中的数据


我们定义了2个容器，其中一个容器是输入日期到index.html中，然后验证访问nginx的html是否可以获取日期。以验证两个容器之间挂载的emptyDir实现共享。

```yaml
# vim pod-vol-demo.yaml 
apiVersion: v1
kind: Pod
metadata:
  name: pod-demo
  namespace: default
  labels:
    app: myapp
    tier: frontend
spec:
  containers:
  - name: myapp
    image: ikubernetes/myapp:v1
    imagePullPolicy: IfNotPresent
    ports:
    - name: http
      containerPort: 80
    volumeMounts:    #在容器内定义挂载存储名称和挂载路径
    - name: html
      mountPath: /usr/share/nginx/html/
  - name: busybox
    image: busybox:latest
    imagePullPolicy: IfNotPresent
    volumeMounts:
    - name: html
      mountPath: /data/    #在容器内定义挂载存储名称和挂载路径
    command: ['/bin/sh','-c','while true;do echo $(date) >> /data/index.html;sleep 2;done']
  volumes:  #定义存储卷
  - name: html    #定义存储卷名称  
    emptyDir: {}  #定义存储卷类型
```

## 卷类型 - hostPath

hostPath类型则是映射node文件系统中的文件或者目录到pod里。在使用hostPath类型的存储卷时，也可以设置type字段，支持的类型有文件、目录、File、Socket、CharDevice和BlockDevice。

常见场景: 挂载宿主机的时区文件到容器内，保持和宿主机时区一致。

在使用hostPath volume卷时，即便pod已经被删除了，volume卷中的数据还在！

## emptyDir和hostPath在功能上的异同分析

二者都是node节点的本地存储卷方式；

emptyDir可以选择把数据存到tmpfs类型的本地文件系统中去，hostPath并不支持这一点；

emptyDir是临时存储空间，完全不提供持久化支持；

hostPath的卷数据是持久化在node节点的文件系统中的，即便pod已经被删除了，volume卷中的数据还会留存在node节点上；


## 卷类型 - local 卷
local 卷仍然取决于底层节点的可用性，并不适合所有应用程序。 如果节点变得不健康，那么local 卷也将变得不可被 Pod 访问。使用它的 Pod 将不能运行。

如果不使用外部静态驱动来管理卷的生命周期，用户需要手动清理和删除 local 类型的持久卷


> 更多卷类型及具体用法见文档：https://kubernetes.io/zh/docs/concepts/storage/volumes/#volume-types

## 数据卷（Volume）使用原则
* 一个Pod可以挂载多个数据卷（Volume）。
* 一个Pod可以挂载多种类型的数据卷（Volume）。
* 每个被Pod挂载的Volume卷，可以在不同的容器间共享。
* Kubernetes 环境推荐使用PVC和PV方式挂载数据卷（Volume）。
* 虽然单Pod可以挂载多个数据卷（Volume），但是并不建议给一个Pod挂载过多数据卷。

## PV和PVC
并非所有的Kubernetes数据卷（Volume）具有持久化特征，为了实现持久化的实现，容器存储需依赖于一个远程存储服务。

为此Kubernetes引入了PV和PVC两个资源对象，将存储实现的细节从其如何被使用中抽象出来，并解耦存储使用者和系统管理员的职责。

PV和PVC的概念如下：

* PV,PV是PersistentVolume的缩写，译为持久化存储卷。

PV在Kubernetes中代表一个具体存储类型的卷，其对象中定义了具体存储类型和卷参数。即目标存储服务所有相关的信息都保存在PV中，Kubernetes引用PV中的存储信息执行挂载操作

> PV是一个集群级别的概念，其对象作用范围是整个Kubernetes集群，而不是一个节点。PV可以有自己的独立生命周期，不依附于Pod。

> PVC 属于某命名空间

```bash
$ kubectl get pv -A
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM   STORAGECLASS   REASON   AGE
pvc-018f32f6-2b7c-455f-98d3-1a483759856a   1Gi        RWO            Delete           Bound    harbor/database-data-harbor-mi6d6k-harbor-database-0   local                   194d
pvc-02180b8b-e3ab-4dde-b047-c716519e58e3   20Gi       RWO            Delete           Bound    iot-ningxia/pvc-pg-data   local                   136d
pvc-07d5ba11-8ab5-446c-b7bc-add960c3a15c   20Gi       RWO            Delete           Bound    monitor/pvc-prometheus


$ kubectl get pvc -A
NAMESPACE                      NAME                                            STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
cosmota                        db                                              Bound    pvc-9acde447-b380-4609-be24-c837ce983e13   40Gi       RWO            local          81d
cosmota                        web-storage                                     Bound    pvc-e095b626-0abb-498b-be8b-8365a35073f9   5Gi        RWO            local          78d
cosmota                        web-uploads                                     Bound    pvc-e49627ba-9fde-4ef3-b5ec-7a0f6ad8a840   5Gi        RWO            local          78


```

* PVC, PVC是PersistentVolumeClaim的缩写，译为存储声明。

PVC是在Kubernetes中一种抽象的存储卷类型，代表了某个具体类型存储的数据卷表达。其设计意图是分离存储与应用编排，将存储细节抽象出来并实现存储的编排。这样Kubernetes中存储卷对象独立于应用编排而单独存在，在编排层面使应用和存储解耦。

![](http://pek3b.qingstor.com/hexo-blog/20220301191948.png)


## PV和PVC使用说明
### PVC和PV的绑定
PVC与PV是一一对应关系，不能一个PVC挂载多个PV，也不能一个PV挂载多个PVC。

为应用配置存储时，需要声明一个存储需求声明（PVC），而Kubernetes会通过最佳匹配的方式选择一个满足PVC需求的PV，并与之绑定。

所以从职责上PVC是应用所需要的存储对象，属于应用作用域。PV是存储平面的存储对象，属于整个存储域。

PVC只有绑定了PV之后才能被Pod使用，而PVC绑定PV的过程即是消费PV的过程，这个过程是有一定规则的，以下规则都满足的PV才能被PVC绑定：
* VolumeMode：被消费PV的VolumeMode需要和PVC一致。
* AccessMode：被消费PV的AccessMode需要和PVC一致。
* StorageClassName：如果PVC定义了此参数，PV必须有相关的参数定义才能进行绑定。
* LabelSelector：通过标签（labels）匹配的方式从PV列表中选择合适的PV绑定。
* Size：被消费PV的capacity必须大于或者等于PVC的存储容量需求才能被绑定。

### PV和PVC定义中的size字段
PVC和PV里面的size字段作用如下：
* PVC、PV绑定时，会根据各自的size进行筛选。
* 通过PVC、StorageClass动态创建PV时，有些存储类型会参考PVC的size创建相应大小的PV和后端存储。
* 对于支持Resize操作的存储类型，PVC的size作为扩容后PV、后端存储的容量值。

一个PVC、PV的size值只是在执行一些PVC和PV管控操作的时候，作为配置参数来使用。

真正的存储卷数据流写数据的时候，不会参考PVC和PV的size字段，而是依赖底层存储介质的实际容量。


### 两种PV的提供方式:静态分配或者动态分配

**静态分配:**
1. 集群管理员预先创建一些 PV。它们携带可供集群用户使用的真实存储的详细信息。 它们存在于Kubernetes API中，可用于消费。
2. 用户创建PVC与PV绑定


**动态分配:**

通过存储类进行动态创建存储空间,当管理员创建的静态 PV 都不匹配用户的 PVC 时，集群可能会尝试动态地为 PVC 配置卷。此配置基于 StorageClasses：PVC 必须请求存储类，并且管理员必须已创建并配置该类才能进行动态配置。 

用户创建PVC即可自动创建PV并绑定

## 参考
[存储基础知识](https://help.aliyun.com/document_detail/209446.html?spm=a2c4g.11174283.2.58.28ae2ceed7ew01)

https://www.cnblogs.com/linuxk/p/9760363.html