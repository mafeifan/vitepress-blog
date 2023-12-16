默认情况下,docker的日志是在`/var/lib/docker/containers/<container_id>/<container_id>-json.log中。`

使用 `sudo docker info` 发现日志驱动是`Logging Driver: json-file`,也应证了此点。

```bash
root@master:/var/lib/docker/containers/41181a3291527e# tail 41181a3291527e7-json.log
{"log":"AH00558: apache2: Could not reliably determine the server's fully qualified domain name, using 10.233.70.57. Set the 'ServerName' directive globally to suppress this message\n","stream":"stderr","time":"2022-03-14T10:59:59.582206712Z"}
{"log":"AH00558: apache2: Could not reliably determine the server's fully qualified domain name, using 10.233.70.57. Set the 'ServerName' directive globally to suppress this message\n","stream":"stderr","time":"2022-03-14T10:59:59.603628054Z"}
```

通过我们是用`kubectl logs`或`docker logs`来查看日志的，这样的弊端是效率低，如果容器或节点挂了就没法查看了。

我们希望有套独立于k8s集群的日志系统，供查询，分析或可视化展示。

下面的教程是根据[搭建 EFK 日志系统](https://www.qikqiak.com/k8s-book/docs/62.%E6%90%AD%E5%BB%BA%20EFK%20%E6%97%A5%E5%BF%97%E7%B3%BB%E7%BB%9F.html)的建议来做的。

总结几点：

* 在我本地的虚拟机集群测试成功，我的本地k8s集群版本是1.22
* elasticsearch的运行环境对硬件要求比较高，最好2核4G以上,日志文件可能占据大量磁盘容量
* 关于storageClassName的填写，建议看看之前我写的[安装OpenEBS](https://www.mafeifan.com/DevOps/K8s/k8s-%E5%9F%BA%E7%A1%80-%E5%AE%89%E8%A3%85OpenEBS.html),我填写的是`openebs-hostpath`
* 关于elaasticsearch stateful，我填写的replicas和discovery.zen.minimum_master_nodes都是1,因为本地集群中我只配了一个master节点，一个worker节点
* 示例中的镜像版本并非最新稳定，回头再出一版最新版本的实验下


## 安装 elasticsearch

k8s官方推荐做法是采用 [fluentd-elasticsearch](
https://github.com/kubernetes/kubernetes/blob/v1.21.5/cluster/addons/fluentd-elasticsearch/README.md)

你可以把整个addon目录拷贝下来，官方也提到这只是测试目的，生产环境可以去Helm中搜索。

首先创建一个名为 elasticsearch 的无头服务，新建文件 elasticsearch-svc.yaml，文件内容如下：

```yaml
kind: Service
apiVersion: v1
metadata:
  name: elasticsearch
  namespace: logging
  labels:
    app: elasticsearch
spec:
  selector:
    app: elasticsearch
  clusterIP: None
  ports:
    - port: 9200
      name: rest
    - port: 9300
      name: inter-node
```

定义了一个名为 elasticsearch 的 Service，指定标签`app=elasticsearch`，当我们将 Elasticsearch StatefulSet 与此服务关联时，服务将返回带有标签`app=elasticsearch`的 Elasticsearch Pods 的 DNS A 记录，然后设置`clusterIP=None`，将该服务设置成无头服务。

最后，我们分别定义端口9200、9300，分别用于与 REST API 交互，以及用于节点间通信。

```bash
kubectl get services --namespace=logging

NAME            TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)             AGE
elasticsearch   ClusterIP   None         <none>        9200/TCP,9300/TCP   43
```

现在我们已经为 Pod 设置了无头服务和一个稳定的域名`.elasticsearch.logging.svc.cluster.local`，接下来我们通过 StatefulSet 来创建具体的 Elasticsearch 的 Pod 应用。

Kubernetes StatefulSet 允许我们为 Pod 分配一个稳定的标识和持久化存储，Elasticsearch 需要稳定的存储来保证 Pod 在重新调度或者重启后的数据依然不变，所以需要使用 StatefulSet 来管理 Pod。

新建名为 `elasticsearch-statefulset.yaml` 的资源清单文件，首先粘贴下面内容：

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: es-cluster
  namespace: logging
spec:
  serviceName: elasticsearch
  replicas: 3
  selector:
    matchLabels:
      app: elasticsearch
  template:
    metadata:
      labels:
        app: elasticsearch
    spec:
      containers:
      - name: elasticsearch
        image: docker.elastic.co/elasticsearch/elasticsearch-oss:6.4.3
        resources:
            limits:
              cpu: 1000m
            requests:
              cpu: 100m
        ports:
        - containerPort: 9200
          name: rest
          protocol: TCP
        - containerPort: 9300
          name: inter-node
          protocol: TCP
        volumeMounts:
        - name: data
          mountPath: /usr/share/elasticsearch/data
        env:
          - name: cluster.name
            value: k8s-logs
          - name: node.name
            valueFrom:
              fieldRef:
                fieldPath: metadata.name
          - name: discovery.zen.ping.unicast.hosts
            value: "es-cluster-0.elasticsearch,es-cluster-1.elasticsearch,es-cluster-2.elasticsearch"
          - name: discovery.zen.minimum_master_nodes
            value: "2"
          - name: ES_JAVA_OPTS
            value: "-Xms512m -Xmx512m"
      initContainers:
      - name: fix-permissions
        image: busybox
        command: ["sh", "-c", "chown -R 1000:1000 /usr/share/elasticsearch/data"]
        securityContext:
          privileged: true
        volumeMounts:
        - name: data
          mountPath: /usr/share/elasticsearch/data
      - name: increase-vm-max-map
        image: busybox
        command: ["sysctl", "-w", "vm.max_map_count=262144"]
        securityContext:
          privileged: true
      - name: increase-fd-ulimit
        image: busybox
        command: ["sh", "-c", "ulimit -n 65536"]
        securityContext:
          privileged: true
  volumeClaimTemplates:
  - metadata:
      name: data
      labels:
        app: elasticsearch
    spec:
      accessModes: [ "ReadWriteOnce" ]
      storageClassName: es-data-db
      resources:
        requests:
          storage: 100Gi
```        

该内容中，我们定义了一个名为 `es-cluster` 的 `StatefulSet` 对象，然后定义`serviceName=elasticsearch`和前面创建的 Service 相关联，这可以确保使用以下 DNS 地址访问 StatefulSet 中的每一个 Pod：`es-cluster-[0,1,2].elasticsearch.logging.svc.cluster.local`，其中[0,1,2]对应于已分配的 Pod 序号。

然后指定3个副本，将 matchLabels 设置为`app=elasticsearch`，所以 Pod 的模板部分`.spec.template.metadata.lables`也必须包含`app=elasticsearch`标签。

```yaml
k get all -n logging
NAME               READY   STATUS    RESTARTS   AGE
pod/es-cluster-0   1/1     Running   0          23m

NAME                    TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)             AGE
service/elasticsearch   ClusterIP   None         <none>        9200/TCP,9300/TCP   65m

NAME                          READY   AGE
statefulset.apps/es-cluster   1/1     23m
```


Pods 部署完成后，我们可以通过请求一个 REST API 来检查 Elasticsearch 集群是否正常运行。使用下面的命令将本地端口9200转发到 Elasticsearch 节点（如es-cluster-0）对应的端口：

```
$ kubectl port-forward es-cluster-0 9200:9200 --namespace=logging
Forwarding from 127.0.0.1:9200 -> 9200
Forwarding from [::1]:9200 -> 9200
```

然后，在另外的终端窗口中，执行如下请求：

`$ curl http://localhost:9200/_cluster/state?pretty`

```yaml
{
  "cluster_name" : "k8s-logs",
  "compressed_size_in_bytes" : 234,
  "cluster_uuid" : "rRNQupGlS4yda89jFs2acg",
  "version" : 2,
  "state_uuid" : "I6PjJTTdRLKLeHL5qGPQBg",
  "master_node" : "h7r9E6wwTKiEo2GBj6yx2Q",
  "blocks" : { },
  "nodes" : {
    "h7r9E6wwTKiEo2GBj6yx2Q" : {
      "name" : "es-cluster-0",
      "ephemeral_id" : "zcjn6Z0jQ4CwRIASTbEbKQ",
      "transport_address" : "10.233.68.102:9300",
      "attributes" : { }
    }
  },
  "metadata" : {
    "cluster_uuid" : "rRNQupGlS4yda89jFs2acg",
    "templates" : { },
    "indices" : { },
    "index-graveyard" : {
      "tombstones" : [ ]
    }
  },
  "routing_table" : {
    "indices" : { }
  },
  "routing_nodes" : {
    "unassigned" : [ ],
    "nodes" : {
      "h7r9E6wwTKiEo2GBj6yx2Q" : [ ]
    }
  },
  "snapshot_deletions" : {
    "snapshot_deletions" : [ ]
  },
  "snapshots" : {
    "snapshots" : [ ]
  },
  "restore" : {
    "snapshots" : [ ]
  }
}
```

## 安装 Kibana

Elasticsearch 集群启动成功了，接下来我们可以来部署 Kibana 服务，新建一个名为 kibana.yaml 的文件，对应的文件内容如下：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: kibana
  namespace: logging
  labels:
    app: kibana
spec:
  ports:
  - port: 5601
  type: NodePort
  selector:
    app: kibana

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kibana
  namespace: logging
  labels:
    app: kibana
spec:
  selector:
    matchLabels:
      app: kibana
  template:
    metadata:
      labels:
        app: kibana
    spec:
      containers:
      - name: kibana
        image: docker.elastic.co/kibana/kibana-oss:6.4.3
        resources:
          limits:
            cpu: 1000m
          requests:
            cpu: 100m
        env:
          - name: ELASTICSEARCH_URL
            value: http://elasticsearch:9200
        ports:
        - containerPort: 5601
```

上面我们定义了两个资源对象，一个 Service 和 Deployment

唯一需要注意的是我们使用 `ELASTICSEARCH_URL` 这个环境变量来设置`Elasticsearch` 集群的端点和端口，直接使用 Kubernetes DNS 即可，此端点对应服务名称为 elasticsearch，由于是一个 headless service，所以该域将解析为3个 Elasticsearch Pod 的 IP 地址列表。

浏览器访问 Kibana

![](http://pek3b.qingstor.com/hexo-blog/20220506183304.png)

在虚拟机里设置了端口转发，所以宿主机访问地址是：localhost:32256


![](http://pek3b.qingstor.com/hexo-blog/20220314212805.png)

## 部署 Fluentd

`Fluentd` 是一个高效的日志聚合器，是用 Ruby 编写的，并且可以很好地扩展。对于大部分企业来说，Fluentd 足够高效并且消耗的资源相对较少，另外一个工具Fluent-bit更轻量级，占用资源更少，但是插件相对 Fluentd 来说不够丰富，所以整体来说，Fluentd 更加成熟，使用更加广泛，所以我们这里也同样使用 Fluentd 来作为日志收集工具。

Fluentd 通过一组给定的数据源抓取日志数据，处理后（转换成结构化的数据格式）将它们转发给其他服务，比如 Elasticsearch、对象存储等等。Fluentd 支持超过300个日志存储和分析服务，所以在这方面是非常灵活的。主要运行步骤如下：

* 首先 Fluentd 从多个日志源获取数据
* 结构化并且标记这些数据
* 然后根据匹配的标签将数据发送到多个目标服务去

![](http://pek3b.qingstor.com/hexo-blog/20220314213044.png)

### 配置
一般来说我们是通过一个配置文件来告诉 Fluentd 如何采集、处理数据的，下面简单和大家介绍下 Fluentd 的配置方法。


### 日志源配置
比如我们这里为了收集 Kubernetes 节点上的所有容器日志，就需要做如下的日志源配置：

```
<source>

@id fluentd-containers.log

@type tail

path /var/log/containers/*.log

pos_file /var/log/fluentd-containers.log.pos

time_format %Y-%m-%dT%H:%M:%S.%NZ

tag raw.kubernetes.*

format json

read_from_head true

</source>
```

* id：表示引用该日志源的唯一标识符，该标识可用于进一步过滤和路由结构化日志数据
* type：Fluentd 内置的指令，tail表示 Fluentd 从上次读取的位置通过 tail 不断获取数据，另外一个是http表示通过一个 GET 请求来收集数据。
* path：tail类型下的特定参数，告诉 Fluentd 采集/var/log/containers目录下的所有日志，这是 docker 在 Kubernetes 节点上用来存储运行容器 stdout 输出日志数据的目录。
* pos_file：检查点，如果 Fluentd 程序重新启动了，它将使用此文件中的位置来恢复日志数据收集。
* tag：用来将日志源与目标或者过滤器匹配的自定义字符串，Fluentd 匹配源/目标标签来路由日志数据。

### 路由配置
上面是日志源的配置，接下来看看如何将日志数据发送到 Elasticsearch：

```
<match **>

@id elasticsearch

@type elasticsearch

@log_level info

include_tag_key true

type_name fluentd

host "#{ENV['OUTPUT_HOST']}"

port "#{ENV['OUTPUT_PORT']}"

logstash_format true

<buffer>

@type file

path /var/log/fluentd-buffers/kubernetes.system.buffer

flush_mode interval

retry_type exponential_backoff

flush_thread_count 2

flush_interval 5s

retry_forever

retry_max_interval 30

chunk_limit_size "#{ENV['OUTPUT_BUFFER_CHUNK_LIMIT']}"

queue_limit_length "#{ENV['OUTPUT_BUFFER_QUEUE_LIMIT']}"

overflow_action block

</buffer>
```

* match：标识一个目标标签，后面是一个匹配日志源的正则表达式，我们这里想要捕获所有的日志并将它们发送给 Elasticsearch，所以需要配置成**。
* id：目标的一个唯一标识符。
* type：支持的输出插件标识符，我们这里要输出到 Elasticsearch，所以配置成 elasticsearch，这是 Fluentd 的一个内置插件。
* log_level：指定要捕获的日志级别，我们这里配置成info，表示任何该级别或者该级别以上（INFO、WARNING、ERROR）的日志都将被路由到 Elsasticsearch。
* host/port：定义 Elasticsearch 的地址，也可以配置认证信息，我们的 Elasticsearch 不需要认证，所以这里直接指定 host 和 port 即可。
* logstash_format：Elasticsearch 服务对日志数据构建反向索引进行搜索，将 logstash_format 设置为true，Fluentd 将会以 logstash 格式来转发结构化的日志数据。
* Buffer： Fluentd 允许在目标不可用时进行缓存，比如，如果网络出现故障或者 Elasticsearch 不可用的时候。缓冲区配置也有助于降低磁盘的 IO。

### 安装
要收集 Kubernetes 集群的日志，直接用 DasemonSet 控制器来部署 Fluentd 应用，这样，它就可以从 Kubernetes 节点上采集日志，确保在集群中的每个节点上始终运行一个 Fluentd 容器。

当然可以直接使用 Helm 来进行一键安装，为了能够了解更多实现细节，我们这里还是采用手动方法来进行安装。

首先，我们通过 ConfigMap 对象来指定 Fluentd 配置文件，新建 fluentd-configmap.yaml 文件，文件内容如下：

```yaml
kind: ConfigMap
apiVersion: v1
metadata:
  name: fluentd-config
  namespace: logging
  labels:
    addonmanager.kubernetes.io/mode: Reconcile
data:
  system.conf: |-
    <system>
      root_dir /tmp/fluentd-buffers/
    </system>
  containers.input.conf: |-
    <source>
      @id fluentd-containers.log
      @type tail
      path /var/log/containers/*.log
      pos_file /var/log/es-containers.log.pos
      time_format %Y-%m-%dT%H:%M:%S.%NZ
      localtime
      tag raw.kubernetes.*
      format json
      read_from_head true
    </source>
    # Detect exceptions in the log output and forward them as one log entry.
    <match raw.kubernetes.**>
      @id raw.kubernetes
      @type detect_exceptions
      remove_tag_prefix raw
      message log
      stream stream
      multiline_flush_interval 5
      max_bytes 500000
      max_lines 1000
    </match>
  system.input.conf: |-
    # Logs from systemd-journal for interesting services.
    <source>
      @id journald-docker
      @type systemd
      filters [{ "_SYSTEMD_UNIT": "docker.service" }]
      <storage>
        @type local
        persistent true
      </storage>
      read_from_head true
      tag docker
    </source>
    <source>
      @id journald-kubelet
      @type systemd
      filters [{ "_SYSTEMD_UNIT": "kubelet.service" }]
      <storage>
        @type local
        persistent true
      </storage>
      read_from_head true
      tag kubelet
    </source>
  forward.input.conf: |-
    # Takes the messages sent over TCP
    <source>
      @type forward
    </source>
  output.conf: |-
    # Enriches records with Kubernetes metadata
    <filter kubernetes.**>
      @type kubernetes_metadata
    </filter>
    <match **>
      @id elasticsearch
      @type elasticsearch
      @log_level info
      include_tag_key true
      host elasticsearch
      port 9200
      logstash_format true
      request_timeout    30s
      <buffer>
        @type file
        path /var/log/fluentd-buffers/kubernetes.system.buffer
        flush_mode interval
        retry_type exponential_backoff
        flush_thread_count 2
        flush_interval 5s
        retry_forever
        retry_max_interval 30
        chunk_limit_size 2M
        queue_limit_length 8
        overflow_action block
      </buffer>
    </match>
```

上面配置文件中我们配置了 docker 容器日志目录以及 docker、kubelet 应用的日志的收集，收集到数据经过处理后发送到 elasticsearch:9200 服务。

然后新建一个 fluentd-daemonset.yaml 的文件，文件内容如下：

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: fluentd-es
  namespace: logging
  labels:
    k8s-app: fluentd-es
    kubernetes.io/cluster-service: "true"
    addonmanager.kubernetes.io/mode: Reconcile
---
kind: ClusterRole
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: fluentd-es
  labels:
    k8s-app: fluentd-es
    kubernetes.io/cluster-service: "true"
    addonmanager.kubernetes.io/mode: Reconcile
rules:
- apiGroups:
  - ""
  resources:
  - "namespaces"
  - "pods"
  verbs:
  - "get"
  - "watch"
  - "list"
---
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: fluentd-es
  labels:
    k8s-app: fluentd-es
    kubernetes.io/cluster-service: "true"
    addonmanager.kubernetes.io/mode: Reconcile
subjects:
- kind: ServiceAccount
  name: fluentd-es
  namespace: logging
  apiGroup: ""
roleRef:
  kind: ClusterRole
  name: fluentd-es
  apiGroup: ""
---
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluentd-es
  namespace: logging
  labels:
    k8s-app: fluentd-es
    version: v2.0.4
    kubernetes.io/cluster-service: "true"
    addonmanager.kubernetes.io/mode: Reconcile
spec:
  selector:
    matchLabels:
      k8s-app: fluentd-es
      version: v2.0.4
  template:
    metadata:
      labels:
        k8s-app: fluentd-es
        kubernetes.io/cluster-service: "true"
        version: v2.0.4
      # This annotation ensures that fluentd does not get evicted if the node
      # supports critical pod annotation based priority scheme.
      # Note that this does not guarantee admission on the nodes (#40573).
      annotations:
        scheduler.alpha.kubernetes.io/critical-pod: ''
    spec:
      serviceAccountName: fluentd-es
      containers:
      - name: fluentd-es
        image: cnych/fluentd-elasticsearch:v2.0.4
        env:
        - name: FLUENTD_ARGS
          value: --no-supervisor -q
        resources:
          limits:
            memory: 500Mi
          requests:
            cpu: 100m
            memory: 200Mi
        volumeMounts:
        - name: varlog
          mountPath: /var/log
        - name: varlibdockercontainers
          mountPath: /var/lib/docker/containers
          readOnly: true
        - name: config-volume
          mountPath: /etc/fluent/config.d
      nodeSelector:
        beta.kubernetes.io/fluentd-ds-ready: "true"
      tolerations:
      - key: node-role.kubernetes.io/master
        operator: Exists
        effect: NoSchedule
      terminationGracePeriodSeconds: 30
      volumes:
      - name: varlog
        hostPath:
          path: /var/log
      - name: varlibdockercontainers
        hostPath:
          path: /var/lib/docker/containers
      - name: config-volume
        configMap:
          name: fluentd-config
```

我们将上面创建的 fluentd-config 这个 ConfigMap 对象通过 volumes 挂载到了 Fluentd 容器中，另外为了能够灵活控制哪些节点的日志可以被收集，所以我们这里还添加了一个 nodSelector 属性：


```yaml
nodeSelector:
  beta.kubernetes.io/fluentd-ds-ready: "true"
```

另外由于我们的集群使用的是 kubeadm 搭建的，默认情况下 master 节点有污点，所以要想也收集 master 节点的日志，则需要添加上容忍：
```yaml
tolerations:
- key: node-role.kubernetes.io/master
  operator: Exists
  effect: NoSchedule
```

来看下完整的输出

```bash
$ k get all -n logging -o wide
NAME                          READY   STATUS    RESTARTS   AGE   IP              NODE     NOMINATED NODE   READINESS GATES
pod/es-cluster-0              1/1     Running   0          72m   10.233.68.102   vm2      <none>           <none>
pod/fluentd-es-hdt2t          1/1     Running   0          58s   10.233.68.104   vm2      <none>           <none>
pod/fluentd-es-t8f7j          1/1     Running   0          58s   10.233.70.66    master   <none>           <none>
pod/kibana-7dfb9d8bc5-xrxs7   1/1     Running   0          42m   10.233.68.103   vm2      <none>           <none>

NAME                    TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)             AGE    SELECTOR
service/elasticsearch   ClusterIP   None            <none>        9200/TCP,9300/TCP   114m   app=elasticsearch
service/kibana          NodePort    10.233.42.144   <none>        5601:32236/TCP      42m    app=kibana

NAME                        DESIRED   CURRENT   READY   UP-TO-DATE   AVAILABLE   NODE SELECTOR                              AGE   CONTAINERS   IMAGES                               SELECTOR
daemonset.apps/fluentd-es   2         2         2       2            2           beta.kubernetes.io/fluentd-ds-ready=true   59s   fluentd-es   cnych/fluentd-elasticsearch:v2.0.4   k8s-app=fluentd-es,version=v2.0.4

NAME                     READY   UP-TO-DATE   AVAILABLE   AGE   CONTAINERS   IMAGES                                      SELECTOR
deployment.apps/kibana   1/1     1            1           42m   kibana       docker.elastic.co/kibana/kibana-oss:6.4.3   app=kibana

NAME                                DESIRED   CURRENT   READY   AGE   CONTAINERS   IMAGES                                      SELECTOR
replicaset.apps/kibana-7dfb9d8bc5   1         1         1       42m   kibana       docker.elastic.co/kibana/kibana-oss:6.4.3   app=kibana,pod-template-hash=7dfb9d8bc5

NAME                          READY   AGE   CONTAINERS      IMAGES
statefulset.apps/es-cluster   1/1     72m   elasticsearch   docker.elastic.co/elasticsearch/elasticsearch-oss:6.4.3
```

Fluentd 启动成功后，我们可以前往 Kibana 的 Dashboard 页面中，点击左侧的Discover，可以看到如下配置页面：

![](http://pek3b.qingstor.com/hexo-blog/20220314215213.png)

在这里可以配置我们需要的 Elasticsearch 索引，前面 Fluentd 配置文件中我们采集的日志使用的是 logstash 格式，这里只需要在文本框中输入`logstash-*`即可匹配到 Elasticsearch 集群中的所有日志数据，然后点击下一步，进入以下页面：

![](http://pek3b.qingstor.com/hexo-blog/20220314215318.png)

在该页面中配置使用哪个字段按时间过滤日志数据，在下拉列表中，选择`@timestamp`字段，然后点击`Create index pattern`，创建完成后，点击左侧导航菜单中的 `Discover`，然后就可以看到一些直方图和最近采集到的日志数据了：

![](http://pek3b.qingstor.com/hexo-blog/20220314215627.png)

发现日志集中时间在晚上9点多，因为我这是本地虚拟机里的测试集群，随用随开。


## 测试
现在我们来将上一节课的计数器应用部署到集群中，并在 Kibana 中来查找该日志数据。

新建 counter.yaml 文件，文件内容如下：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: counter
spec:
  containers:
  - name: count
    image: busybox
    args: [/bin/sh, -c,
            'i=0; while true; do echo "$i: $(date)"; i=$((i+1)); sleep 1; done']
```

该 Pod 只是简单将日志信息打印到 stdout，所以正常来说 Fluentd 会收集到这个日志数据，在 Kibana 中也就可以找到对应的日志数据了，创建该 Pod

Pod 创建并运行后，回到 Kibana Dashboard 页面，在上面的Discover页面搜索栏中输入`kubernetes.pod_name:counter`，就可以过滤 Pod 名为 counter 的日志数据：

![](http://pek3b.qingstor.com/hexo-blog/20220314222751.png)

我们也可以通过其他元数据来过滤日志数据，比如 您可以单击任何日志条目以查看其他元数据，如容器名称，Kubernetes 节点，命名空间等。

到这里，我们就在 Kubernetes 集群上成功部署了 EFK ，要了解如何使用 Kibana 进行日志数据分析，可以参考 Kibana 用户指南文档：https://www.elastic.co/guide/en/kibana/current/index.html

当然对于在生产环境上使用 Elaticsearch 或者 Fluentd，还需要结合实际的环境做一系列的优化工作.

## 参考

https://www.qikqiak.com/k8s-book/docs/62.%E6%90%AD%E5%BB%BA%20EFK%20%E6%97%A5%E5%BF%97%E7%B3%BB%E7%BB%9F.html