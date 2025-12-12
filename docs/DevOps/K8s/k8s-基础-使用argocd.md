## Argo CD 简介

Argo CD 是一个声明式、GitOps 持续交付的 Kubernetes 工具，它的配置和使用分非常简单，并且自带一个简单一用的 Dashboard 页面，更重要的是 Argo CD 支持 kustomzie、helm、ksonnet 等多种工具。应用程序可以通过 Argo CD 提供的 CRD 资源对象进行配置，可以在指定的目标环境中自动部署所需的应用程序。关于 Argo CD 更多的信息可以查看官方文档了解更多。

Argo CD 的主要职责是 CD（Continuous Delivery，持续交付），将应用部署到 Kubernetes 等环境中

更多功能：https://argo-cd.readthedocs.io/en/stable/#features

Argo CD 会自动和代码仓库的内容进行校验，当代码仓库中应用属性等信息发生变化时，Argo CD 会自动同步更新 Kubernetes 集群中的应用。

## 使用条件

* 准备好的k8s集群
* git仓库，demo地址是：https://gitee.com/finley/argocd-demo，
该仓库的demo目录下存在两个k8s清单文件，用于跑一个web项目

## 安装并配置 argocd

配合文档
https://argo-cd.readthedocs.io/en/stable/getting_started/

图形化界面是可选安装的，如果不安装，可以直接使用命令行操作。
这里我们安装

