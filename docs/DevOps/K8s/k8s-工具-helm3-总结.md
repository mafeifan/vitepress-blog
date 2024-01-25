## helm3 生成Chart

```bash
helm create my-nginx
Creating my-nginx
```
会生成同名目录，打开后，里面有一些配置文件

![](http://pek3b.qingstor.com/hexo-blog/20211017122822.png)


```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
helm search repo bitnami
```

```bash
helm show chart bitnami/nginx
annotations:
  category: Infrastructure
apiVersion: v2
appVersion: 1.21.3
dependencies:
- name: common
  repository: https://charts.bitnami.com/bitnami
  tags:
  - bitnami-common
  version: 1.x.x
description: Chart for the nginx server
home: https://github.com/bitnami/charts/tree/master/bitnami/nginx
icon: https://bitnami.com/assets/stacks/nginx/img/nginx-stack-220x234.png
keywords:
- nginx
- http
- web
- www
- reverse proxy
maintainers:
- email: containers@bitnami.com
  name: Bitnami
name: nginx
sources:
- https://github.com/bitnami/bitnami-docker-nginx
- http://www.nginx.org
version: 9.5.8
```


| 命令实例 | 对应功能介绍 |
| :-----| :-----
| helm repo add bitnami https://charts.bitnami.com/bitnami | 添加有效的 Helm-chart 仓库 |
| helm repo list | 查看配置的 chart 仓库 |
| helm search repo wordpress | 从添加的仓库中查找 chart 的名字 |
| helm install happy-panda bitnami/wordpress | 安装一个新的 helm 包 |
| helm status happy-panda | 来追踪展示 release 的当前状态 |
| helm show values bitnami/wordpress |	查看 chart 中的可配置选项 |
| helm uninstall happy-panda | 从集群中卸载一个 release |
| helm list|	看到当前部署的所有 release |
| helm pull bitnami/wordpress | 下载和查看一个发布的 chart |
| helm upgrade | 升级 release 版本 |
| helm rollback | 恢复 release 版本 |

```bash
helm install release bitnami/nginx
NAME: release
LAST DEPLOYED: Sun Oct 17 11:24:26 2021
NAMESPACE: default
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
** Please be patient while the chart is being deployed **

NGINX can be accessed through the following DNS name from within your cluster:

    release-nginx.default.svc.cluster.local (port 80)

To access NGINX from outside the cluster, follow the steps below:

1. Get the NGINX URL by running these commands:

  NOTE: It may take a few minutes for the LoadBalancer IP to be available.
        Watch the status with: 'kubectl get svc --namespace default -w release-nginx'

    export SERVICE_PORT=$(kubectl get --namespace default -o jsonpath="{.spec.ports[0].port}" services release-nginx)
    export SERVICE_IP=$(kubectl get svc --namespace default release-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    echo "http://${SERVICE_IP}:${SERVICE_PORT}"
```

![](http://pek3b.qingstor.com/hexo-blog/20211017112705.png)

```bash
helm create my-nginx
helm install full-coral ./my-nginx
helm get manifest my-nginx
helm install --debug --dry-run full-coral ./my-nginx
helm install --debug --dry-run funny my-nginx
```

## 关于 Helm upgrade

实际工作中，CICD流水线，实现k8s滚动更新的核心命令就是 `helm upgrade`
解释下各个flag

* --install 如果集群没这个chart就安装，否则执行更新操作
* --version 指定 Helm chart 版本
* --wait 等待直到容器状态变为running才结束, --timeout 5m 最大等待时间
* --set 覆盖默认参数，每次更新其实就是更新image.tag


```bash
helm upgrade --version $HELM_CHART_VERSION \
  --namespace $EKS_NS --install \
  --wait --timeout 5m \
  --set podAnnotations.profile=$CI_ENVIRONMENT_NAME \
  --set image.tag=$ACR_IMAGE_TAG \
  $MODULE_NAME $HELM_REPO_NAME/$MODULE_NAME
```

1. 在实际的chart中，所有的静态默认值应该设置在 values.yaml 文件中，且不应该重复使用 default 命令 (否则会出现冗余)。
2. 使用 `--set`覆盖默认值 `helm install solid-vulture ./mychart --dry-run --debug --set favoriteDrink=slurm`
3. 使用`-f`参数(helm install -f myvals.yaml ./mychart)传递到 helm install 或 helm upgrade 的 values 文件

## 参考

https://helm.sh/docs/chart_best_practices/


