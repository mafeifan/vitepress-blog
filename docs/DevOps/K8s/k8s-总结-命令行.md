记录学习k8s过程中有用的命令行

```bash
# 起别名，缩短命令
alias k=kubectl
alias kd="kubectl describe"
export do="--dry-run=client -o yaml"    # k get pod x $do # 只运行不真正生成资源
export now="--force --grace-period 0"   # k delete pod x $now  # 立刻强制删除pod

# yaml 缩进
# vi 打开文件，按 esc 并输入 :set shiftwidth=2 来设置缩进空格数
# 缩进多行
# shift+v 并按上下键，选中多行，再按 > 或 < 将选中的内容缩进
```

## 集群命令
```bash
k get nodes

k config get-clusters
k cluster-info
k create ns demo
# 设置默认命名空间
k config set-context $(kubectl config current-context) --namespace=demo

k run nginx --image=nginx
kd pod/nginx
k exec nginx -it -- curl localhost

k create deployment nginx --image=nginx --replicas=2
k get deployments
kd deployment nginx

k get events
k get events --sort-by=.metadata.creationTimestamp
k get deployment nginx -o yaml
k get deployment nginx -o yaml > first.yaml

k delete deployment nginx
k create -f first.yaml

k get deployment nginx -o yaml > second.yaml
diff first.yaml second.yaml

# 只查看不运行
k create deployment two --image=nginx --dry-run=client -o yaml

k get deploy,pod
k expose deployment nginx --port=80
# (可选)创建一个水平自动扩展调节器, 根据 CPU 负载将 Pod 数量从 3 个扩缩为 1 到 5 个之间
k autoscale deployment nginx --cpu-percent=80 --min=1 --max=5
k get deploy,pod,svc
# 记住 10.76.2.119
k get ep nginx
# 扩容
k scale deployment nginx --replicas=3
# 变为了三个endpoint
k get ep nginx
k get pod -o wide
k exec nginx-6799fc88d8-7z8w7  -i -t -- bash
# 容器内执行

curl 10.76.2.119
printenv

  KUBERNETES_SERVICE_PORT_HTTPS=443
  KUBERNETES_SERVICE_PORT=443
  HOSTNAME=nginx-6799fc88d8-7z8w7
  PWD=/
  PKG_RELEASE=1~bullseye
  HOME=/root
  KUBERNETES_PORT_443_TCP=tcp://10.80.0.1:443
  NJS_VERSION=0.7.0
  TERM=xterm
  SHLVL=1
  KUBERNETES_PORT_443_TCP_PROTO=tcp
  KUBERNETES_PORT_443_TCP_ADDR=10.80.0.1
  KUBERNETES_SERVICE_HOST=10.80.0.1
  KUBERNETES_PORT=tcp://10.80.0.1:443
  KUBERNETES_PORT_443_TCP_PORT=443
  PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
  NGINX_VERSION=1.21.4
  _=/usr/bin/printenv

# 新建一个deployment以供实验
kubectl create deployment redis --image=redis:3.2

# 修改deployment的image版本
kubectl set image deployment redis redis=redis:latest --record

# 查看redis的历史版本
kubectl rollout history deployment redis

# 修改deployment的版本，退回到上一个版本
kubectl rollout undo deployment redis

# 修改deployment的版本，退回到指定的版本
kubectl rollout undo deployment redis --to-revision=1

# 输出deployment的spec信息拿出来。
kubectl get deployment redis -o=custom-columns=NAME:spec > aim.txt

# kubectl replace用提供的规范定义的资源完全替换现有资源。 希望输入完整的规范，删除老的，创建新的
# kubectl apply使用提供的规范来创建资源(如果该资源不存在)并进行更新(即修补)(如果存在的话)，提供给apply的规范仅需包含规范的必需部分
# kubectl patch 更新字段

# 忘了 yaml 中某资源或参数的用法，使用 explain 现学现卖
k explain jobs
k explain jobs.spec
```

### 关于 -o 输出选项参数
参考：https://kubernetes.io/docs/reference/kubectl/overview/#output-options

