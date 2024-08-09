## 使用场景

需要将需要部署到集群，但流水线环境不方便直接访问目标K8s集群，可以在K8s里安装runner

然后runner注册到gitlab站点，完成部署操作

[GitLab Runner Helm Chart](https://docs.gitlab.com/runner/install/kubernetes.html)

```bash
helm repo add gitlab https://charts.gitlab.io
# 根据 gitlab 站点版本，挑选合适的 helm chart 版本
helm search repo -l gitlab/gitlab-runner
# 下载并解压
helm pull --untar gitlab/gitlab-runner --version=0.64.3
cd gitlab-runner
# 创建一个新的values文件，用来覆盖默认配置
vi values-nfm-dev.yaml
```

内容如下：
```bash
gitlabUrl: https://gitlab.xxxx.cn/
runnerToken: "glrt-HVu1xxxxxyd"
tags: "aws,eit-nfm-dev,executor-k8s"

rbac:
  create: true
  clusterWideAccess: true
  serviceAccountName: gitlab-runner
  ## Define list of rules to be added to the rbac role permissions.
  ## Each rule supports the keys:
  ## - apiGroups: default "" (indicates the core API group) if missing or empty.
  ## - resources: default "*" if missing or empty.
  ## - verbs: default "*" if missing or empty.
  ##
  ## Read more about the recommended rules on the following link
  ##
  ## ref: https://docs.gitlab.com/runner/executors/kubernetes.html#configure-runner-api-permissions
  ##
  rules:
    - resources: ["configmaps", "pods", "pods/attach", "secrets", "services"]
      verbs: ["get", "list", "watch", "create", "patch", "update", "delete"]
    - apiGroups: ['', 'apps', 'networking.k8s.io']
      resources: ["*"]
      verbs: ["*"]
      # resources: ["deployments","services", "secrets","configmaps", "pods","pods/exec","nodes"]
      # verbs: ["list", "create", "patch", "delete"]

runners:
  # runner configuration, where the multi line string is evaluated as a
  # template so you can specify helm values inside of it.
  #
  # tpl: https://helm.sh/docs/howto/charts_tips_and_tricks/#using-the-tpl-function
  # runner configuration: https://docs.gitlab.com/runner/configuration/advanced-configuration.html
  config: |
    [[runners]]
      [runners.kubernetes]
        namespace = "{{.Release.Namespace}}"
        service_account = "{{ .Release.Name }}"
        image = "public.ecr.aws/docker/library/node:lts-alpine"
        privileged = true
        allow_privilege_escalation = true 
        helper_image = "public.ecr.aws/gitlab/gitlab-runner-helper:alpine3.19-x86_64-latest"
```

安装 runner, 
* values-nfm.yaml 要放在后面这样可以覆盖values.yaml
* upgrade --install  如果不存在就安装，存在就更新
* 
```
helm upgrade --install --namespace gitlab-runner --create-namespace -f ./gitlab-runner/values.yaml -f ./gitlab-runner/values-nfm.yaml gitlab-runner ./gitlab-runner
k get pod -n gitlab-runner
```
