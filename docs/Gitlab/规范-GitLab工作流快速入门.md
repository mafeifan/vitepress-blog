原文：https://www.yuque.com/rangwu/gitlab/guqi8aud217uaab7

> 特别说明
> 1. 极狐GitLab工作流是极狐GitLab团队内部的DevOps工作流，也是极狐GitLab面向企业推荐的参考工作流。本文将基于极狐GitLab企业版（专业版或旗舰版），参照极狐GitLab工作流，通过一个示例项目完整演示DevOps的全流程，覆盖权限管理、组织管理、需求管理、开发管理，并形成闭环。
> 2. 由于DevOps是一项工程实践，需要结合企业的组织架构、业务流程、技术栈与工具链、人员能力进行落地。以上内容每家企业均存在较大差异，甚至同一家企业不同团队或不同时期也存在差异。故本文旨在向企业提供一个参考工作流，帮助企业快速了解极狐GitLab相关能力，也可用于改进企业内部的DevOps流程。
> 3. 本文可面向企业DevOps工程师或熟悉DevOps的研发、运维团队成员及Leader。阅读以下内容需要至少了解Git的使用方式（代码推拉）、版本控制与分支策略、软件测试、CI/CD、制品库、容器技术（Docker）、监控运维等基础知识。需熟悉GitLab基本功能，如史诗议题、合并请求、GitLab CI脚本、GitLab Runner类型与部署方式。本文不会对上述内容进行深度展开，如果您对以上内容尚不熟悉，本文中的内容可能会对您造成较大困扰，建议您通过极狐GitLab原厂培训服务快速掌握极狐GitLab和DevOps的基础知识。 
> 4. 以下内容可在 https://presales-demo.jihulab.com/mycompany/project-x 中查看配套的demo示例

[TOC]

## 1 权限管理
### 1.1 [用户角色](https://docs.gitlab.com/ee/user/permissions.html)
极狐GitLab内置6种用户角色，可根据不同的场景、用户职能进行分配。

| 用户角色 | 	权限说明| 	场景示例| 
|-----------|---------------|--------------------------|
|Guest|	无法对私有化项目做贡献，只能查看议题和留言。	|项目审计人员|
|Reporters|	只读贡献者，可访问代码库但无法写入，可以编辑议题。	|产品经理|
|Developers|	直接贡献者，代码库可读写，受更高级权限管理（如保护分支）。	|开发人员|
|Maintainers|	项目维护者，可对代码库进行管理工作，如分配权限、项目设置。不具备删除权限。	|项目负责人|
|Owners|	项目管理员，能够对群组、项目进行全面管理。	|部门总监 项目负责人|
|Admin|	实例管理员，可对整个GitLab实例进行配置管理。	|系统管理员|


### 1.2 [自定义角色](https://docs.gitlab.com/ee/user/custom_roles.html)[旗舰版]
极狐GitLab支持自定义角色，属于旗舰版功能，该功能正在持续完善。

## 2. 组织管理

### 2.1 [群组](https://docs.gitlab.com/ee/user/group/)
极狐GitLab的群组类似文件夹，可以包含多个项目（代码库），群组可以嵌套，类似文件夹、子文件夹。

群组可作为部门组织管理代码库，也可作为虚拟项目组织管理代码库。

操作步骤：
1. 创建一级群组`项目X`
2. 在群组`项目X`下创建一个项目（代码库）`子项目A`，创建两个子群组`子项目B`、`子项目C`。
3. 在子群组`子项目B`、`子项目C`中创建项目（代码库）`模块A`、`模块B`、`模块C`

不同开发语言划分组织的参考经验：
1. 若使用Java、Python等语言，能实现模块化开发，能通过流水线独立部署，或能打包成jar、pip等制品，通过包管理器向其他项目提供引用，这类项目建议参考`子项目B`、`子项目C`，分成子群组和多个代码库来管理。
2. 若使用C/CPP语言，没有太好的包管理工具，模块之间依靠完整源码编译，这类项目建议参考`子项目A`，将整个C/CPP项目放到一个项目（代码库）中，通过文件夹来区分模块。

### 2.2 [项目](https://docs.gitlab.com/ee/user/project/organize_work_with_projects.html)
极狐GitLab的项目就是指`代码库`，隶属于群组。

群组、项目与角色关系：

* 可将用户在群组级别进行角色授权，该用户具备该群组以及该群组的所有子群组、所有项目（代码库）的权限，即继承权限。
* 可将用户在项目级别进行角色授权，该用户只具备该项目（代码库）的权限。

### 2.3 [范围标记](https://docs.gitlab.com/ee/user/project/labels.html#scoped-labels)[专业版]
极狐GitLab使用Label标记来给后续需求管理中使用到的史诗、议题赋予一些意义，可以理解为自定义字段。

操作步骤：

1. 在群组项目X左侧边栏“管理——标记”中新建以下标记，这些标记可以在该群组以及该群组的所有子群组、所有项目（代码库）中使用。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312010401-969f2f.png)
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312010832-82aae5.png)
2. 管理员也可以[参考文档](https://docs.gitlab.com/ee/administration/labels.html)在GitLab全局设置标记，GitLab中所有的群组、项目都可使用。
3. 创建一组类型标记，用于标识议题的类型是“功能”还是“缺陷”。其中`::是用于设置范围标签`，该标签是一组键值对，具有排他性。如下面例子中，某个议题同一时间只能具备其中一个`type`标记，即`type`要么是`bug`，要么是`feature`。
```
type::bug
type::feature
```
4. 创建一组状态标记，用于标识议题的状态是“待处理”、“进行中”还是“已完成”。
```
status::todo
status::doing
status::done
```
5. 创建一组优先级标记，用于标识议题的优先级是“高”、“中”还是“低”。
```
priority::high
priority::mid
priority::low
```

## 2.4 [群组/实例模板](https://docs.gitlab.com/ee/user/project/description_templates.html)[专业版]
极狐GitLab支持使用模板来为后续需求管理中使用到的议题设置一些格式化内容，用来提高工作规范性和效率。

操作步骤：
1. 在群组`项目X`中创建一个项目（代码库）`模板`，创建两个文件`.gitlab/issue_templates/feature.md`、`.gitlab/issue_templates/bug.md`，用于作为“功能”和“缺陷”的标准模板
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312006986-73bbb4.png)

