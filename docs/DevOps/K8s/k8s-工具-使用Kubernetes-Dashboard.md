只使用 kubectl 命令行有时候不够直观，kubernetes官方提供了名为Dashboard 项目，它可以给用户提供一个可视化的 Web 界面来查看当前集群的各种信息。

用户可以用 Kubernetes Dashboard 部署容器化的应用、监控应用的状态、执行故障排查任务以及管理 Kubernetes 各种资源。

先检查dashboard版本与kubernetes版本兼容性：https://github.com/kubernetes/dashboard/releases

这里安装最新的 dashboard v2.6.1

执行yaml文件直接部署：
`kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.6.1/aio/deploy/recommended.yaml`

k8s中，创建资源需要一个配置文件，配置文件的格式要求是yaml

当然我们也可以把这个yaml文件先下载下来，编辑后再执行。

检查 kubernetes-dashboard 应用状态

`kubectl get pod -n kubernetes-dashboard`

开启 API Server 访问代理

`kubectl proxy`

通过如下 URL 访问 Kubernetes dashboard

http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/

### 创建cluster-admin并获取token

这里我们创建一个SA并绑定为cluster级别的admin


```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kubernetes-dashboard
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: admin-user
  namespace: kubernetes-dashboard
```

获得token并复制

```bash
kubectl get secret | grep admin-user -n kubernetes-dashboard
kubectl describe secret admin-user-token-swjwl -n kubernetes-dashboard

Name:         admin-user-token-swjwl
Namespace:    kubernetes-dashboard
Labels:       <none>
Annotations:  kubernetes.io/service-account.name: admin-user
              kubernetes.io/service-account.uid: 9d723616-7051-4a42-81c7-0cf04d74dbda

Type:  kubernetes.io/service-account-token

Data
====
token:      eyJhbGciOiJSUzI1NiIsImtpZCI6IkE4bElfczJzaWJRdXZWYk5OZVN6RjhubHRCbGxBNWlRLUwza2l4UVRuOFUifQ.eyJpc3MiOiJrdWJl***********2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlcm5ldGVzLWRhc2hib2FyZCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0***********c2VyLXRva2VuLXN3andsIi****************C9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImFkbWluLXVzZXIiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiI5ZDcyMzYxNi03MDUxLTRhNDItODFjNy0wY2YwNGQ3NGRiZGEiLCJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6a3ViZXJuZXRlcy1kYXNoYm9hcmQ6YWRtaW4tdXNlciJ9.LWdMu6V3iBlNJ9***********4CGKi_AR-e-MApqJ364yXq4EpO5Teq5K_XoOM8oZBI1_HgfsQ-65SFsz60sDaqE8UR23UeFnBlJmXgfHibM6H6kNUz2wtTGxsOaXlA2iNlHy7tYhkZHQivARfLqH6PqaVeU3mOHiBW8TK4***********rozE4sZe8m0cAMqv1LOctuGOrWqgR73trmm3WPam925gBOJKWvN5z_UDwmf9M_QSfz5XTmKAw0CvFxksOuMao8numCumnvhZN2j2ch1qgkGHZZIARn1N8c-kuvWaf2iPHnnN0fns5RIOBGsH2Xw
ca.crt:     1099 bytes
namespace:  20 bytes
```

登录dashboard的时候,选择令牌，粘贴刚才的token

![](http://pek3b.qingstor.com/hexo-blog/20220823134444.png)

或者选择 Kubeconfig 文件,路径如下：

* Mac: $HOME/.kube/config
* Win: %UserProfile%\.kube\config

点击登陆，进入Kubernetes Dashboard

![](https://pek3b.qingstor.com/hexo-blog/692a2f2613664123b050c139bb1dcb30~tplv-k3u1fbpfcp-watermark.image)