```bash
k get pods

NAME                     READY   STATUS    RESTARTS   AGE
nginx-6799fc88d8-7z8w7   1/1     Running   0          13d

k get pods nginx-6799fc88d8-7z8w7

NAME                     READY   STATUS    RESTARTS   AGE
nginx-6799fc88d8-7z8w7   1/1     Running   0          13d

k get pods nginx-6799fc88d8-7z8w7 -o=name

pod/nginx-6799fc88d8-7z8w7

#  -o=wide 输出更多信息
k get pods nginx-6799fc88d8-7z8w7 -o=wide

NAME                     READY   STATUS    RESTARTS   AGE   IP            NODE                                       NOMINATED NODE   READINESS GATES
nginx-6799fc88d8-7z8w7   1/1     Running   0          13d   10.76.2.119   gke-cluster-1-default-pool-2d9ab2a3-ynnj   <none>           <none>

# 输出格式
k get pods nginx-6799fc88d8-7z8w7 -o=json
k get pods nginx-6799fc88d8-7z8w7 -o=yaml

# 提取行
k get pods -A -o=custom-columns=time:.metadata.creationTimestamp
# 输出
time
2022-02-21T13:58:14Z
2022-02-21T15:01:21Z
2022-02-21T13:58:14Z
2022-02-21T13:58:14Z
2022-02-21T13:58:14Z

k get pods nginx-6799fc88d8-7z8w7 -o=custom-columns=IP:.status.podIP,c2:.status.startTime
IP            c2
10.76.2.119   2021-12-17T15:06:16Z
```

```bash
# 新建 column.txt，内容如下，用来定义要显示的列

Pod的IP        启动时间
.status.podIP .status.startTime

k get pods nginx-6799fc88d8-7z8w7 -o=custom-columns-file=column.txt
Pod的IP        启动时间
10.76.2.119   2021-12-17T15:06:16Z
```

## 节点的启停

为了确保重启Master节点期间Kubernetes集群能够使用，集群中master节点数量要大于等于3

```bash
# 备份数据,关于备份看我写的其他章节
velero backup create
# 设置为不可调度
k cordon master
# 驱逐上面的工作负载
# delet-local-data 会删除Pod的临时数据，不会删除持久化数据 
k drain master --ignore-damonsets --delet-local-data
# 停止kubelet etcd docker
systemctl stop kubelet
systemctl stop etcd
systemctl stop docker
```


## 节点打标签
```bash
k get nodes --show-labels
# 添加标签
k label node vm2 beta.kubernetes.io/fluentd-ds-ready=true
# 移除标签
k label node vm2 beta.kubernetes.io/fluentd-ds-ready-
```


## 集群停止与恢复
```bash
kubectl get nodes -o name

node/master
node/vm2

# 停止顺序 kubelet etcd docker
# 启动时顺序相反 启动顺序 docker -> etcd -> kubelet
nodes=$(kubectl get nodes -o name | aws -F[/] '{print $2}')
for node in ${nodes[@]}
do 
  echo "==STOP kubelet on $node=="
  ssh root@$node systemctl stop kubelet && systemctl stop etcd && systemctl stop docer
done 
```

## 查看组件状态
```bash
# 缩写 k get cs
k get componentstatuses

# 由于本身服务是正常的，只是健康检查的端口没启，所以不影响正常使用
Warning: v1 ComponentStatus is deprecated in v1.19+
NAME                 STATUS      MESSAGE                                                                                       ERROR
scheduler            Unhealthy   Get "http://127.0.0.1:10251/healthz": dial tcp 127.0.0.1:10251: connect: connection refused
controller-manager   Unhealthy   Get "http://127.0.0.1:10252/healthz": dial tcp 127.0.0.1:10252: connect: connection refused
etcd-0               Healthy     {"health":"true"}

# 开启 scheduler， control-manager的10251，10252端口

# 修改以下配置文件：

# 静态pod的路径：/etc/kubernetes/manifests

vi kube-scheduler.yaml，把port=0那行注释
vi kube-controller-manager.yaml，把port=0那行注释

# 这时候再检查，正常了
k get cs
Warning: v1 ComponentStatus is deprecated in v1.19+
NAME                 STATUS    MESSAGE             ERROR
controller-manager   Healthy   ok
scheduler            Healthy   ok
etcd-0               Healthy   {"health":"true"}
```

## etcd
检查 etcd 状态

