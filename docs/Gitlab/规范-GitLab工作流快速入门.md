原文：https://www.yuque.com/rangwu/gitlab/guqi8aud217uaab7?singleDoc#

特别说明
1. 极狐GitLab工作流是极狐GitLab团队内部的DevOps工作流，也是极狐GitLab面向企业推荐的参考工作流。本文将基于极狐GitLab企业版（专业版或旗舰版），参照极狐GitLab工作流，通过一个示例项目完整演示DevOps的全流程，覆盖权限管理、组织管理、需求管理、开发管理，并形成闭环。
2. 由于DevOps是一项工程实践，需要结合企业的组织架构、业务流程、技术栈与工具链、人员能力进行落地。以上内容每家企业均存在较大差异，甚至同一家企业不同团队或不同时期也存在差异。故本文旨在向企业提供一个参考工作流，帮助企业快速了解极狐GitLab相关能力，也可用于改进企业内部的DevOps流程。
3. 本文可面向企业DevOps工程师或熟悉DevOps的研发、运维团队成员及Leader。阅读以下内容需要至少了解Git的使用方式（代码推拉）、版本控制与分支策略、软件测试、CI/CD、制品库、容器技术（Docker）、监控运维等基础知识。需熟悉GitLab基本功能，如史诗议题、合并请求、GitLab CI脚本、GitLab Runner类型与部署方式。本文不会对上述内容进行深度展开，如果您对以上内容尚不熟悉，本文中的内容可能会对您造成较大困扰，建议您通过极狐GitLab原厂培训服务快速掌握极狐GitLab和DevOps的基础知识。 
4. 以下内容可在 https://presales-demo.jihulab.com/mycompany/project-x 中查看配套的demo示例


## 1 权限管理
### 1.1 用户角色
极狐GitLab内置6种用户角色，可根据不同的场景、用户职能进行分配。

| 用户角色 | 	权限说明| 	场景示例| 
|-----------|---------------|--------------------------|
|Guest|	无法对私有化项目做贡献，只能查看议题和留言。	|项目审计人员|
|Reporters|	只读贡献者，可访问代码库但无法写入，可以编辑议题。	|产品经理|
|Developers|	直接贡献者，代码库可读写，受更高级权限管理（如保护分支）。	|开发人员|
|Maintainers|	项目维护者，可对代码库进行管理工作，如分配权限、项目设置。不具备删除权限。	|项目负责人|
|Owners|	项目管理员，能够对群组、项目进行全面管理。	|部门总监 项目负责人|
|Admin|	实例管理员，可对整个GitLab实例进行配置管理。	|系统管理员|


### 1.2 自定义角色[旗舰版]
极狐GitLab支持自定义角色，属于旗舰版功能，该功能正在持续完善。

## 组织管理


## 4 开发管理

### 4.1 创建分支

