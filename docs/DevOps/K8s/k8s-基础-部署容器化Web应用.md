在 k8s 上进行部署前，首先需要了解一个基本概念 Deployment

Deployment 译名为 部署。在k8s中，通过发布 Deployment，可以创建应用程序 (docker image) 的实例 (docker container)，这个实例会被包含在称为 Pod 的概念中，Pod 是 k8s 中最小可管理单元。

在 k8s 集群中发布 Deployment 后，Deployment 将指示 k8s 如何创建和更新应用程序的实例，master 节点将应用程序实例调度到集群中的具体的节点上。

创建应用程序实例后，Kubernetes Deployment Controller 会持续监控这些实例。如果运行实例的 worker 节点关机或被删除，则 Kubernetes Deployment Controller 将在群集中资源最优的另一个 worker 节点上重新创建一个新的实例。这提供了一种自我修复机制来解决机器故障或维护问题。

本教程教你跑一个Web NodeJS项目在google cloud k8s集群上面。

GKE 是 Google Kubernetes Engine (GKE) 集群

## 前提

1. 已经在GKE上面创建好了k8s集群

![](https://pek3b.qingstor.com/hexo-blog/202406151009644.png)

2. 本地安装好了gcloud cli，并且可以管理集群

`kubecl get nodes` 查看所有节点
![](https://pek3b.qingstor.com/hexo-blog/202406151010938.png)

3. 制作好的镜像

源码在[github](https://github.com/mafeifan/docker-express-demo)上面非常简单，镜像也放到了[docker hub](https://hub.docker.com/repository/docker/finleyma/express)

4. 本地运行`docker run -p 3000:3000 -d finleyma/express` 可以成功

浏览器打开 http://localhost:3000, 可以看到内容，说明我们的镜像运行成功，可以分发部署了

## 部署应用到GKE

创建k8s的deployment
`kubectl create deployment express-demo-deployment --image=finleyma/express`

设置基准数量为3，因为我们有3个节点机器，所以每个节点跑一个
`kubectl scale deployment express-demo-deployment --replicas=3`

(可选)创建一个水平自动扩展调节器, 根据 CPU 负载将 Pod 数量从 3 个扩缩为 1 到 5 个之间
`kubectl autoscale deployment express-demo-deployment --cpu-percent=80 --min=1 --max=5`

查看已创建的Pod
`kubectl get pods`

![](https://pek3b.qingstor.com/hexo-blog/202406151010978.png)

程序跑起来了，google cloud 也可以看到

![](https://pek3b.qingstor.com/hexo-blog/202406151010130.png)

虽然 Pod 确实具有单独分配的 IP 地址，但这些 IP 地址只能从集群内部访问。此外，GKE Pod 设计是临时的，可根据扩缩需求启动或关闭。当 Pod 因错误而崩溃时，GKE 会自动重新部署该 Pod，并且每次都会为 Pod 分配新的 IP 地址。

我们需要将集群外部公开 Kubernetes 服务，创建 LoadBalancer 类型的服务。此类型的服务会为可通过互联网访问的一组 Pod 生成外部负载平衡器 IP 地址。

`kubectl expose deployment express-demo-deployment --name=express-demo-deployment --type=LoadBalancer --port 80 --target-port 3000`
```
--port 标志指定在负载平衡器上配置的端口号
--target-port 标志指定 hello-app 容器正在侦听的端口号
```

查看服务，会看到 EXTERNAL-IP 列会自动分配一个IP，访问IP，和本地效果一样

`kubectl get service` 或  `kubectl get svc`

![](https://pek3b.qingstor.com/hexo-blog/202406151011063.png)

至此部署完成

虽然部署完了，如果代码更新了，我们怎么发布新版本到k8s集群呢？

之前我们用k8s创建了一个deployment，deployment很强大，可以指定镜像版本，实现不停机逐渐替换镜像的Pod。

1. 更新代码，比如将 server.js中输入内容那行更新为`res.send('Hello world222\n');`
2. 重新生成镜像并推到仓库

```
docker build -t finleyma/express:v2 .
docker push finleyma/express:v2
```

docker hub上可以看到我们新的tag名为v2的镜像

![](https://pek3b.qingstor.com/hexo-blog/202406151011296.png)

使用 kubectl set image 命令通过镜像更新将滚动更新应用于现有的名为 express-demo-deployment的Deployment

`kubectl set image deployment/[deployment名称] [容器名]=[镜像名:tag名]`

`kubectl set image deployment/express-demo-deployment express-demo=finleyma/express:v2`

监控 pods的运行状况, 旧的pod被依次删除，新的被依次创建了，因为连pod的名字都变了
`kubectl get pods -w`

![](https://pek3b.qingstor.com/hexo-blog/202406151011629.png)

再次刷新页面，内容已经变了！滚动更新成功。

deployment对于发布应用到k8s集群非常有用，我们还可以方便的回滚到某个历史版本

## 其他命令

查看详情
`kubectl describe deployment/express-demo-deployment`

验证发布
`kubectl rollout status deployment/express-demo-deployment`

查看pod中的容器的打印日志（和命令docker logs 类似）
`kubectl logs -f express-demo-deployment-XXXXXXX`

pod中的容器环境内执行命令(和命令docker exec 类似)
`kubectl exec -it express-demo-deployment-XXXXXXX -- /bin/bash`

## 参考

* https://kubernetes.io/zh/docs/concepts/workloads/controllers/deployment/

* https://cloud.google.com/kubernetes-engine/docs/tutorials/hello-app#cloud-shell_1