内容如下：

bug.md
```md 
### 步骤
1.
2.
3.

### 结果


### 期望


### 环境
- 机型：
- 版本：

/label ~"type::bug" ~"priority::low" ~"status::todo"  
```

feature.md
```md
### 用户故事
作为 [角色]，我 [想要实现/达到什么目的]，[从而获得怎样的价值/解决什么问题]。

### 客户用例
1.
2.
3.

### 设计文档
1. 产品原型图见: xxxxxx
2. 产品设计图见: xxxxxx

/label ~"type::feature" ~"status::todo"  
```

2. 在群组项目X的“设置——通用——模板”中，选择项目模板作为该群组的默认模板，该模板可以在该群组以及该群组的所有子群组、所有项目（代码库）中使用。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312007222-1bad2a.png)
3. 管理员也可以[参考文档](https://docs.gitlab.com/ee/user/project/description_templates.html#set-instance-level-description-templates)在GitLab全局设置模板，GitLab中所有的群组、项目都可使用。

## 3. 需求管理

> 说明：若您已经使用Jira、PingCode、Ones、LigaAI等国内外主流项目管理工具、或使用自研、定制开发的项目管理工具，以下内容仅供参考。您也可以直接跳到第4章了解开发管理的相关内容，在该章节中也会介绍极狐GitLab如何与这些第三方项目管理系统做集成，并打通整个流程。
若您没有使用线上化的项目管理工具，还在使用电子文档、聊天工具来进行需求管理，则建议您详细阅读以下内容。

### 3.1 [史诗](https://docs.gitlab.com/ee/user/group/epics/)[专业版]

![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312012578-e683dd.png)

极狐GitLab使用Epic史诗来管理相对比较宏大的业务目标或原始需求，他一般由项目经理、产品经理负责创建并维护。
史诗是建立在`群组`上的。

操作步骤：

1. 在群组项目X的“计划——史诗”中，创建两个史诗，并设置大致的时间计划
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312013170-7d6556.png)
2. 具备群组`项目X`角色权限的用户都可以看到所有的史诗内容。
3. 史诗将在后续阶段被拆分、细化、形成具体的研发任务，也就是`议题`，史诗和议题是父子关系。

### 3.2 [子史诗](https://docs.gitlab.com/ee/user/group/epics/manage_epics.html#multi-level-child-epics)[旗舰版]

如果一项史诗任务过于复杂，可能还需拆分成多个依然比较宏大的史诗，这里就可以使用到子史诗

### 3.3 [路线图 roadmap](https://docs.gitlab.com/ee/user/group/roadmap/)[专业版]

路线图是针对史诗的排期展示。设置史诗的时间计划后，项目经理、产品经理可以查看路线图。
操作步骤：

1. 在群组项目X的“计划——路线图”中，通过甘特图来展示所有史诗的排期和进度。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312014138-a8c912.png)
2. 史诗的进度依赖于与它关联的议题，如一个史诗关联了4个议题，其中2个议题已完成（已关闭），那么进度就是50%。
3. 如果有子史诗，路线图中可会显示子史诗、史诗的排期和进度。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312014199-dd7dd5.png)

### 3.4 [里程碑 Epic](https://docs.gitlab.com/ee/user/project/milestones/)
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312015992-d00078.png)
史诗和路线图是项目经理、产品经理对一些原始需求的大致排期。当某些原始需求已经有近期明确的开发计划后，应创建里程碑。

里程碑标识近期一段时间明确的开发计划，如一次版本发布、一次敏捷迭代等。

操作步骤：
1. 在群组项目X的“计划——里程碑”中，创建两个里程碑，通过版本号进行命名，并设置里程碑的时间。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312016928-f64202.png)
2. 里程碑将关联一些具体的、细化的开发任务或者需要处理的缺陷，也就是下文中的议题。

#### 3.4.1 [燃起图、燃尽图](https://docs.gitlab.com/ee/user/project/milestones/burndown_and_burnup_charts.html)[专业版]
当里程碑中的议题根据第3.5章节被创建，随后根据第4章节完成开发、集成、部署，最后议题被手动关闭或根据4.4.5.5在合并请求被执行后自动关闭，意味着这个功能开发完成。

议题在里程碑中会实时显示状态，并通过燃起图、燃尽图来展示整个里程碑的进展，也可以在里程碑结束后帮助团队回顾或用于帮助团队评估下一个里程碑的工作计划。

![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312017115-c59bb2.png)

### 3.5 [议题 issue](https://docs.gitlab.com/ee/user/project/issues/)

![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312017398-48a2eb.png)

极狐GitLab使用Issue议题来管理需求任务、Bug缺陷。它一般由产品经理创建并由研发人员维护。

#####  3.5.1 议题管理
议题是建立在项目（代码库）上的，它可以与史诗进行关联，也可以与史诗无关，即只与该项目（代码库）相关。
操作步骤：
1. 拥有群组项目X角色权限的项目管理人员，可以查看该群组所有项目（代码库）的议题。

![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312018988-001741.png)

2. 仅拥有项目（代码库）的开发人员，只可以查看与他工作相关的议题。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312018812-8d8dde.png)
3. 所以创建议题应明确该议题与哪一个项目（代码库）相关，如果议题创建到错误的项目（代码库）中，可以[参考文档](https://docs.gitlab.com/ee/user/project/issues/managing_issues.html#move-an-issue)将议题移动到正确的项目中。

#####  3.5.2 需求议题
用议题管理需求任务。

操作步骤：
1. 在群组项目X下的项目（代码库）`子项目A`的“计划——议题”中创建议题
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312019440-6ffc56.png)
2. 选择之前创建的名为feature的模板来列出开发任务的描述格式。
3. 将该议题关联到史诗“监控模块开发”，关联到里程碑“1.0.0”。
4. 添加了其他几个议题，并与史诗、里程碑进行关联
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312019604-9e27d3.png)
5. 添加了一个议题，只关联里程碑，不关联史诗。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312020608-cb7efa.png)

#### 3.5.3 缺陷议题
用议题管理缺陷，与管理开发任务没有什么不同，只是用Lable来标识这个议题是缺陷Bug。