```bash
source /etc/etcd.env

etcdctl --endpoints=${ETCD_LISTEN_CLIENT_URLS} \ 
--cacert=${ETCD_TRUSTED_CA_FILE} \
--cert=${ETCD_CERT_FILE} \
--key=${ETCD_KEY_FILE} \
endpoint health

https://127.0.0.1:2379 is healthy: successfully committed proposal: took = 30.02469ms
https://192.168.50.111:2379 is healthy: successfully committed proposal: took = 53.164703ms
```

#### 查看日志

journalctl -u etcd.service

## taint 污点

默认情况下，master节点存在以下污点：
`Taints: node-role.kubernetes.io/master:NoSchedule`
导致Pod不会被分配到master节点上面

移除污点
`k taint node master node-role.kubernetes.io/master:NoSchedule-`

如果要设置回来

`k taint node master node-role.kubernetes.io/master=:NoSchedule`

## 证书解密

kubeconfig 文件保存着集群、用户和上下文信息，这些信息都是加密的，需要解密

`kubectl config view --minify --raw --output 'jsonpath={..cluster.certificate-authority-data}'`

输出类似，一看就是base64编码过的

```
LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUM1ekNDQWMrZ0F3SUJBZ0lCQU....URS0tLS0tCg==
```

解码

```
sudo cat ~/kube/config | grep client-certificate-data | cut -f2 -d : | tr -d ' ' | base64 -d | openssl x509 -text -in -
```

输出