```bash
kubectl create namespace argocd

# 处理访问github慢的问题
kubectl apply -f https://ghproxy.com/https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml -n argocd

# 设置 Argo CD API Server
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "NodePort"}}'

# 获取端口
kubectl get svc -n argocd 

# 获取登录密码
kubectl -n argocd get secret \
argocd-initial-admin-secret \
-o jsonpath="{.data.password}" | base64 -d

```
![](https://pek3b.qingstor.com/hexo-blog/20220506183701.png)

登录并创建新app。登录名默认是admin

![](https://pek3b.qingstor.com/hexo-blog/20220506183735.png)

![](https://pek3b.qingstor.com/hexo-blog/20220506193055.png)

除了dashboard图形创建，也可以使用yaml文件创建

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp
  namespace: argocd
spec:
  destination:
    namespace: devops # 部署应用的命名空间
    server: https://kubernetes.default.svc # API Server 地址
  project: default # 项目名
  source:
    path: demo # 资源文件路径
    repoURL: https://gitee.com/finley/argocd-demo.git # Git 仓库地址
    targetRevision: master # 分支名
```

点击sync，同步app，然后看到已经执行成功了，也就是说argocd帮我们运行了git仓库中的k8s清单文件。

![](https://pek3b.qingstor.com/hexo-blog/20220506193544.png)

检查下
```bash
k get -n devops all
NAME                         READY   STATUS    RESTARTS   AGE
pod/myapp-865f9f464f-7q72s   1/1     Running   0          75s

NAME            TYPE       CLUSTER-IP     EXTERNAL-IP   PORT(S)        AGE
service/myapp   NodePort   10.233.61.10   <none>        80:32060/TCP   75s

NAME                    READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/myapp   1/1     1            1           75s

NAME                               DESIRED   CURRENT   READY   AGE
replicaset.apps/myapp-865f9f464f   1         1         1       75

# 访问程序，看到此时是v1版本
curl 10.0.2.5:32060
this is app v1
```

## 同步仓库

开启自动同步，点击 APP DETAILS -> SYNC POLICY，点击 ENABLE AUTO-SYNC

![](https://pek3b.qingstor.com/hexo-blog/20220506195301.png)

编辑 myapp 资源文件，将镜像的版本从 v1 改为 v2，点击 Commit changes，提交更改。

等待一会 Argo CD 会自动更新应用，如果你等不及可以点击 Refresh，Argo CD 会去立即获取最新的资源文件。可以看到此时 myapp Deployment 会新创建 v2 版本的 Replicaset，v2 版本的 Replicaset 会创建并管理 v2 版本的 Pod。

```
# 新版本部署成功
curl <节点 IP>:32060
this is app v2
```

## 回滚

细心的同学应该会发现升级到 v2 版本以后， v1 版本的 Replicaset 并没有被删除，而是继续保留，这是为了方便我们回滚应用。在 myapp 应用中点击 HISTORY AND ROLLBACK 查看历史记录，可以看到有 2 个历史记录。

假设我们刚刚上线的 v2 版本出现了问题，需要回滚回 v1 版本，那么我们可以选中 v1 版本，然后点击 Rollback 进行回滚。

在回滚的时候需要禁用 AUTO-SYNC 自动同步，点击 OK 确认即可。

![](https://pek3b.qingstor.com/hexo-blog/20220506201922.png)

等待一会可以看到此时已经回滚成功，此时 Pod 是 v1 版本的，并且由于此时线上的版本并不是 Git 仓库中最新的版本，因此此时同步状态是 OutOfSync。

至此，argocd初步使用完毕。
但是依然存在一些问题：
* 我们的需求是每次提交到代码，可以自动发布到线上，目前是在页面点击，效率太低了。

看下面的两个示例

## 示例1

测试仓库：https://github.com/mafeifan/argocd-in-action

如果拉取github仓库慢，可以使用：https://mirror.ghproxy.com/https://github.com/mafeifan/argocd-in-action.git

分为了两个目录，flask-demo源码目录和kustomize配置清单目录。

实际中，要分成两个仓库，因为源码目录是开发团队负责，配置清单目录是部署团队负责。

argocd创建app：

* project: default
* namespace: flask-demo
* repo url: https://github.com/mafeifan/argocd-in-action
* revision: HEAD
* path: kustomize

```bash
# 检查执行情况，并获取暴露的端口
k get all -n flask-demo -o wide
# 测试，返回正常
curl vm2:30688

    <p>Hello, World!</p>
    <p>---something important from environ---</p>
    <p>DB_NAME=demo</p>
    <p>DB_NAME=root</p>
    <p>DB_PASSWORD=password</p>
    <p>DB_HOST=127.0.0.1</p>
    <p>DB_PORT=9527</p>
```

## 示例2

![](https://pek3b.qingstor.com/hexo-blog/20220508093505.png)

优化后的工作流：
* 创建两个仓库，分别是代码仓库Flask-demo和清单仓库Flask-demo-kustomize
* 开发团队提交业务业务代码到Flask-demo仓库，触发Actions
* Flask-demo仓库的actions会构建docker镜像并推送到docker hub，同时会触发清单仓库的Actions，Flask-demo-kustomize清单仓库的Actions会执行set image即更新镜像为最新tag，并提交git commit
* argocd会执行监控Flask-demo-kustomize仓库的变动更新应用的镜像为最新tag


argocd新建app

```yaml
project: default
source:
  repoURL: >-
    https://mirror.ghproxy.com/https://github.com/mafeifan/flask-demo-kustomize.git
  path: secret
  targetRevision: HEAD
destination:
  server: 'https://kubernetes.default.svc'
  namespace: flask-demo
syncPolicy:
  automated: {}
  syncOptions:
    - CreateNamespace=true
```

## 使用sealed-secrets为清单加密

这里牵涉到一个问题是secret.yaml中的内容不能直接暴露，需要加密。

这里我们使用https://github.com/bitnami-labs/sealed-secrets这个工具实现加密和解密

工作流程是：
* k8s集群需要安装sealed-secrets-controller
* 使用sealed-secrets客户端工具将secret.yaml加密成secret-seal.yaml
* 提交加密后的文件到集群中，controller会监控并自动解密

```bash
# 安装sealed-secrets服务端controller
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.17.5/controller.yaml

k get all -n kube-system -A | grep "sealed"

# 安装客户端工具
brew install kubeseal
# 如果是Linux系统
wget https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.17.5/kubeseal-0.17.5-linux-amd64.tar.gz

# 获取公钥文件，注意备份
kubeseal --fetch-cert public-cert.pem

# 加密secret.yaml并输出secret-seal.yaml
kubeseal --scope cluster-wide --format=yaml --cert .public-cert.pem < secret.yaml > secret-seal.yaml
```

> 遇到 Error updating flask-demo/db-connection, will retry: no key could decrypt secret (DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USERNAME)
使用 kubeseal --scope cluster-wide --format=yaml --cert public-cert.pem < secret.yaml > secret-seal.yaml 就可以了
原因是kubeseal加密时有scope参数，详见：https://github.com/bitnami-labs/sealed-secrets#scopes


## 参考

https://argo-cd.readthedocs.io/en/stable/

https://www.qikqiak.com/post/gitlab-ci-argo-cd-gitops/

https://blog.csdn.net/cr7258/article/details/122028096

https://kubeoperator.io/docs/user_manual/argocd/

https://www.bilibili.com/video/BV17F411h7Zh
