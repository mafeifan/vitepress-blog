 `User "system:serviceaccount:gitlab-runner:default" cannot list resource "pods" in API group "" in the namespace "gov-cn"`
 
system:serviceaccount:gitlab-runner:default 是一个 Kubernetes 中标识用户身份的完整名称，用于表示在集群中的 ServiceAccount（服务账号）。

让我们逐个解释这个名称的各个部分：

* system：这是 Kubernetes 中预定义的特殊命名空间之一。它包含了用于 Kubernetes 系统组件和核心资源的 ServiceAccount 和角色（Role）。

* serviceaccount：这是指 ServiceAccount（服务账号）的类型。

* gitlab-runner：这是 ServiceAccount 的命名空间（Namespace）。在此例中，ServiceAccount "gitlab-runner" 属于 "default" 命名空间。

* default：这是 ServiceAccount 的名称。在 "default" 命名空间中，有一个名为 "gitlab-runner" 的 ServiceAccount。