1. 另外缺陷议题一般不与史诗进行关联，只与各项目（代码库）相关。若项目为多模块模式进行开发，测试人员无法判断该缺陷属于哪个项目（代码库），可以向最终提测的应用项目（代码库）提交缺陷，研发团队内部定位后再通过移动议题将缺陷议题转移到对应的项目中。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312020821-74bb06.png)
2. 通过选择之前创建的名为bug的模板来列出缺陷Bug的描述格式。
3. 缺陷议题（缺陷）可以与需求议题（功能）进行[关联](https://docs.gitlab.com/ee/user/project/issues/related_issues.html)。

### 3.6 [议题权重](https://docs.gitlab.com/ee/user/project/issues/issue_weight.html)[专业版]
在敏捷开发中，一般使用故事点、评估点来估算用户故事。在极狐GitLab中可使用权重来实现该功能。

操作步骤：

1. 进入指定的议题，给议题设置权重。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312021154-50604e.png)
2. 在群组项目X的里程碑中，可查看该里程碑关联的议题的总权重。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312022647-ccb87f.png)

### 3.7 [工时统计](https://docs.gitlab.com/ee/user/project/time_tracking.html)
在瀑布开发中，或者对工时统计有要求的场景中，一般需要在开发前填写估算工时，开发结束后填写实际工时，用于做排期和分析。在极狐GitLab中可使用工时来实现该功能。

操作步骤：
1. 进入指定的议题，给议题设置预估工时。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312022671-a47fdd.png)
2. 在议题处理过程中，可以多次给议题设置实际工时，如每天进行填写，最后实际工时将会累加。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312022413-2e7998.png)
3. 在议题中可以查看时间追踪报告，看到实际工时的说明和累加历史。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312023805-ef86c3.png)
在群组`项目X`的里程碑中，可查看该里程碑关联的议题的总工时统计。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312023040-3d700e.png)

### 3.8 [议题看板 issue board](https://docs.gitlab.com/ee/user/project/issue_board.html#gitlab-enterprise-features-for-issue-boards)[专业版]
极狐GitLab支持灵活的自定义看板，来对议题进行管理、协作。

#### 3.8.1 任务看板
操作步骤：
1. 在群组项目X“计划——议题看板”中编辑“Development”看板。
2. 设置`里程碑=1.0.0`、`标记=type::feature`，即看板中只包含里程碑为`1.0.`0且类型为`feature`的议题。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312024293-c25b80.png)
3. 创建列表，将标记为status::todo、status::doing、status::done的列表分别加入看板。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312024161-235549.png)
4. 议题可在列表之间拖动。
5. 后续只需要编辑看板的里程碑，即可用于不同里程碑周期下的任务看板管理。

####  3.8.2 缺陷看板
操作步骤：

1. 在群组`项目X`“计划——议题看板”中创建“Bug”看板。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312025985-861aed.png)
2. 设置`里程碑=1.0.0`、`标记=type::bug`，即看板中只包含里程碑为`1.0.0`且类型为`bug`的议题。
3. 参考任务看板，创建列表并进行管理。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312025842-c2750a.png)

### 3.9 [指派议题](https://docs.gitlab.com/ee/user/project/issues/multiple_assignees_for_issues.html)[专业版]
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312026396-72ef72.png)

将议题指派给一个或多个开发人员，用于分配开发任务、或处理Bug缺陷。

操作步骤：

1. 进入指定的议题，给议题设置指派人。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312026849-10d90a.png)
2. 被指派的人员可以收到邮件通知，并可在“代办事项列表”中进行展示和跟踪。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312026089-31e82a.png)

## 4 开发管理

### 4.1 [创建分支](https://docs.gitlab.com/ee/user/project/repository/branches/)

![](https://pek3b.qingstor.com/hexo-blog/202410311456326.png)

### 4.1.1 分支策略

极狐GitLab推荐的分支策略[GitLab Flow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)提供了3种子模型来匹配不同的业务场景。

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

### 4.1.2 [分支命名规则](https://docs.gitlab.com/ee/user/project/repository/push_rules.html#validate-branch-names)[专业版]
当确定分支策略后，应通过极狐GitLab推送规则来对分支命名进行校验，确保开发人员创建分支时能严格遵守分支策略，避免管理混乱。

操作步骤：

1. 在子项目A“设置——仓库——推送规则”中配置分支名称校验规则`(cherry-pick|feature|fix|release)\/*`。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311514442-901158.png)
2. 可参考[文档](https://docs.gitlab.com/ee/user/project/repository/push_rules.html#enable-global-push-rules)和[文档](https://docs.gitlab.com/ee/user/group/access_and_permissions.html#group-push-rules)，在GitLab实例级别或群组级别设置推送规则，这些推送规则仅对GitLab实例或群组中新创建的项目生效。
3. 当创建的分支名称不符合校验规则，则提示无法创建分支
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311515161-221ae4.png)

### 4.1.3 [手动创建分支](https://docs.gitlab.com/ee/user/project/repository/branches/#create-branch)

在指定项目，如`子项目A`“代码——分支”中，新建分支`feature/monitor-temperature`，用来开发`#2`号需求“获取温度数据”
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311517242-abbea6.png)

![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311517103-e7c7fb.png)

可在指定项目，如`子项目A`“代码——分支”查看并切换分支
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311518830-156f9e.png)

创建合并请求，从`feature/monitor-temperature`合并到`main`。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311518092-0b1950.png)

![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311519201-4512b8.png)

## 4.1.4 [基于议题创建分支](https://docs.gitlab.com/ee/user/project/repository/branches/#from-an-issue)[专业版]
极狐GitLab也支持基于议题快速创建分支和合并请求。

操作步骤：
1. 在指定议题中，下拉“创建合并请求”，选择“创建合并请求和分支”，填写“分支名称”，即可快速创建分支和合并请求。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312054272-318566.png)

## 4.2 保护分支

当确定分支策略后，还应确保研发人员只能在开发分支如`feature`、 `fix`分支进行代码提交，应拒绝开发人员直接向主干分支如`main`分支或发版分支如`release`分支提交代码。开发分支和主干分支、发版分支之间必须通过合并请求，走评审或确认机制传递代码，避免管理混乱、引起冲突。在极狐GitLab中可以通过保护分支来达到以上目的。

