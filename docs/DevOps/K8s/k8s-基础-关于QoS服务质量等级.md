描述某Pod发现有个QoS属性, QoS是 Quality of Service 的缩写
`QoS Class: BestEffort`

对于一个 pod 来说，服务质量体现在两个具体的指标：CPU 和内存。

当节点上内存资源紧张时，kubernetes 会根据预先设置的不同 QoS 类别进行相应处理。

当 Kubernetes 创建一个 Pod 时，它就会给这个 Pod 分配一个 QoS 等级，可以是以下等级之一：

* Guaranteed(有保证的)：Pod 里的每个容器都必须有内存/CPU 限制和请求，而且值必须相等。如果一个容器只指明limit而未设定request，则request的值等于limit值。
* Burstable(不稳定的)：Pod 里至少有一个容器有内存或者 CPU 请求且不满足 Guarantee 等级的要求，即内存/CPU 的值设置的不同。
* BestEffort(尽最大努力)：容器必须没有任何内存或者 CPU 的限制或请求。

该配置不是通过一个配置项来配置的，而是通过配置 CPU/MEM的 limits 与 requests 值的大小来确认服务质量等级。


## 实例

下面是 Guaranteed 例子：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name:  qos-demo
spec:
  containers:
    - name: qos-demo
      image: busybox
      resources:
        limits:
          cpu: 100m
          memory: 100Mi
        requests:
          cpu: 100m
          memory: 100Mi
      command: [ "sleep", "3600"]
```

下面是 Guaranteed 例子：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name:  qos-demo-2
spec:
  containers:
    - name: qos-demo-2
      image: busybox
      resources:
        limits:
          cpu: 100m
          memory: 100Mi
        requests:
          cpu: 10m
          memory: 10Mi
      command: 
```

下面是 BestEffort 例子：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name:  qos-demo-3
spec:
  containers:
    - name: qos-demo-3
      image: busybox
      command: 
```

## QoS 优先级

三种 QoS 优先级，从高到低（从左往右）

Guaranteed –> Burstable –> BestEffort


## 资源限制 Limits 和 资源需求 Requests

* 对于CPU：如果pod中服务使用CPU超过设置的 limits，pod不会被kill掉但会被限制。如果没有设置limits，pod可以使用全部空闲的cpu资源。

* 对于内存：当一个pod使用内存超过了设置的 limits，pod中 container 的进程会被 kernel 因OOM kill掉。当container因为OOM被kill掉时，系统倾向于在其原所在的机器上重启该container或其他重新创建一个pod。

## Kubernetes 资源回收策略

Kubernetes 通过cgroup给pod设置QoS级别，当资源不足时先kill优先级低的 pod，在实际使用过程中，通过OOM分数值来实现，OOM分数值范围为0-1000。OOM 分数值根据OOM_ADJ参数计算得出。

对于Guaranteed级别的 Pod，OOM_ADJ参数设置成了-998，对于Best-Effort级别的 Pod，OOM_ADJ参数设置成了1000，对于Burstable级别的 Pod，OOM_ADJ参数取值从2到999。

对于 kuberntes 保留资源，比如kubelet，docker，OOM_ADJ参数设置成了-999，表示不会被OOM kill掉。OOM_ADJ参数设置的越大，计算出来的OOM分数越高，表明该pod优先级就越低，当出现资源竞争时会越早被kill掉，对于OOM_ADJ参数是-999的表示kubernetes永远不会因为OOM将其kill掉。

当集群监控到 node 节点内存或者CPU资源耗尽时，为了保护node正常工作，就会启动资源回收策略，通过驱逐节点上Pod来减少资源占用。

三种 QoS 策略被驱逐优先级，从高到低（从左往右）

BestEffort –> Burstable –> Guaranteed

系统用完了全部内存时，BestEffort类型 pods 会最先被kill掉, 如果内存还不够kill掉Burstable，最后Guaranteed



## 使用建议
* 如果资源充足，可以将 pod QoS 设置为 Guaranteed
* 不是很关键的服务 pod QoS 设置为 Burstable 或者 BestEffort。比如 filebeat、logstash、fluentd等

> 建议：k8s 安装时，建议把 Swap 关闭，虽然 Swap 可以解决内存不足问题，但当内存不足使用Swap时，系统负载会出现过高，原因是 swap 大量 占用磁盘IO