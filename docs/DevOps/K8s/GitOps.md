* GitOps = IaC + Git + CI/CD，即基于 IaC 的版本化 CI/CD。它的核心是使用 Git 仓库来管理基础设施和应用的配置，并且以 Git 仓库作为基础设施和应用的单一事实来源，你从其他地方修改配置（比如手动改线上配置）一概不予通过。
* 从广义上来看，GitOps 与 DevOps 并不冲突，GitOps 是一种技术手段，而 DevOps 是一种文化。
* 从狭义上来看，GitOps 采取声明式的操作方法，是以目标为导向的
* CD 流水线有两种模式：Push 和 Pull。一般 GitOps 首选的都是基于 Pull 的部署模式，把 Git 作为应用系统的唯一事实来源，利用 Git 的强大功能操作所有东西，例如版本控制、历史记录、审计和回滚等等，无需使用 kubectl 这样的工具来操作。
* 目前基于 Pull 模式的 CD 工具有 Argo CD， Flux CD 以及 ks-devops等。

https://icloudnative.io/posts/what-is-gitops/