### 4.2.1 [角色级保护](https://docs.gitlab.com/ee/user/project/repository/branches/protected.html)
基于用户角色设置保护分支，可能会导致管理失控。因为`Maintainer`角色具备的权限较多，除了基本的管理权限外，还能给项目设置新的人员及角色权限，即引入更多的Maintainer角色，无法满足企业合规管理的需求。

操作步骤：
1. 在指定项目，如`子项目A`“设置——仓库——受保护分支”中，新建保护分支，输入`release*`来匹配所有的`release`分支，包括后续创建的`release`分支也自动匹配为受保护分支。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311521677-d4c895.png)

2. 由于GitLab项目中main分支是默认分支，所以本身已经是受保护分支。
3. 调整受保护分支，允许`Maintainer`角色可以合并，`No One`可以推送，即只有`Maintainer`角色通过确认合并请求，才能向受保护的`main`分支`release*`分支传递代码。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311522898-2766f6.png)

### 4.2.2 [用户级保护](https://docs.gitlab.com/ee/user/project/repository/branches/protected.html)[专业版]
基于用户设置保护分支，可将合并、推送权限进行细粒度控制，仅允许一个人或几个人具备合并、推送权限，可有效规避代码越权提交，管理失控等问题。

1. 与“角色级保护”设置一样，可在“允许合并”、“允许推送和合并”处选择具体的用户，支持多选。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311523688-742ccf.png)

### 4.2.3 [群组保护分支](https://docs.gitlab.com/ee/user/project/repository/branches/protected.html)[专业版]
极狐GitLab支持在群组级别设置保护分支，将对该群组的所有项目（代码库）生效，且在项目中不能修改、覆盖群组级别的保护分支。

## 4.3 分支开发
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311523533-812463.png)

### 4.3.1 [代码推送规则](https://docs.gitlab.com/ee/user/project/repository/push_rules.html)[专业版]
在开发分支下提交代码，应遵循统一、规范的提交格式，否则容易导致管理混乱，降低协同效率。如下图：
* 左图是不规范的代码提交，意义不清、描述重复。
* 右图是知名项目Angular.js的代码提交，遵循统一的提交规范`类型（范围）: 描述 （需求编号）`，该规范也被称为Angular规范，是业内使用比较普遍的提交规范
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

#### 4.3.2 代码开发与推送
在4.1章节中，新建了分支`feature/monitor-temperatur`e，用来开发`#2`号需求“获取温度数据”。现在可以模拟代码开发和提交推送过程。
1. 将`子项目A`的代码克隆到本地。
2. 在本地将`子项目A`的代码切换到`feature/monitor-temperature`分支。
3. 新增一些代码文件，如`README.MD`，并向文件中写入一些内容。
4. 本地提交代码，代码提交格式应遵循4.3.1章节推送规则的规范，如`feat: #2 获取温度数据`。
5. 重复3-4步骤，直到功能开发完成。
6. 向GitLab推送代码，在GitLab指定项目，如`子项目A`“代码——提交”可切换分支并查看不同分支的提交记录。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311528275-bd1315.png)

#### 4.3.3 [代码提交关联GitLab议题](https://docs.gitlab.com/ee/user/project/issues/crosslinking_issues.html)
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

#### 4.3.4 代码提交关联第三方项目管理系统 
如果您已经使用Jira、PingCode、Ones、LigaAI等国内外主流项目管理工具，极狐GitLab的代码提交也可以关联这些主流第三方系统的任务ID，实现双向追溯。目前已经支持的有：

以Jira为例，实现的效果如下：
1. 可以修改推送规则，如`^(feat|fix|doc|style|refactor|test|revert|ci): JIRA\-\d+ .+`，其中JIRA是Jira议题的前缀，不同Jira项目的前缀不同，需要替换。这样可强制研发人员每次提交代码时都填写Jira的议题ID号。
2. 代码提交追溯需求、缺陷：在代码提交记录中，点击议题ID号，则会跳转到对应的议题。
![](https://pek3b.qingstor.com/hexo-blog/2024/11/01/202411010935438-f718b9.png)
3. 需求、缺陷追溯代码提交：在Jira议题中也可查看该议题关联的代码提交记录。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311532272-a9ecde.png)
4. 更多功能，请参见[文档](https://docs.gitlab.com/ee/integration/jira/configure.html)

### 4.4 持续集成、持续部署

代码推送到极狐GitLab后，应触发流水线实现自动化的编译、打包、部署。

#### 4.4.1 配置流水线
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311929021-e3be70.png)
自动编译、构建、打包、单元测试、质量扫描、部署、发布都依赖于流水线的配置和编排，只有先配置好流水线才能再后续的开发过程中实现上述功能。

*为降低流程复杂度，请参考4.2章节，临时关闭`main`分支的保护，用来配置、调试流水线（调试结束后开启保护分支）。需注意实际项目中不推荐直接修改`main`分支文件，依然是通过`feature`分支配置、调试流水线，再合并到main分支。*

##### 4.4.1.1 [环境变量管理](https://docs.gitlab.com/ee/ci/variables/)

如果需要将打包后的程序直接上传/部署到其他环境里，需要将不同环境的服务器的信息存储到GitLab环境变量中，并且确保GitLab Runner所在的服务器与上传/部署的目标服务器网络互通。

在本示例中，我们计划通过scp命令将软件包上传到不同环境的服务器中，那么在GitLab里，存储的变量可以为

```bash
# 生产环境的用户名、IP、PORT、路径
USERNAME_PROD: ubuntu
IP_PROD: 192.168.0.1
PORT_PROD: 22
PATH_PROD: /wwwroot/

# 测试环境的用户名、IP、PORT、路径
USERNAME_TEST: ubuntu
IP_TEST: 172.16.0.1
PORT_TEST: 22
PATH_TEST: /wwwroot/
```

操作步骤：

1. 在子项目A的“设置——CICD——变量”中，添加上述变量。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311931298-472961.png)
2. 为了防止这些变量在流水线中被`echo`命令打印出来导致信息泄露，可以在设置变量时勾选“隐藏变量”。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311932252-f3ae32.png)
3. 环境变量也可以设置在群组和实例级别，对群组和全局生效。

