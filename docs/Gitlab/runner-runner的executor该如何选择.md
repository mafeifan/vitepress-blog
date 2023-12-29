原文： https://chengweichen.com/2021/03/gitlab-ci-executor.html

使用者在初次踏进 GitLab CI 的世界时，通常按着官方文件一步步照做，多半不会遇到什么问题。唯独有一项东西有可能让新手产生较大的疑惑，那就是该如何选择 Executor。

目前在官方文件上已经有提供了一份 [Compatibility chart](https://docs.gitlab.com/runner/executors/#selecting-the-executor) 帮助使用者选择 Executor。

GitLab Runner 与 Executor 的关系
首先，让我们先来解释 GitLab、GitLab Runner 与 Executor 的关系。

让我们拆开来说明，先从 GitLab 与 GitLab Runner 的关系开始。

![](https://pek3b.qingstor.com/hexo-blog/16150215293166.jpg)

如上图所示，我们都知道 GitLab Runner 是用来帮助我们执行 CI Job 的工人，而 GitLab 就是这些工人的老板。老板（GitLab）会去查看需求单（.gitlab-ci.yml）建立一张又一张有先后顺序的工单（CI Pipeline），而每一位工人（Runner）则是每隔固定的时间就去询问老板（GitLab）现在有分配给自己的工作（CI Job）吗？现在自己应该做哪一项工作？工人拿到工作后开始执行，并且在执行过程中将处理进度即时填写在工单上。

到这里为止，大部分的人都不太会有什么问题，让我们接着说明 GitLab Runner 与 Executor 的关系。

前面我们将 GitLab 与 GitLab Runner 比喻为老板与工人，那么 Executor 是什么？是工人的工具吗？从我的角度来看，Executor 反而更像是工人的「完成工作的方式」或「工作的环境」。

举例来说，就像我们都曾听过的都市传说，据说在国外有某知名企业的工程师，偷偷将自己的编程开发工作远程外包给印度工程师完成，借此实现上班摸鱼打混还能取得高绩效表扬的神奇故事。当然，偷偷把正职工作私下外包是不正确的行为，但在这个故事中，这就是这位工程师「完成工作的方式」；同理，用口头命令别人做事、自己亲力亲为的传统方法、善用自动化工具或高科技工具辅助、远程连接工作⋯⋯这些都是不同的「完成工作的方式」。

按照上面的比喻，根据您选择的 Executor，决定了 Runner 将会采用何种「方式」以及在哪个「工作环境」中来完成 CI Job。

![](https://pek3b.qingstor.com/hexo-blog/202306231950227.jpg)

因此我们可以理解，这意味着身为老板的我们，很可能需要雇佣多位不同的工人。举例来说，炒菜煮饭这种工作，我们就会安排给在厨房工作的厨师；闯入民宅开保险箱这种工作，我们就会安排给RPG游戏中的勇者。根据不同的CI Job，我们有可能需要准备设置了不同Executor的Runner来应对。

目前可选择的Executor

了解Runner与Executor的关系后，接着来认识目前GitLab Runner可选择的Executor有哪些。

>【小提醒】目前GitLab官方已表示不会再增加更多的Executor，并且为了保留弹性与扩展性，改为提供Custom这项Executor，如果现有的Executor不能满足你的需求，那就自己定制处理吧！

目前可选择的Executor如下：

* Shell：即是Runner直接在自己的Local环境执行CI Job，因此如果你的CI Job要执行各种指令，例如make、npm、composer⋯⋯，则需要事先确定在此Runner的Local环境是否已具备执行CI Job所需的一切相关程序和依赖。
* SSH：Runner会通过SSH连接上目标主机，并且在目标主机上执行CI Job。因此你要提供Runner足以SSH连接目标主机的账号密码或SSH Key，也要提供足够的用户权限。当然目标主机上也要事先处理好执行CI Job所需的一切相关程序和依赖。
* Parallels：每次要执行CI Job时，Runner会先通过Parallels建立一个干净的VM，然后通过SSH登录此VM并在其中执行CI Job。所以同样的用来建立VM的Image是先要准备好执行CI Job所需的一切相依程式与套件，这样Runner建立好的环境才能正确地执行CI Job。另外，当然架设Runner的主机上，记得要安装好Parallels。
* VirtualBox：同上，只是改成用VirtualBox建立干净的VM。同样架设Runner的主机上，记得要安装好VirtualBox。
* Docker：Runner会通过Docker建立干净的Container，并且在Container内执行CI Job。因此架设Runner的主机上，记得要安装好Docker，另外在规划CI Pipeline时也要记得先准备能顺利执行CI Job的各种Docker image。在CI Pipeline中采用Container已是十分普遍的做法，建议大家可以优先评估Docker executor是否适合你的工作场景。
* Docker Machine：延续上一个 Executor，此种 Executor 一样会通过 Container 来执行 CI Job，但差别在于这次你原本的 Runner 将不再是一般的工人了，它已经摇身一变成为工头，每当有工作（CI Job）分派下来，工头就会去自行招募工人（auto-scaling）来执行工作。因此倘若在短时间内有大量的工作需要执行，工头就会去招募大量的工人迅速地将工作们全部搞定。需要注意的是因为招募工人需要一些时间，故有时此种 Executor 在启动时会需要多花费一些时间。
* Kubernetes：延续前两个与 Container 相关的 Executor，这次直接进入超级工头 K8s 的世界。与前两种 Executor 类似，但这次 Runner 操控的不是小小的 Docker engine 了，而是改为操控 K8s。此种 Executor 让 Runner 可以透过 K8s API 控制分配给 Runner 使用的 K8s Cluster 相关资源。每当有 CI Job 指派给 Runner 时，Runner 就会透过 K8s 先建立一个干净的 Pod，接着在其中执行 CI Job。当然使用此种 Executor 依然记得先准备好能顺利执行 CI Job 的各种 Container image。
* Custom：如果上面这七种 Executor 都不能让你满意，那就只好请客官您自行动手啦！Custom Executor 即是 GitLab 提供给使用者自行定制 Executor 的管道。

## 该选择哪一种 Executor？

简单来说就是根据你的需要来选择 Executor！

如果你的团队已经很熟悉 Container 技术，不论是开发、测试及 Production 环境都已全面拥抱 Container，那当然选择 Docker executor 是再正常不过了。更不用说如果 Production 环境已经采用 K8s，那么 CI/CD Pipeline 想必也离不开 K8s 的魔掌，Runner 势必会选用 Kubernetes executor。（但还是别忘了凡事都有例外。）

假如只有开发环境拥抱 Container，但实际上测试机与 Production 环境还是采用实体服务器或 VM，这时你可能就会准备多个 Runner 并搭配多种 Executor。例如 Build、Unit Testing 或某些自动化测试的 CI Job 让 Docker executor 去处理；而像是 Performance testing 则用 VirtualBox executor 开一台干净的 VM 并部署程序来执行测试。

又或者，你的公司有非常多项目正在同步进行中，同时需要执行的 CI Job 时多时少，那么可以 auto-scaling 的 Docker Machine executor 也许会是一个可以考虑的选择。事实上 gitlab.com 提供给大家免费使用的 Shared Runner，就有采用 Docker Machine executor。

再举例，假如有某个 CI Job 只能在某台主机上执行，也许是为了搭配实体服务器的某个硬件装置、也许是基于安全性或凭证的缘故，在这种情况下很可能你会用到 SSH executor，或甚至是在该主机上安装 Runner 并设置为 Shell executor，让特定的 CI Job 只能在该 Runner 主机上执行。

最后，也有可能你因为刚好身处在一个完全没有 Container 知识与技能的团队，所以才只好选择 Shell、SSH、VirtualBox 这些不需要碰到 Container 的 Executor。

【小提醒】由于 SSH、VirtualBox、Parallels 这三种 Executor，Runner 都是先连上别的主机或 VM 之后才执行 CI Job 的内容，因此都不能享受到 GitLab Runner 的 caching feature。

（官网文件也有特别提醒这件事。）

## 结语
GitLab Runner 及 Executor 与 CI/CD Pipeline 的规划密切相关，在实务上我们经常会准备多种 Runner 因应不同的情境，也许是类似下面这样常态准备 3 台 Runner。

* Docker executor｜供一般的 CI Job 使用。
* Docker Machine executor｜供 CI Job 大爆发堵车时使用。
* SSH 或 Shell executor｜供 Production Deploy 或某些有较高安全性考量