![](https://pek3b.qingstor.com/hexo-blog/202410311456326.png)


### 4.1.1 分支策略

极狐GitLab推荐的分支策略GitLab Flow提供了3种子模型来匹配不同的业务场景。

![](https://pek3b.qingstor.com/hexo-blog/202410311500977.png)

本文以第三种子模型，也就是多版本并行开发场景为例，它的完整分支模型如下：

![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311508609-34526f.png)

1. 新功能的开发应创建一个新的`feature`分支，如`feature/monitor-temperature`，并创建从`feature/monitor-temperature`分支到`main`分支的合并请求。开发人员在该分支下开发，开发完成后通过流水线实现自动编译、打包、单元测试、质量扫描并发布到`测试环境`。测试人员进行`该模块的功能测试`，测试完成并通过评审后将该分支合并到`main`分支。合并结束后自动删除`feature/monitor-temperature`分支。

2. `Bug`的修复应创建一个新的`fix`分支，如`fix/tag-version-diff`，并创建从`fix/tag-version-diff`分支到`main`分支的合并请求。开发人员在该分支下修复`Bug`，开发完成后通过流水线实现自动编译、打包、单元测试、质量扫描并发布到`测试环境`。测试人员进行`该模块的功能测试`，测试完成并通过评审后将该分支合并到`main`分支。合并结束后自动删除`fix/tag-version-diff`分支。

3. 每个功能、每个`Bug`都应创建新分支，并在新分支中独立开发，应避免多个功能、`Bug`在同一个`feature`分支或`fix`分支中开发，这样会导致管理混乱、难以回滚、容易冲突、不利于评审。

4. 创建`release`分支来管理版本，同一时间可能维护多个版本，如`release/13.0.0`分支、`release/14.0.0`分支、`release/15.0.0`分支。

5. 当需要发版时，从`main`分支向`release/15.0.0`分支发起合并请求。

6. 基于`release`分支编译、构建、打包，发布到`测试环境`，测试人员进行`集成测试`。

7. 当`release`分支发现有功能缺失或者存在缺陷，还应参照第1、2步的内容，创建`feature`或`fix`分支来开发新功能或修复缺陷，再向`main`分支合并。合并通过后使用`cherry-pick`拣选功能将这个合并请求拣选到指定的`release`分支，如`release/13.0.0`、`release/14.0.0`、`release/15.0.0`。

8. 直到`release`分支测试无误后，在`release`分支上打标签`tag`来标识一个新的小版本，如`15.0.1`。

9. 可以在打标签`tag`时触发流水线，基于`tag`编译、构建、打包，然后发布到`生产环境`。

需要注意，分支策略因研发流程而异，企业应该根据实际情况调整，但建议在企业在项目中尽可能推行统一的分支策略，以便于管理。

### 分支命名规则[专业版]
当确定分支策略后，应通过极狐GitLab推送规则来对分支命名进行校验，确保开发人员创建分支时能严格遵守分支策略，避免管理混乱。

操作步骤：

1. 在子项目A“设置——仓库——推送规则”中配置分支名称校验规则`(cherry-pick|feature|fix|release)\/*`。

![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311514442-901158.png)


2. 可参考[文档](https://docs.gitlab.com/ee/user/project/repository/push_rules.html#enable-global-push-rules)和[文档](https://docs.gitlab.com/ee/user/group/access_and_permissions.html#group-push-rules)，在GitLab实例级别或群组级别设置推送规则，这些推送规则仅对GitLab实例或群组中新创建的项目生效。

3. 当创建的分支名称不符合校验规则，则提示无法创建分支

![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311515161-221ae4.png)

### 4.1.3 手动创建分支

在指定项目，如`子项目A`“代码——分支”中，新建分支`feature/monitor-temperature`，用来开发`#2`号需求“获取温度数据”

![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311517242-abbea6.png)

![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311517103-e7c7fb.png)

可在指定项目，如`子项目A`“代码——分支”查看并切换分支

![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311518830-156f9e.png)

创建合并请求，从`feature/monitor-temperature`合并到`main`。

![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311518092-0b1950.png)

![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311519201-4512b8.png)

## 4.2 保护分支

当确定分支策略后，还应确保研发人员只能在开发分支如`feature`、 `fix`分支进行代码提交，应拒绝开发人员直接向主干分支如`main`分支或发版分支如`release`分支提交代码。开发分支和主干分支、发版分支之间必须通过合并请求，走评审或确认机制传递代码，避免管理混乱、引起冲突。在极狐GitLab中可以通过保护分支来达到以上目的。

### 4.2.1 角色级保护
基于用户角色设置保护分支，可能会导致管理失控。因为`Maintainer`角色具备的权限较多，除了基本的管理权限外，还能给项目设置新的人员及角色权限，即引入更多的Maintainer角色，无法满足企业合规管理的需求。
操作步骤：
1. 在指定项目，如`子项目A`“设置——仓库——受保护分支”中，新建保护分支，输入`release*`来匹配所有的`release`分支，包括后续创建的`release`分支也自动匹配为受保护分支。

![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311521677-d4c895.png)

2. 由于GitLab项目中main分支是默认分支，所以本身已经是受保护分支。
3. 调整受保护分支，允许`Maintainer`角色可以合并，`No One`可以推送，即只有`Maintainer`角色通过确认合并请求，才能向受保护的`main`分支`release*`分支传递代码。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311522898-2766f6.png)


### 4.2.2 用户级保护[专业版]
基于用户设置保护分支，可将合并、推送权限进行细粒度控制，仅允许一个人或几个人具备合并、推送权限，可有效规避代码越权提交，管理失控等问题。

1. 与“角色级保护”设置一样，可在“允许合并”、“允许推送和合并”处选择具体的用户，支持多选。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311523688-742ccf.png)

### 4.2.3 群组保护分支[专业版]
极狐GitLab支持在群组级别设置保护分支，将对该群组的所有项目（代码库）生效，且在项目中不能修改、覆盖群组级别的保护分支。

## 4.3 分支开发
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311523533-812463.png)