##### 4.4.1.2 编译、打包、部署

进行这一步操作之前，需要根据不同语言、不同框架的代码项目，需要准备好编译服务器并安装好编译程序所需的环境，或准备好用于编译程序的Docker镜像。安装好[GitLab Runner](https://docs.gitlab.com/runner/install/index.html)（如果您使用GitLab SaaS），然后参考以下内容基于[GitLab CI关键字](https://docs.gitlab.com/ee/ci/yaml/)编写流水线脚本。

以一个C++的项目为例，通过指定的GitLab Runner完成自动编译、打包，根据流水线的触发条件来将软件包部署到指定的环境，如通过`tag`触发的流水线将软件包部署到生产环境（tag表示正式发版）同时将软件包上传到GitLab的制品库（软件包库），通过其他分支触发的流水线将软件包部署到测试环境。

操作步骤：
1. 在子项目A的“构建——流水线编辑器”中，点击“配置流水线”。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311934371-a5461a.png)

2. 流水线脚本内容如下：
```yaml
stages:
  - build
  - upload
  - deploy

# 编译任务，使用docker类型Runner
build-job:
  stage: build
  # 编译环境镜像
  image: srzzumix/googletest
  script:
    # 编译打包
    - mkdir build
    - cd build
    - cmake ..
    - make
  artifacts:
    when: always
    paths:
      # 暂存打包程序，供upload-job使用
      - build/libsqrt.so

# 上传任务，使用docker类型Runner
upload-job:
  stage: upload
  image: alpine/curl
  rules:
    # 如果是从tag触发，即生产版本，则执行上传到制品库任务
    - if: '$CI_COMMIT_TAG  =~ /^v?\d+\.\d+\.\d+$/'
  script:
    # 上传到软件包库
    - 'curl --header "JOB-TOKEN: $CI_JOB_TOKEN" --upload-file ./build/libsqrt.so "${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/packages/generic/release/$CI_COMMIT_TAG/libsqrt.so"'

# 部署任务，使用shell类型Runner
deploy-job:
  stage: deploy
  tags: 
    - deploy_jump_server 
  # 用分支名称区分环境
  environment: $CI_COMMIT_REF_NAME
  script:
  # 如果是从tag触发，使用生产环境变量，否则使用测试环境变量
    - |
      if echo "$CI_COMMIT_TAG" | grep -Eq '^v?[0-9]+\.[0-9]+\.[0-9]+$'; then
          USERNAME=$USERNAME_PROD
          IP=$IP_PROD
          PORT=$PORT_PROD
          PATH=$PATH_PROD
          echo '生产环境'
      else
          USERNAME=$USERNAME_TEST
          IP=$IP_TEST
          PORT=$PORT_TEST
          PATH=$PATH_TEST
          echo '测试环境'
      fi
    # 通过scp命令传输到对应环境
    #- scp -r ./build/libsqrt.so $USERNAME@$IP:@PATH -P $PORT
    - echo "Deployment Complete!"
```

需注意执行`deploy-job`的Runner需与部署环境网络互通，上述示例使用scp命令执行部署，还需参考以下方式配置该Runner到部署服务器的SSH Key：
* [基于Shell类型Runner配置SSH Key](https://docs.gitlab.com/ee/ci/jobs/ssh_keys.html#ssh-keys-when-using-the-shell-executor)
* [基于Docker类型Runner配置SSH Key](https://docs.gitlab.com/ee/ci/jobs/ssh_keys.html#ssh-keys-when-using-the-docker-executor)


3. 可在`子项目A`的“构建——流水线”中查看流水线运行状态和结果。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311937551-14d534.png)

4. 如果部署任务成功执行，可以看到对应的软件包库已经上传/部署到目标环境（此处应是测试环境）的服务器中，如果部署失败，应结合`deploy-job`的日志进行排查。

##### 4.4.1.3 [单元测试](https://docs.gitlab.com/ee/ci/testing/unit_test_reports.html)
极狐GitLab支持与单元测试框架集成，不同语言、不同测试框架的集成方式见文档。
以上文C++的代码项目为例

操作步骤：
1. 使用GoogleTest作为单元测试框架。
2. 编写测试脚本，如`sqrt_test.cpp`
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311939386-485cb5.png)
3. 修改`.gitlab-ci.yml`，增加以下内容
```yaml
stages:
  - build
  - test # 增加test阶段
  - upload
  - deploy
  
# 编译任务
build-job:
  stage: build
  # 编译环境镜像
  image: srzzumix/googletest
  script:
    # 编译打包
    - mkdir build
    - cd build
    - cmake ..
    - make
    # 运行单元测试
    - ./sqrt_unittest --gtest_output="xml:report.xml"
    # 生成覆盖率
    - apt update
    - apt install -y pip
    - pip install gcovr --break-system-packages
    - gcovr --xml-pretty --exclude-unreachable-branches --print-summary -o coverage.xml --root ${CI_PROJECT_DIR}
  coverage: /^\s*lines:\s*\d+.\d+\%/
  artifacts:
    when: always
    paths:
      # 暂存打包程序，供upload-job使用
      - build/libsqrt.so
    reports:
      # 单测报告
      junit: build/report.xml
      # 单测覆盖率报告
      coverage_report:
        coverage_format: cobertura
        path: build/coverage.xml
```
4. 如果配置正确，可在子项目A的“构建——流水线”中看到流水线的状态为成功。进入流水线，可看到单元测试的报告
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311939504-25f617.png)

##### 4.4.1.4 [质量扫描](https://docs.gitlab.com/ee/ci/testing/code_quality.html)[专业版]

