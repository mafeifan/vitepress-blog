## 前言

这篇文章的目的是让大家利用 Docker Desktop 跑一个单节点的 k8s，
需要说明的是单节点无法满足生产环境高可用的要求，但是对于个人来说成本比较高，生产环境至少需要三个节点

这里主要为了熟悉常用概念和命令，有一个大概的认识。

## k8s 安装
k8s 由 controller-manager, scheduler, api server, coreDNS 等组件组成。还需要容器运行时环境。

这里容器运行时就是 docker。

这些组件被制作成了镜像，镜像仓库在`k8s.gcr.io` 是 google 的镜像仓库，国内无法直接访问。

我们可以参考这个[项目](https://github.com/AliyunContainerService/k8s-for-docker-desktop)提供的脚本，
从阿里源下载并安装镜像。

> 注意 Docker Desktop 带的 k8s 版本要和 images.properties 文件中提供的一致

![](https://pek3b.qingstor.com/hexo-blog/20220129195250.png)

## 命令介绍

k8s 启动成功后打开终端，我们的练习全部通过终端进行

kubectl 是 k8s 命令行工具，可以使用 kubectl 来部署应用、监测和管理集群资源以及查看日志。

```bash
# 查看节点信息
kubectl get nodes

# 输出节点名称，状态，角色，启动时间和版本
NAME             STATUS   ROLES                  AGE   VERSION
docker-desktop   Ready    control-plane,master   14d   v1.22.5

# 查看命名空间
# namespace 用来区分不同团队或项目，有隔离资源的作用
# 以`kube-`开头的是k8s自己占用的命名空间，如果创建的资源不指定 namespace 则默认使用 default
# 或者使用 kubectl get namespace, ns 是缩写
kubectl get ns

# 创建一个 namespace，我们在这个 namespace 下面创建资源
kubectl create namespace demo

# 指定默认命名空间为demo, 执行该操作会修改`~/.kube/config`配置文件
kubectl config set-context $(kubectl config current-context) --namespace=demo

# 创建一个 Pod，镜像为 nginx
# Pod 是可以在 Kubernetes 中创建和管理的、最小的可部署的计算单元。
# 一个 Pod 可以包含多个容器，这些容器共享存储，网络
kubectl run nginx --image=nginx

# 查看 Pod
kubectl get pods

NAME    READY   STATUS    RESTARTS   AGE
nginx   1/1     Running   0          45s

# 查看 Pod 具体信息, 留意生成的Pod IP
kubectl describe pod/nginx

# 进入容器
kubectl exec nginx -it -- bash

# 在容器内执行命令，会返回nginx欢迎页面的html，最后exit退出容器
root@nginx:/# curl localhost
root@nginx:/# curl nginx
# 刚才的 Pod IP 会被记录在hosts文件里，记下内网IP：如 172.31.56.149
root@nginx:/# cat /etc/hosts
# nginx version: nginx/1.21.5
root@nginx:/# nginx -v
root@nginx:/# exit
```

> 如果我们ssh登录k8s所在的任一节点, `curl 172.31.56.149` 是有nginx内容返回的，说明 Pod 在k8s在整个集群内部是通的

```bash
# 销毁 Pod
kubectl delete pod/nginx

# 实际上，我们很少通过 Pod 来跑服务，通常使用 Deployment，StatefulSet 和 DaemonSet 来替代
# 因为 Pod 一旦出现问题，比如资源不足，网络不通等，无法自动重启，扩容，转移等

# 先看帮助文档里提供了哪些参数
kubectl create deployment -h

# 创建一个 deployment，名为 nginx，副本数为2
# 假设有两个工作节点，每个节点运行一个同样的 Pod，这样即便其中一个节点挂掉了，另给一个还能正常工作，达到高可用的目的
kubectl create deployment nginx --image=nginx --replicas=2

# 观察资源情况，我们看到可用数 0/2 变为 1/2 最终 2/2
kubectl get deployment nginx --watch

# 查看 Pod，和期望的一致，运行了两个 Pod
kubectl get pods

NAME                     READY   STATUS    RESTARTS   AGE
nginx-6799fc88d8-r8lmj   1/1     Running   0          2m49s
nginx-6799fc88d8-t9pms   1/1     Running   0          2m49s

# 假设我们删除其中一个, 再次观察，会发现又启动了一个新的 Pod
kubectl delete pod/nginx-6799fc88d8-t9pms

# --watch 的简写
kubectl get pods -w
```

#### kubernetes 会始终保持预期创建的对象存在和集群运行在预期的状态下。

```bash
# 我们现在编辑 deployment, 此时会呼出编辑器或vim，修改 replicas 为 1
kubectl edit deployment nginx

# pod 数量会和 replicas 保持一致
kubectl get pods -w

# 如果只想改副本数，可以使用 scale
kubectl scale deployment nginx --replicas=3

# 修改 image 版本
kubectl set image deployment/nginx nginx=nginx:1.16.1 --record

# 注意观察
kubectl get pods -w

# 如果我们细心观察，假设当前副本数3，每个 Pod 里面跑着 nginx/1.21.5，当 set image为 nginx=nginx:1.16.1
# k8s 会先启动一个新的 Pod，里面运行着1.16.1，此时有4个 Pod 正在运行
# 只有新的 Pod 运行成功才会销毁一个旧的 Pod, 会这样依次滚动更新，新旧版本会平滑过渡，直到全部更新完成，可以保证我们的服务不被中断。

NAME                     READY   STATUS              RESTARTS   AGE
nginx-6799fc88d8-bcfpz   1/1     Running             0          51s
nginx-6799fc88d8-msgkf   1/1     Running             0          51s
nginx-6799fc88d8-r8lmj   1/1     Running             0          19m
nginx-6889dfccd5-t52mv   0/1     ContainerCreating   0          6s


# 查看 deployment 的版本更新历史

deployment.apps/nginx
REVISION  CHANGE-CAUSE
1         kubectl.exe scale deployment nginx --replicas=3 --record=true
2         kubectl.exe set image deployment/nginx nginx=nginx:1.16.1 --record=true

# 回退到上一个版本
kubectl rollout undo deployment nginx

# 回退到 to-revision 指定的版本
kubectl rollout undo deployment redis --to-revision=1
```

## 服务暴露

k8s 并没有`docker -p`那样直接将容器端口暴露出来的参数，要通过创建 service 的方式

service 分 "ClusterIP", "LoadBalancer", "NodePort" 等类型

* ClusterIP: 默认类型，k8s分配一个集群内可访问固定虚拟IP，实现集群内访问，外部无法访问。
* NodePort: 跟docker的-p最类似，将容器端口映射到每个节点的端口上面，实现`nodeIP:nodePort`从集群外部访问，
弊端是为了避免冲突，默认端口范围是30000-32767，比较难记。安装时k8s可修改此参数。
* LoadBalancer: 只在公有云上有效，比如阿里云提供的k8s服务，使用该类型后，阿里云会自动创建一个负载均衡器，
这个负载均衡器的后端映射到各节点的nodePort，一般创建完成后会给我们提供一个公网IP, 可以通过service的external IP查看，
访问该IP，流量经过负载均衡，再到节点中的容器里，除了需要额外支付负载均衡器和静态IP的费用没什么弊端。

```bash
# 将 Pod 中的 80 端口暴露出来，此命令会创建一条 service
kubectl expose deployment nginx --port=80 --name=svc-nginx

# 查看 service， cluster-ip 是 k8s 集群IP，只能在集群内访问，外界无法访问
kubectl get svc

NAME        TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
svc-nginx   ClusterIP   10.108.193.18   <none>        80/TCP    19s

# ssh登录到任意集群节点，curl 10.108.193.18 也是通的

# kubectl port-forward 通过端口转发映射本地端口到指定的应用端口，从而访问集群中的应用程序(Pod).
# 这个命令一般适用于本地调试，比如数据库连接
# 这里没有指定本地的端口，让 k8s 分配一个可用的端口
kubectl port-forward service/svc-nginx :80
# 当然也可以手动指定
kubectl port-forward service/svc-nginx 8099:80

> Forwarding from 127.0.0.1:8099 -> 80
> Forwarding from [::1]:8099 -> 80
> Handling connection for 8099

# 创建一个 NodePort 类型的 service
kubectl expose deployment nginx --port=80 --name=svc-nginx-nodetype --type NodePort

# 32031就是 nodeType 暴露的端口，本地浏览器打开 localhost:32031 可以看到 nginx 欢迎页面
kubectl get svc
NAME                 TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)        AGE
svc-nginx            ClusterIP   10.108.193.18    <none>        80/TCP         16m
svc-nginx-nodetype   NodePort    10.103.213.244   <none>        80:32031/TCP   7s
```

### 销毁
```bash
k delete svc svc-nginx
k delete deployment nginx
```

### ingress

ingress 是入口的意思，ingress 可以调度不同的业务领域，不同URL访问路径的业务流量。

比如我们有一个域名`www.localdev.me`
现在有俩项目，demo1 和 demo2，对应的 deployment 和 service 都创建好了，如果使用NodeType 之前访问地址可能是`www.localdev.me:32102`和`www.localdev.me:36321`

使用 ingress 之后，就可以是`demo1.localdev.me`和`demo2.localdev.me`, 域名和业务结合起来了，还便于识记

当然也可以配为`www.localdev.me/demo1`，当访问此域名，流量会被转发到名为 demo1 的 deployment 应用

你会说这不是 nginx 反向代理干的事情吗，对的，ingress是个概念，具体干活的叫`ingress controller`，比如现在流行的有 Nginx Ingress Controller ,
Traefik Ingress Controller, Kong Ingress Controller

比如 Nginx Ingress Controller，安装后其实就是运行了个 nginx 的Pod，提供了反向代理，负载均衡，Basic认证，Oauth认证，流量控制，路由重写等功能

## 参考

[腾讯云原生专题](https://cloud.tencent.com/developer/special/TencentCloudNative)
