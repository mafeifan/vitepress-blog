## chart 包文件结构
以 wordpress 包为例

```
wordpress/
  Chart.yaml          # 包含有关chart信息的YAML文件
  LICENSE             # OPTIONAL: 包含chart许可证的纯文本文件
  README.md           # OPTIONAL: 一个可读的README文件
  requirements.yaml   # OPTIONAL: 一个YAML文件，列出了chart的依赖关系
  values.yaml         # 该chart的默认配置值
  charts/             # OPTIONAL: 包含此chart所依赖的任何chart的目录。
  templates/          # OPTIONAL: 一个模板目录，当与values相结合时，
                      # 将生成有效的Kubernetes清单文件
  templates/NOTES.txt # OPTIONAL: 包含简短使用说明的纯文本文件
  templates/_helpers.tpl # OPTIONAL:通过define 函数定义命名模板
  crds/               # OPTIONAL: 自定义资源
```

以下说明chart包内容
Chart.yaml文件内容格式

```
name: chart的名称 (required)
version: 一个SemVer 2(语义化版本)版本(required)
description: 这个项目的单句描述 (optional)
keywords:
  - 关于此项目的关键字列表 (optional)
home: 该项目主页的URL(optional)
sources:
  - 此项目的源代码URL列表 (optional)
dependencies: chart依赖关系 (optional)
  - name: chart名字 (nginx)
    version: chart版本 ("1.2.3")
    repository: url仓库 ("https://example.com/charts") 
    condition: (optional) 布尔值的yaml路径，用于启用/禁用图表 
maintainers: # (optional)
  - name: 维护者的名称 (每个维护者都需要)
    email: 维护者的email (optional for each maintainer)
    url: 维护者的url (optional for each maintainer)
engine: gotpl＃模板引擎的名称（可选，默认为gotpl）
icon: 要用作图标的SVG或PNG图像的URL (optional)
appVersion: 包含的应用程序版本（可选）这个不一定是SemVer
deprecated: 此chart是否已被弃用（可选，布尔型）
```

## README.md内容

* Introduction
* Prerequisites
* Installing the Chart
* Uninstalling the Chart
* Configuration

requirements.yaml介绍
在Helm中，一个chart可能取决于任何数量的其他chart。 
这些依赖关系可以通过`requirements.yaml`文件动态链接，或者引入charts/目录并手动管理。

```
dependencies:
  - name: apache
    version: 1.2.3
    repository: http://example.com/charts
    alias: new-subchart-1
```

* Name: 你想要的chart的名称。
* Version: 你想要的chart的版本。
* repository字段是图表存储库的完整URL。 请注意，您还必须使用helm repo add在本地添加该repository。
* alias：别名。 一旦有一个依赖关系文件，可以运行`helm dependency update`，它会使用你的依赖关系文件为你下载所有指定的chart到你的charts/目录中。 可以在values.yaml定义true/false判断依赖包是否被启用，如

```
apache:
  enabled: true
```

依赖关系可以是chart压缩包（foo-1.2.3.tgz），也可以是未打包的chart目录。 依赖执行顺序：参考k8s负载自启动原理，所以我们可以不关心执行顺利。实际上交叉执行。

> 说明：helm2是通过requirements.yaml文件描述依赖关系，helm3直接在Chart.yaml描述


## templates/k8s资源

templates下有多个deployment对象，可以命名不同名字。 
执行顺序：参考k8s负载自启动原理，所以我们可以不关心执行顺利。 实际执行顺序为：

```
var InstallOrder KindSortOrder = []string{
    "Namespace",
    "NetworkPolicy",
    "ResourceQuota",
    "LimitRange",
    "PodSecurityPolicy",
    "PodDisruptionBudget",
    "Secret",
    "ConfigMap",
    "StorageClass",
    "PersistentVolume",
    "PersistentVolumeClaim",
    "ServiceAccount",
    "CustomResourceDefinition",
    "ClusterRole",
    "ClusterRoleList",
    "ClusterRoleBinding",
    "ClusterRoleBindingList",
    "Role",
    "RoleList",
    "RoleBinding",
    "RoleBindingList",
    "Service",
    "DaemonSet",
    "Pod",
    "ReplicationController",
    "ReplicaSet",
    "Deployment",
    "HorizontalPodAutoscaler",
    "StatefulSet",
    "Job",
    "CronJob",
    "Ingress",
    "APIService",
}
```

两种方式可以提前执行,一种设置pre-install,另一种是设置权重： pre-install hooks，如：

```
apiVersion: v1
kind: Service
metadata:
  name: foo
  annotations:
    "helm.sh/hook": "pre-install"
```

定义权重，如：

```
annotations:
    "helm.sh/hook-weight": "5"
```

## values.yaml

* Release.Name: release的名称(不是chart的名称！)
* Release.Namespace: chart release的名称空间。
* Release.Service: 进行release的服务。 通常这是Tiller。
* chart版本可以作为Chart.Version获得。Chart：Chart.yaml 的内容。
* templates下有多个deployment对象，可以命名不同名字，然后在values.yaml以不同名字打头定义值。如以下格式定义：

```
mysql:
  name: 
  image:
    repository: 
    tag: 
    pullPolicy:

redis:
  name: 
  image:
    repository: 
    tag: 
    pullPolicy:
```

## helm模板

helm模板语法嵌套在{{和}}之间，有三个常见的

```
.Values.*
从value.yaml文件中读取或者--set获取（--set优先级最大）。
.Release.*
从运行Release的元数据读取,每次安装均会生成一个新的release
template * .
从_helpers.tpl文件中读取，通过define 函数定义命名模板
.Chart.*
从Chart.yaml文件中读取
```

## 模板函数和管道

```
* | 管道，类似linux下的管道，以下实例效果是一样的。
{{ quote .Values.favorite.drink }}与 {{ .Values.favorite.drink | quote }}
* default制定默认值
drink: {{ .Values.favorite.drink | default “tea” | quote }}
* indent 模板函数，对左空出空格，左边空出两个空格
{{ include "mychart_app" . | indent 2 }}
include 函数，与 template 类似功能
如实例，在_helpers.tpl中define模板，在资源对象中引用。


{{- define "mychart.labels" }}
  labels:
    generator: helm
    date: {{ now | htmlDate }}
{{- end }}

apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Release.Name }}-configmap
  {{- template "mychart.labels" }}
data:
```

## 在模板中使用文件

```
apiVersion: v1
kind: ConfigMap
metadata:
  name: conf
data:
{{ (.Files.Glob "foo/*").AsConfig | indent 2 }}
```

chart根目录下foo目录的所有文件配置为configmap的内容

## 模板流程控制
常用的有 if/else 条件控制 with 范围控制 range 循环控制 
如：values.yaml中定义变量，ConfigMap中.Values.favorite循环控制参数。

```
favorite:
  drink: coffee
  food: pizza

apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Release.Name }}-configmap
data:
  myvalue: "Hello World"
  {{- range $key, $val := .Values.favorite }}
  {{ $key }}: {{ $val | quote }}
  {{- end}}
```

在deployment.yaml文件中使用if/else语法，如：- end结束标志，双括号都有“-”。

```
{{- if .Values.image.repository -}}
image: {.Values.image.repository}
{{- else -}}
image: "***/{{ .Release.Name }}:{{ .Values.image.version }}"
{{- end -}}
```