极狐GitLab支持开箱即用的代码质量扫描，使用该功能需要Docker或K8S类型的Runner，且Runner需开启[Docker-in-Docker模式](https://docs.gitlab.com/ee/ci/docker/using_docker_build.html#use-docker-in-docker)，以Docker类型的Runner为例：

1. 进入Runner的Docker容器。
2. 修改`/etc/gitlab-runner/config.toml`：
```
[[runners]]
  url = xxxx
  token = xxxx
  executor = "docker"
  [runners.docker]
    tls_verify = xxx
    image = xxx
    # 仅修改privileged为true
    privileged = true
    disable_cache = xxx
    volumes = xxx
```
配置好Runner后，可以开启代码质量扫描，以上文C++的代码项目为例：

操作步骤：
1. 在`子项目A`代码库根目录创建文件`.codeclimate.yml`，内容如下：
```yaml
plugins:
  cppcheck:
    enabled: true
```
2. 修改`.gitlab-ci.yml`，增加以下内容:
```yaml
include:
  - template: Jobs/Code-Quality.gitlab-ci.yml
  
code_quality:
    image: registry.gitlab.cn/gitlab-cn/docker:20.10.12
    services:
      - name: 'registry.gitlab.cn/gitlab-cn/docker:20.10.12-dind'
        command: ['--tls=false', '--host=tcp://0.0.0.0:2375']
        alias: docker
    variables:
      CODECLIMATE_PREFIX: "registry.gitlab.cn/"
```
3.如果配置正确，可在`子项目A`的“构建——流水线”中看到流水线的状态为成功。进入流水线，可看到质量扫描的报告
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311942742-8f3635.png)

##### 4.4.1.5 安全扫描[旗舰版]

极狐GitLab旗舰版内置SAST、SCA、DAST、密钥检测、模糊测试等7种类型的安全扫描工具，覆盖软件全生命周期，配置简单，开箱即用。使用该功能需要Docker或K8S类型的Runner。
1. 在`子项目A`的“构建——流水线编辑器”中添加以下内容，以开启其中的4种静态安全扫描能力：
```yaml
stages:
  - test

include:
  # 静态应用测试
  - template: Security/SAST.gitlab-ci.yml
  # 依赖扫描与许可证检测
  - template: Security/Dependency-Scanning.gitlab-ci.yml
  # 密钥检测
  - template: Security/Secret-Detection.gitlab-ci.yml

variables:
  # 安全扫描日志，有助于排查错误
  SECURE_LOG_LEVEL: debug
```
如果是扫描Maven项目，且需要自定义`settings.xml`文件，可参考4.4.1.1为该项目或群组创建环境变量，如名称为“MVN_SETTING”，类型为“文件”，内容为`settings.xml`文件中的内容
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311944423-33bc8d.png)

然后在流水线脚本中增加以下内容：
```yaml
variables:
  # 安全扫描日志，有助于排查错误
  SECURE_LOG_LEVEL: debug
  # 使用自定义MVN Settings
  MAVEN_CLI_OPTS: "-s $MVN_SETTING"
```
3. 如果配置正确，可在子项目A的“构建——流水线”中看到流水线的状态为成功。进入流水线，可看到安全扫描和许可证报告
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311944786-fb38ee.png)

##### 4.4.1.6  安全策略[旗舰版]

您也可以参考文档，在群组级别设置安全扫描策略，该群组的所有项目将会强制执行这个安全扫描策略，可实现安全扫描的批量设置、强制执行，并且无需修改项目自身的流水线脚本，减少侵入性。

##### 4.4.2 [单元测试](https://docs.gitlab.com/ee/ci/testing/unit_test_reports.html)
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311945901-77d1fe.png)

操作步骤：
1. 接着4.3.2分支开发的内容，在`子项目A`的`feature/monitor-temperature`分支增加一些单元测试的用例，用来体现差异。
```c++
#include "sqrt.h"
#include "gtest/gtest.h"

TEST(SquareRootTest, PositiveNos) // normal cases
{ 
    ASSERT_EQ(6, squareRoot(36.0));
    ASSERT_EQ(18.0, squareRoot(324.0));
    ASSERT_EQ(25.4, squareRoot(645.16));
    ASSERT_EQ(0, squareRoot(0.0));
}

// 增加测试用例
TEST(SquareRootTest, NegativeNos) // extreme cases
{
    ASSERT_EQ(-1.0, squareRoot(-15.0));
    ASSERT_EQ(-1.0, squareRoot(-0.2));
}

int main(int argc, char **argv) 
{
    testing::GTEST_FLAG(output) = "xml:report.xml";
    testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}
```

2. 提交代码后，自动触发`feature/monitor-temperature`分支的流水线，等流水线执行完成，可在流水线中查看单元测试报告。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311946097-9a2b03.png)

3. 也可在4.1.3或4.1.4章节中创建的`feature/monitor-temperature`到`main`的合并请求中查看单元测试报告以及单元测试覆盖率。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311946390-511660.png)

#### 4.4.3 [质量扫描](https://docs.gitlab.com/ee/ci/testing/code_quality.html)[专业版]
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311947452-a1bb02.png)

操作步骤：

1. 在`子项目A`的`feature/monitor-temperature`分支人为引入一些代码质量问题。
```c++
#include "sqrt.h"
#include <iostream>
#include <cmath>
 
double squareRoot(const double a) 
{

    double b = sqrt(a);
    if(b != b) return -1.0;// NaN check
    else return sqrt(a);
}

// 人为引入代码质量问题
void decrease_code_quality() {
    // introduce an out-of-bounds error to check code quality report
    char a[10];
    a[10] = 0;

    return;
}
```

2. 提交代码后，自动触发`feature/monitor-temperature`分支的流水线，等流水线执行完成，可在流水线中查看`feature/monitor-temperature`分支的`全量`代码质量报告。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311947583-6c2ade.png)

3. 也可在4.1.3或4.1.4章节中创建的`feature/monitor-temperature`到main的合并请求中查看`feature/monitor-temperature`分支新引入的代码质量报告。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311948489-5b456a.png)

4. 如果您使用极狐GitLab旗舰版，还可以在合并请求的变更页面查看代码质量问题，详见[文档](https://docs.gitlab.com/ee/ci/testing/code_quality.html#merge-request-changes-view)。

#### 4.4.3 [质量扫描](https://docs.gitlab.com/ee/ci/testing/code_quality.html)[专业版]
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312045904-6e6ada.png)