### 4.3.1 代码推送规则[专业版]
在开发分支下提交代码，应遵循统一、规范的提交格式，否则容易导致管理混乱，降低协同效率。如下图：
● 左图是不规范的代码提交，意义不清、描述重复。
● 右图是知名项目Angular.js的代码提交，遵循统一的提交规范`类型（范围）: 描述 （需求编号）`，该规范也被称为Angular规范，是业内使用比较普遍的提交规范
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311524303-2383fc.png)
极狐GitLab推送规则可以对代码提交的格式、文件类型、文件大小以及提交人的身份进行校验，确保入库的代码符合企业统一的规范，为研发协同以及后续的代码评审打下良好的基础。
操作步骤：
1. 在`子项目A`“设置——仓库——推送规则”中配置推送规则。
2. 勾选“拒绝未经验证的用户 Reject unverified users”，即验证开发人员本地git配置的`user.email`是不是当前执行代码推送的GitLab用户的已验证的邮箱。
3. 勾选“拒绝不一致的用户名 Reject inconsistent user name”，即验证开发人员本地git配置的`user.name`是不是当前执行代码推送的GitLab用户的用户名。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311525509-61f976.png)
4. 设置“提交信息中的要求表达式”为`(feat|fix|doc|style|refactor|pref|test|ci|revert):.+`，您也可以自定义其他表达式。若提交信息格式不符合正则表达式，则拒绝推送。
5. 根据需要设置“禁止的文件名”，如`(jar|exe|tar.gz|tar|zip)$`。推送文件中若包含这些文件类型，则拒绝推送。
6. 根据需要设置“最大文件大小”，如20。单个推送文件若超过该大小，则拒绝推送，除非使用LFS来进行推送。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311526168-e8da4b.png)
7. 可参考[文档](https://docs.gitlab.com/ee/user/project/repository/push_rules.html#enable-global-push-rules)，在GitLab实例级别或群组级别设置推送规则，这些推送规则仅对GitLab实例或群组中新创建的项目生效。

### 4.3.2 代码开发与推送
在4.1章节中，新建了分支`feature/monitor-temperatur`e，用来开发`#2`号需求“获取温度数据”。现在可以模拟代码开发和提交推送过程。
1. 将`子项目A`的代码克隆到本地。
2. 在本地将`子项目A`的代码切换到`feature/monitor-temperature`分支。
3. 新增一些代码文件，如`README.MD`，并向文件中写入一些内容。
4. 本地提交代码，代码提交格式应遵循4.3.1章节推送规则的规范，如`feat: #2 获取温度数据`。
5. 重复3-4步骤，直到功能开发完成。
6. 向GitLab推送代码，在GitLab指定项目，如`子项目A`“代码——提交”可切换分支并查看不同分支的提交记录。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311528275-bd1315.png)

### 4.3.3 代码提交关联GitLab议题
在4.3.1和4.3.2章节中，除了要求代码提交应遵循一些统一格式外，还可以将代码提交与需求任务、Bug缺陷进行关联，实现需求管理和代码开发的双向追溯。
将代码提交与GitLab议题关联，可参考以下步骤。
操作步骤：
1. 在代码提交时，只需将议题ID号写入提交记录中，如`feat: #2 获取温度数据`，其中`#2`就是需求“获取温度数据”的议题ID号。需注意代码提交仅能关联该代码所属项目（代码库）中的议题，不能关联其他项目（代码库）中的议题。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311529038-4f36a7.png)
2. 可以修改推送规则，如`^(feat|fix|doc|style|refactor|test|revert|ci): #[0-9]{1,4}.*$`，这样可强制研发人员每次提交代码时都填写对应的议题ID号。
3. 代码提交追溯需求、缺陷：在代码提交记录中，点击议题ID号，则会跳转到对应的议题
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311530570-195c8e.png)
4. 需求、缺陷追溯代码提交：在议题中也可查看该议题关联的代码提交记录
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311530167-b3cd18.png)

### 4.3.4 代码提交关联第三方项目管理系统 
如果您已经使用Jira、PingCode、Ones、LigaAI等国内外主流项目管理工具，极狐GitLab的代码提交也可以关联这些主流第三方系统的任务ID，实现双向追溯。目前已经支持的有：

以Jira为例，实现的效果如下：
1. 可以修改推送规则，如`^(feat|fix|doc|style|refactor|test|revert|ci): JIRA\-\d+ .+`，其中JIRA是Jira议题的前缀，不同Jira项目的前缀不同，需要替换。这样可强制研发人员每次提交代码时都填写Jira的议题ID号。
2. 代码提交追溯需求、缺陷：在代码提交记录中，点击议题ID号，则会跳转到对应的议题。
3. 需求、缺陷追溯代码提交：在Jira议题中也可查看该议题关联的代码提交记录。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311532272-a9ecde.png)
4. 更多功能，请参见[文档](https://docs.gitlab.com/ee/integration/jira/configure.html)
