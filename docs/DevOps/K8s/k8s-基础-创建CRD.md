使用 `kubectl api-resources` 查看k8s内置的资源类型, 那么如何创建自己的资源类型？

K8s支持自定义类型 Custom Resource Definition，让开发者去自定义资源（如Deployment，StatefulSet等），其实可以把CRD想象为类，对象就是类的实例。

Kubernetes Operator 是一种封装、部署和管理 Kubernetes 应用的方法。

Operator = CRD + Controller；

Controller：监听CRD实例（以及关联的资源）的 CRUD 事件，然后执行相应的业务逻辑；

这里创建了一个名为crontab的资源类型，缩写为ct，创建ct需要配置几个参数，image，cronSpec，replicas


```yaml
# vi crd.yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  # name must match the spec fields below, and be in the form: <plural>.<group>
  name: crontabs.stable.example.com
spec:
  # group name to use for REST API: /apis/<group>/<version>
  group: stable.example.com
  # list of versions supported by this CustomResourceDefinition
  versions:
    - name: v1
      # Each version can be enabled/disabled by Served flag.
      served: true
      # One and only one version must be marked as the storage version.
      storage: true
      schema:
        # 定义参数及校验规则
        openAPIV3Schema:
          type: object
          properties:
            spec:
              type: object
              properties:
                cronSpec:
                  type: string
                image:
                  type: string
                replicas:
                  type: integer
  # either Namespaced or Cluster
  # 作用范围，类似 role和clusterrole
  scope: Namespaced
  names:
    # plural name to be used in the URL: /apis/<group>/<version>/<plural>
    plural: crontabs
    # singular name to be used as an alias on the CLI and for display
    singular: crontab
    # kind is normally the CamelCased singular type. Your resource manifests use this. 
    kind: CronTab
    # shortNames allow shorter string to match your resource on the CLI
    shortNames:
    - ct
```    

```bash
kubectl apply -f crd.yaml
customresourcedefinition.apiextensions.k8s.io/crontabs.stable.example.com created

kubectl get crd

kubectl describe crd crontab
``` 


我们已经把资源创建成功了，下面基于资源类型创建具体的对象。


```yaml
# vi new-crontab.yaml
apiVersion: "stable.example.com/v1"
    # This is from the group and version of new CRD
kind: CronTab
    # The kind from the new CRD
metadata:
  name: new-cron-object
spec:
  cronSpec: "*/5 * * * *"
  image: some-cron-image
  replicas: 2
```

```bash
# 执行成功
kubectl apply -f new-crontab.yaml
kubectl get ct

NAME              AGE
new-cron-object   7s

kubectl describe ct

# 尝试添加replicas属性
kubectl edit ct new-cron-object

kubectl delete -f crd.yaml

# 返回 not found
kubectl get ct
```

这里只是演示，并没有具体的实现。

kubernetes 的 controller-manager 通过 APIServer 实时监控内部资源的变化情况，通过各种操作将系统维持在一个我们预期的状态上。

比如当我们将 Deployment 的副本数增加时，controller-manager 会监听到此变化，主动创建新的 Pod。

对于通过 CRD 创建的资源，也可以创建一个自定义的 controller 来管理。

具体的实现需要对k8s的api 和 go 语言比较熟悉，官方也提供了[例子](https://github.com/kubernetes/sample-controller),有空再做详解。


## 参考

https://jimmysong.io/kubernetes-handbook/concepts/crd.html

https://python.iitter.com/other/231069.html

http://qiuwenqi.com/2020-11-20-Kubernetes-Practise-CRD.html

https://www.bilibili.com/video/BV1Vu411B7ak