操作步骤：
1. 在子项目A的feature/monitor-temperature分支人为引入一些代码质量问题。
```c++
#include "sqrt.h"
#include <iostream>
#include <cmath>
 
double squareRoot(const double a) 
{

    double b = sqrt(a);
    if(b != b) return -1.0;// NaN check
    else return sqrt(a);
}

// 人为引入代码质量问题
void decrease_code_quality() {
    // introduce an out-of-bounds error to check code quality report
    char a[10];
    a[10] = 0;

    return;
}
```

2. 提交代码后，自动触发`feature/monitor-temperature`分支的流水线，等流水线执行完成，可在流水线中查看`feature/monitor-temperature`分支的全量代码质量报告。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312046452-7ac303.png)

3. 也可在4.1.3或4.1.4章节中创建的`feature/monitor-temperature`到`main`的合并请求中查看`feature/monitor-temperature`分支新引入的代码质量报告。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312047667-b6cb39.png)
4. 如果您使用极狐GitLab旗舰版，还可以在合并请求的变更页面查看代码质量问题。

#### 4.4.4 [安全扫描](https://docs.gitlab.com/ee/user/application_security/secure_your_application.html)[旗舰版]

扫描报告可通过以下途径查看
* 漏洞报告：指定项目“安全——漏洞报告”，显示默认分支如`main/master`的全量漏洞报告：
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312044172-5cbbe9.png)
* 依赖列表：指定项目“安全——依赖列表”，显示默认分支如main/master的全量依赖列表：
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312044067-44e9ba.png)
* 流水线安全报告：指定项目“流水线——安全/许可证”，显示当前分支的全量漏洞报告和许可证合规
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312045525-b87e05.png)
* 合并请求安全报告：指定项目“合并请求——安全扫描/许可证”，显示源分支相较于目标分支的增量漏洞报告和许可证合规
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312045626-953fc5.png)

#### 4.4.5 [代码评审](https://docs.gitlab.com/ee/user/project/merge_requests/approvals/rules.html)
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312043340-c4bb95.png)

> 加速代码评审是提高软件交付效能最有效的途径之一。处于高效代码评审的团队，其软件交付效能有着50%的提升。                                                                                         ——《2023 加速度 DevOps 全球状态报告》

如果您已参考4.1.3或4.1.4章节创建`feature/monitor-temperature`到`main`的合并请求，参考4.3章节推送了一些代码，参考4.4.1章节配置好流水线，那么此时您可以在合并请求中开展代码评审工作。
极狐GitLab专业版提供以下几种评审机制，可以帮助企业更好的开展代码评审工作。

##### 4.4.5.1 [合并请求批准](https://docs.gitlab.com/ee/user/project/merge_requests/approvals/rules.html)[专业版]

多人多规则、自定义的流程化审批机制。

操作步骤：
1. 在指定项目，如`子项目A`的“设置——合并请求——合并请求批准”中，“添加批准规则”。
2. 添加一个“规则名称”为`测试组`的规则，“目标分支”为`所有受保护的分支`，“需要核准”为`1`，“添加审核人”中选择需要参与评审的测试人员。这条规则意思是所有向`mai`n、`release`分支发起的合并请求，都需要指定的测试人员参与评审，其中只要有1个人通过评审，则这条规则就算通过。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311950412-d4b013.png)
3. 添加一个“规则名称”为`开发组`的规则，“目标分支”为`main`，“需要核准”为`1`，“添加审核人”中选择需要参与评审的开发人员。这条规则意思是所有向`main`分支发起的合并请求，都需要指定的开发人员参与评审，其中只要有1个人通过评审，则这条规则就算通过。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311950388-2e7fca.png)
4. 考虑到代码提交人也可能是代码评审人，为了防止代码提交人自己给自己评审，可以：
* 勾选“阻止合并请求的创建者批准”。即如果评审人是合并请求的发起人，那么他不能参与评审。
* 勾选“阻止添加提交的用户批准”。即如果评审人是合并请求中代码的提交人，那么他不能参与评审。
* 选择“添加提交时：删除所有批准”。即评审过程中，如果有人评审通过，但开发人员提交了新的代码，则将所有通过的评审删除，应重新评审。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311951546-eb3983.png)
5. 合并请求批准设置后仅对新发起的合并请求生效。为了验证效果，可以先将之前创建的合并请求删除，再重新创建从`feature/monitor-temperature`到`main`的合并请求，即可在合并请求中看到需要评审人批准后，才能进行后续的合并动作。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311951903-1a1e5c.png)
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311952484-6924fb.png)
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311952555-7b942e.png)

评审人可以点击“批准”或“撤销批准”，来决定评审是否通过。评审人给出通过意见后，“核准”列会显示数据变化，“已核准人”列会显示对应的评审人。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311952595-85c4ae.png)
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311952674-fd6290.png)

##### 4.4.5.2 [代码所有者CodeOwner](https://docs.gitlab.com/ee/user/project/codeowners/)[专业版]

针对不同的文件夹、文件类型、文件名称设置负责人。当这些文件内容发生变化时，自动将对应的负责人纳入合并请求的代码评审流程。

CodeOwner可以有效防止在协同开发的过程中，因为研发人员无意或有意修改他人的代码，但又未通知到相关人员，最终导致代码冲突、程序异常甚至引起一些生产事故的问题。

操作步骤：
1. 在指定项目，如`子项目A`的默认分支，如`main`分支中创建名为`CODEOWNERS`的文件，或者通过`feature`分支创建文件然后合并到`main`分支。
2. `CODEOWNERS`文件的格式内容如下：
```
# 指定文件的负责人，@user1、@user2为GitLab的用户账号
file.md @user1
path/file.md @user1 @user2

# 指定文件类型的负责人
*.cpp @user1 @user2

# 指定文件路径的负责人
docs/ @user1
model/db/ @user2

# 将群组作为负责人，groupx、group-x/subgroup-y为群组路径
file.md @group-x @group-x/subgroup-y
```
3. 在`子项目A`的“设置——仓库——受保护分支”中，开启需要代码所有者参与评审的分支
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311954127-393518.png)

4. 同合并请求批准一样，在合并请求中可以看到如果有人改了代码负责人的代码，那么这个负责人会被自动纳入代码评审流程。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311955636-f23ed3.png)

##### 4.4.5.3 [单元测试覆盖率降低触发评审](https://docs.gitlab.com/ee/ci/testing/code_coverage.html#coverage-check-approval-rule)[专业版]