```
Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number: 931386242226475695 (0xcecf2da449852af)
        Signature Algorithm: sha256WithRSAEncryption
        Issuer: CN = kubernetes
        Validity
            Not Before: Feb 28 05:57:26 2022 GMT
            Not After : Feb 28 05:57:28 2023 GMT
        Subject: O = system:masters, CN = kubernetes-admin
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                RSA Public-Key: (2048 bit)
                Modulus:
                    00:bb:e5:be:e2:4e:5f:06:1d:b6:4b:59:b4:d7:a9:
                    fd:dc:01:5b:5d:26:bd:ce:02:50:0b:b9:eb:cd:b6:
                    b7:35:f8:a6:da:1d:68:c5:49:f4:c4:48:2f:14:ad:
                    81:17:da:9e:99:78:97:6c:36:ae:ba:bc:ce:99:90:
                    89:80:4f:4e:19:d4:b4:46:07:da:9c:27:a8:50:23:
                    1b:be:e3:26:be:36:37:ab:af:0b:ce:49:2b:66:15:
                    a2:2a:2a:c3:8a:4d:1a:a5:9d:a2:c2:b2:4c:3b:65:
                    4a:2d:99:2e:25:d5:fa:1f:8a:69:e3:63:62:9a:92:
                    5d:82:e4:d5:6b:82:bf:56:6c:5d:fc:6a:4e:5a:08:
                    82:68:1b:3a:25:ce:ec:1e:c1:47:a8:0b:44:48:44:
                    5c:28:da:8e:e6:22:39:07:45:e1:bb:9a:33:3d:2a:
                    0a:0d:05:d9:22:76:35:3c:6b:be:c4:cc:d9:7c:72:
                    96:fa:b7:55:3e:95:ea:98:81:7b:f9:92:af:47:13:
                    1c:96:ce:08:ea:b8:41:50:fd:94:45:19:30:8c:6f:
                    a8:ee:1d:c6:d2:d0:4d:ce:d9:7e:19:16:44:76:31:
                    e5:e7:78:6c:49:d1:58:ce:cb:4a:5c:c7:ef:db:1f:
                    79:cc:e7:12:d4:c9:9a:9b:d9:9a:ad:2b:72:55:eb:
                    8d:cb
                Exponent: 65537 (0x10001)
        X509v3 extensions:
            X509v3 Key Usage: critical
                Digital Signature, Key Encipherment
            X509v3 Extended Key Usage:
                TLS Web Client Authentication
            X509v3 Basic Constraints: critical
                CA:FALSE
            X509v3 Authority Key Identifier:
                keyid:8F:AF:E7:AF:07:48:02:10:DE:C2:B7:63:35:EA:A8:F4:A3:38:A4:3B

    Signature Algorithm: sha256WithRSAEncryption
         1a:65:09:3f:3f:13:14:b2:c6:7e:5f:7a:2e:14:47:80:c9:6f:
         1a:5d:c7:54:04:3a:dd:59:17:24:64:57:50:37:40:1a:23:86:
         42:3d:94:c3:2d:d6:08:89:66:2c:2d:01:0f:56:54:9d:1a:93:
         e9:c7:20:f1:5d:fc:d6:52:b4:2b:91:07:c7:c1:e0:f8:7b:4d:
         98:b8:06:7b:5c:19:d1:1d:d5:45:29:e9:12:c8:da:83:fe:12:
         28:e0:ea:28:1e:77:64:b3:91:b1:25:b5:8b:19:2a:77:f5:50:
         3b:29:90:fd:65:36:93:e7:98:ec:ab:c5:57:03:ca:92:26:7f:
         56:b7:a8:89:a2:cb:6e:c3:6d:cc:93:cd:33:c7:f7:79:65:d3:
         22:2d:16:08:b4:f1:dd:15:77:74:b6:5b:c8:82:ab:ff:72:d3:
         82:c0:31:12:e8:6e:1e:ea:48:be:be:bc:f0:4b:83:c8:a1:7d:
         df:57:bb:8e:b5:70:95:78:25:27:5c:e4:b9:d6:68:c6:f6:1d:
         9d:b9:52:c5:4d:94:36:45:7d:e7:85:19:d3:93:26:08:66:b4:
         1c:86:05:54:48:6c:a9:c2:84:d3:ef:54:97:67:2a:f8:ca:0b:
         fb:5d:95:1b:5a:90:c9:27:3e:e7:95:a4:35:c1:54:a5:bd:33:
         cd:66:bb:3b
-----BEGIN CERTIFICATE-----
MIIDITCCAgmgAwIBAgIIDOzy2kSYUq8wDQYJKoZIhvcNAQELBQAwFTETMBEGA1UE
AxMKa3ViZXJuZXRlczAeFw0yMjAyMjgwNTU3MjZaFw0yMzAyMjgwNTU3MjhaMDQx
FzAVBgNVBAoTDnN5c3RlbTptYXN0ZXJzMRkwFwYDVQQDExBrdWJlcm5ldGVzLWFk
bWluMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu+W+4k5fBh22S1m0
16n93AFbXSa9zgJQC7nrzba3Nfim2h1oxUn0xEgvFK2BF9qemXiXbDauurzOmZCJ
gE9OGdS0RgfanCeoUCMbvuMmvjY3q68LzkkrZhWiKirDik0apZ2iwrJMO2VKLZku
JdX6H4pp42NimpJdguTVa4K/Vmxd/GpOWgiCaBs6Jc7sHsFHqAtESERcKNqO5iI5
B0Xhu5ozPSoKDQXZInY1PGu+xMzZfHKW+rdVPpXqmIF7+ZKvRxMcls4I6rhBUP2U
RRkwjG+o7h3G0tBNztl+GRZEdjHl53hsSdFYzstKXMfv2x95zOcS1Mmam9marSty
VeuNywIDAQABo1YwVDAOBgNVHQ8BAf8EBAMCBaAwEwYDVR0lBAwwCgYIKwYBBQUH
AwIwDAYDVR0TAQH/BAIwADAfBgNVHSMEGDAWgBSPr+evB0gCEN7Ct2M16qj0ozik
OzANBgkqhkiG9w0BAQsFAAOCAQEAGmUJPz8TFLLGfl96LhRHgMlvGl3HVAQ63VkX
JGRXUDdAGiOGQj2Uwy3WCIlmLC0BD1ZUnRqT6ccg8V381lK0K5EHx8Hg+HtNmLgG
e1wZ0R3VRSnpEsjag/4SKODqKB53ZLORsSW1ixkqd/VQOymQ/WU2k+eY7KvFVwPK
kiZ/VreoiaLLbsNtzJPNM8f3eWXTIi0WCLTx3RV3dLZbyIKr/3LTgsAxEuhuHupI
vr688EuDyKF931e7jrVwlXglJ1zkudZoxvYdnblSxU2UNkV954UZ05MmCGa0HIYF
VEhsqcKE0+9Ul2cq+MoL+12VG1qQySc+55WkNcFUpb0zzWa7Ow==
-----END CERTIFICATE-----
```


https://kubernetes.io/zh/docs/tasks/access-application-cluster/configure-access-multiple-clusters/


## 参考
https://github.com/RehanSaeed/Kubernetes-Cheat-Sheet
