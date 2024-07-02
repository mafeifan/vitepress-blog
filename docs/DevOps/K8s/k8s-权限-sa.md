## ClusteRoleBinding

```bash
kubectl get clusterrole system:node -o yaml
```

返回内容

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  annotations:
    rbac.authorization.kubernetes.io/autoupdate: "true"
  labels:
    kubernetes.io/bootstrapping: rbac-defaults
  name: system:node
rules:
- apiGroups:
  - authentication.k8s.io
  resources:
  - tokenreviews
  verbs:
  - create
- apiGroups:
  - authorization.k8s.io
  resources:
  - localsubjectaccessreviews
  - subjectaccessreviews
  verbs:
  - create
- apiGroups:
  - ""
  resources:
  - services
  verbs:
  - get
  - list
  - watch
```

这个 `apiGroups: ""` 是指 Kubernetes 中所有 API 组的默认值。
apiGroup字段为空字符串（""）时，这代表这个资源属于Kubernetes API的核心组（Core Group），每个API所在的Groups可以参考以下[文档](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.28/#workloads-apis)      
例如 Container、Pod、Endpoints都属于core group；
但是 Deployment 属于 apps group。


## 怎么哪个资源属于哪个组呢？
定义资源时，需要指定其所属的 API 组。例如，定义一个 Deployment 资源时，需要指定其所属的 API 组为 apps/v1。

* pods 和 services 的 APIGROUP 列为空，这意味着它们属于 core 组，其 APIVERSION 是 v1。
* deployments 的 APIGROUP 是 apps，这表示它属于 apps 组

```
apiVersion: apps/v1
kind: Deployment
```
`kubectl api-resources` 命令返回的 APIVERSION 列中的 v1 表示该资源属于 core API 组（也称为 core group 或 legacy group）。
```bash
NAME                              SHORTNAMES             APIVERSION                           NAMESPACED   KIND
bindings                                                 v1                                   true         Binding
componentstatuses                 cs                     v1                                   false        ComponentStatus
configmaps                        cm                     v1                                   true         ConfigMap
endpoints                         ep                     v1                                   true         Endpoints
events                            ev                     v1                                   true         Event
limitranges                       limits                 v1                                   true         LimitRange
namespaces                        ns                     v1                                   false        Namespace
nodes                             no                     v1                                   false        Node
persistentvolumeclaims            pvc                    v1                                   true         PersistentVolumeClaim
persistentvolumes                 pv                     v1                                   false        PersistentVolume
pods                              po                     v1                                   true         Pod
podtemplates                                             v1                                   true         PodTemplate
replicationcontrollers            rc                     v1                                   true         ReplicationController
resourcequotas                    quota                  v1                                   true         ResourceQuota
secrets                                                  v1                                   true         Secret
serviceaccounts                   sa                     v1                                   true         ServiceAccount
services                          svc                    v1                                   true         Service
mutatingwebhookconfigurations                            admissionregistration.k8s.io/v1      false        MutatingWebhookConfiguration
validatingwebhookconfigurations                          admissionregistration.k8s.io/v1      false        ValidatingWebhookConfiguration
customresourcedefinitions         crd,crds               apiextensions.k8s.io/v1              false        CustomResourceDefinition
apiservices                                              apiregistration.k8s.io/v1            false        APIService
controllerrevisions                                      apps/v1                              true         ControllerRevision
daemonsets                        ds                     apps/v1                              true         DaemonSet
deployments                       deploy                 apps/v1                              true         Deployment
replicasets                       rs                     apps/v1                              true         ReplicaSet
statefulsets                      sts                    apps/v1                              true         StatefulSet
selfsubjectreviews                                       authentication.k8s.io/v1             false        SelfSubjectReview
tokenreviews                                             authentication.k8s.io/v1             false        TokenReview
localsubjectaccessreviews                                authorization.k8s.io/v1              true         LocalSubjectAccessReview
selfsubjectaccessreviews                                 authorization.k8s.io/v1              false        SelfSubjectAccessReview
selfsubjectrulesreviews                                  authorization.k8s.io/v1              false        SelfSubjectRulesReview
subjectaccessreviews                                     authorization.k8s.io/v1              false        SubjectAccessReview
horizontalpodautoscalers          hpa                    autoscaling/v2                       true         HorizontalPodAutoscaler
cronjobs                          cj                     batch/v1                             true         CronJob
jobs                                                     batch/v1                             true         Job
certificatesigningrequests        csr                    certificates.k8s.io/v1               false        CertificateSigningRequest
amazoncloudwatchagents            otelcol,otelcols       cloudwatch.aws.amazon.com/v1alpha1   true         AmazonCloudWatchAgent
dcgmexporters                     dcgmexp,dcgmexps       cloudwatch.aws.amazon.com/v1alpha1   true         DcgmExporter
instrumentations                  otelinst,otelinsts     cloudwatch.aws.amazon.com/v1alpha1   true         Instrumentation
neuronmonitors                    neuronexp,neuronexps   cloudwatch.aws.amazon.com/v1alpha1   true         NeuronMonitor
leases                                                   coordination.k8s.io/v1               true         Lease
eniconfigs                                               crd.k8s.amazonaws.com/v1alpha1       false        ENIConfig
endpointslices                                           discovery.k8s.io/v1                  true         EndpointSlice
ingressclassparams                                       elbv2.k8s.aws/v1beta1                false        IngressClassParams
targetgroupbindings                                      elbv2.k8s.aws/v1beta1                true         TargetGroupBinding
events                            ev                     events.k8s.io/v1                     true         Event
flowschemas                                              flowcontrol.apiserver.k8s.io/v1      false        FlowSchema
prioritylevelconfigurations                              flowcontrol.apiserver.k8s.io/v1      false        PriorityLevelConfiguration
policyendpoints                                          networking.k8s.aws/v1alpha1          true         PolicyEndpoint
ingressclasses                                           networking.k8s.io/v1                 false        IngressClass
ingresses                         ing                    networking.k8s.io/v1                 true         Ingress
networkpolicies                   netpol                 networking.k8s.io/v1                 true         NetworkPolicy
runtimeclasses                                           node.k8s.io/v1                       false        RuntimeClass
poddisruptionbudgets              pdb                    policy/v1                            true         PodDisruptionBudget
clusterrolebindings                                      rbac.authorization.k8s.io/v1         false        ClusterRoleBinding
clusterroles                                             rbac.authorization.k8s.io/v1         false        ClusterRole
rolebindings                                             rbac.authorization.k8s.io/v1         true         RoleBinding
roles                                                    rbac.authorization.k8s.io/v1         true         Role
priorityclasses                   pc                     scheduling.k8s.io/v1                 false        PriorityClass
csidrivers                                               storage.k8s.io/v1                    false        CSIDriver
csinodes                                                 storage.k8s.io/v1                    false        CSINode
csistoragecapacities                                     storage.k8s.io/v1                    true         CSIStorageCapacity
storageclasses                    sc                     storage.k8s.io/v1                    false        StorageClass
volumeattachments                                        storage.k8s.io/v1                    false        VolumeAttachment
cninodes                          cnd                    vpcresources.k8s.aws/v1alpha1        false        CNINode
securitygrouppolicies             sgp                    vpcresources.k8s.aws/v1beta1         true         SecurityGroupPolicy
```


`User "system:serviceaccount:gitlab-runner:default" cannot list resource "pods" in API group "" in the namespace "gov-cn"`
 
system:serviceaccount:gitlab-runner:default 是一个 Kubernetes 中标识用户身份的完整名称，用于表示在集群中的 ServiceAccount（服务账号）。

让我们逐个解释这个名称的各个部分：

* system：这是 Kubernetes 中预定义的特殊命名空间之一。它包含了用于 Kubernetes 系统组件和核心资源的 ServiceAccount 和角色（Role）。

* serviceaccount：这是指 ServiceAccount（服务账号）的类型。

* gitlab-runner：这是 ServiceAccount 的命名空间（Namespace）。在此例中，ServiceAccount "gitlab-runner" 属于 "default" 命名空间。

* default：这是 ServiceAccount 的名称。在 "default" 命名空间中，有一个名为 "gitlab-runner" 的 ServiceAccount。