当合并请求的源分支（如`feature/monitor-temperature`）的单元测试覆盖率相较于目标分支（如`main`分支）降低时，触发评审。可以将代码的单元测试覆盖率始终维持在一个标准水平，从而提高代码的质量和可靠性。

操作步骤：
1. 在`子项目A`的“设置——合并请求——合并请求批准”中启用覆盖率检查。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311956514-f39983.png)
2. 同合并请求批准一样，配置“目标分支”、“需要核准”、“添加核准人”。
3. 同合并请求批准一样，新的规则只对新的合并请求生效，删除并重新创建合并请求后可以看到该规则已生效
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311956997-4413ce.png)

##### 4.4.5.4 [安全门禁](https://docs.gitlab.com/ee/user/application_security/policies/merge_request_approval_policies.html)[旗舰版]

根据漏洞类型、级别、数量、状态设置安全门禁，当合并请求中安全扫描报告不符合安全门禁设置的要求时触发强制评审。可以帮助研发人员在开发阶段发现潜在的安全风险，并要求他们在代码合并前处理这些安全漏洞，或者通过安全负责人的审批后才允许合并。快速、多类型的安全扫描加上安全门禁可以帮助企业更好的落地安全左移。

操作步骤：
1. 在子项目A的“安全——策略——新建策略——扫描结果策略”。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312034233-cd11ab.png)
2. 根据需求自定义安全门禁策略和审核人。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312034637-df080d.png)
3. 当合并请求中，源分支相较于目标分支的`增量漏洞报告`不满足安全门禁策略的要求，则无法进行代码合并，只有当开发人员解决相关漏洞问题，或通过审核人特批才能正常合并代码，从而实现安全卡点。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312035557-58a364.png)

##### 4.4.5.5 [合并请求关闭GitLab议题](https://docs.gitlab.com/ee/user/project/issues/managing_issues.html#closing-issues-automatically)
可以在合并请求中关联GitLab议题，当合并请求被执行合并后，该议题的状态自动变成关闭状态，即表示完成该议题。

操作步骤：
1. 在指定的合并请求的描述中，添加`Closes #1`、`Closes #4, #6`这种关键字加议题ID的格式内容
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312036789-24d8dc.png)

2. 合并请求执行合并后，对应的议题变成已关闭状态。

#### 4.4.6 测试验证
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312036825-14d6b5.png)

如4.1.1所提到的，测试人员开展工作可能分为两个阶段：

##### 4.4.6.1 功能测试
在单个任务开发阶段，即单个feature分支或单个fix分支开发完成后，需向main分支发起合并请求。在代码合并前，代码已部署到测试环境，测试人员可以在测试环境通过自动化工具或手动测试验证这个单一个功能是否正常，并参与这个功能的代码评审。若发现缺陷Bug，则可拒绝代码合并，同时给出意见反馈，开发人员重新提交代码进行修复；若功能都正常，则可在合并请求中给出通过批准，随后可执行代码合并。
当一个里程碑的所有功能开发完成后，基于main分支创建release分支，并进入集成测试阶段。

操作步骤：
1. 基于`main`分支创建`release`分支，如`release/1.0.0`。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312037097-fee29c.png)
##### 4.4.6.2 集成测试
在集成测试阶段，基于main分支创建release分支，release分支包含了多个feature分支集成后的代码，从release分支触发代码构建，发布到测试环境进行集成测试。如果测试人员在这个阶段发现缺陷，那么可参考3.5.3提交缺陷议题，创建新的feature或fix分支来开发新功能或修复缺陷，再向main分支合并（功能测试阶段）。合并通过后使用cherry-pick拣选功能将这个合并请求拣选到release分支（集成测试阶段）。如果通过这个阶段的测试，则可以进入后续的交付、部署阶段。
操作步骤：
1. 在子项目A创建一个新的fix分支，如fix/tag-version-diff。
2. 在fix/tag-version-diff分支下修改一些代码，模拟测试人员在集成测试中发现了一些缺陷，需要修复。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312037757-a53d6a.png)
3. 参考4.4.4章节，将`fix/tag-version-diff`合并到`main`分支。
4. 在`子项目A`的“代码——提交”中，找到已从`fix`分支合并到`main`分支的代码提交，点击进入。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312038102-623301.png)
5. 将该合并请求拣选到release/1.0.0分支。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312038387-ce76b2.png)
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312039305-c3ecdf.png)
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312039781-8127c3.png)

#### 4.4.7 交付、部署
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311957603-13ac06.png)

##### 4.4.7.1 测试环境交付

在集成测试阶段，也就是基于`release`分支触发流水线，可以看到：
1. 在测试环境的服务器中，也能看到这个软件包被scp命令拷贝到了服务器中，这是`deploy-job`实现的功能。本示例仅在`deploy-job`中打印“测试环境”字符。

##### 4.4.7.2 生产环境交付
集成测试通过，就可以准备发布正式版本。

操作步骤：
1. 在`子项目A`“代码——标签”中新建标签（tag）。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311958421-42289f.png)
2. 填写“标签名称”，如1.0.1，“创建自”通过集成测试的`release`分支，即`release/1.0.0`分支
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311958053-8d1a0a.png)
3. 在生产环境的服务器中，也能看到这个软件包被scp命令拷贝到了服务器中，这是`deploy-job`实现的功能。本示例仅在`deploy-job`中打印“生产环境”字符。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311959343-971b79.png)
4. 在`子项目A`“部署——软件包库”中，已经有生产环境的安装包了，这是`upload-job`实现的功能。
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410311959813-470223.png)


## 5. 监控反馈
![](https://pek3b.qingstor.com/hexo-blog/2024/10/31/202410312000344-5a3f6d.png)

当软件已经完成交付、部署，那么就进入了运维阶段，企业可以结合自己的实际情况采用不同的监控手段来了解软件的运行情况。
当软件发生故障时，运维人员、测试人员、开发人员再将问题进行定位，按照第3章节的步骤，创建新的需求或缺陷议题，并开始下一轮开发工作。

至此，极狐GitLab工作流已经完全跑通，并形成了闭环，感谢您的阅读。
