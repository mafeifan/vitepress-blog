## 名词解释

### main分支

只存线上的代码，只有确定可以上线时的才合并到main上，并且在main的基础上打Tag。

### develop分支

初次创建develop时，需要从main分支拉取，保持开发时代码和线上最新的代码相同。develop分支是在开发时的最终分支，具有所有当前版本需要上线的所有功能。

### feature分支

用于开发功能的分支，必须从最新的develop分支代码拉取。分支命名基本上是feature/xxxxx（和功能相关的名字或JIRA Ticket ID带描述）。

不强制提交到远程仓库，可以本地创建。比如，某开发人员开发登录功能，开发人员从develop分支的最新代码创建新分支命名为feature/login，然后切换到这个新分支开始开发。

开发完成后，测试差不多完成，合并到develop分支。

TODO: 只要有代码合并到develop就要出发自动化测试

### release分支

当develop分支已经有了本次上线的所有代码的时候，并且以通过全部测试的时候，可以从develop分支创建release分支了，release分支是为发布新的产品版本而设计的。

通过在release分支上进行这些工作可以让develop分支空闲出来以接受新的feature分支上的代码提交，进入新的软件开发迭代周期。

在这个分支上的代码允许做小的缺陷修正、准备发布版本所需的各项说明信息（版本号、发布时间、编译时间等等）。

比如，此次1.0版本所有的功能版本都已经合并到了develop上，并且所有测试都已经通过了测试，那就创建新的release分支`release/v1.0`。切换到新分支，修改最新的版本号等，不允许大的更改。

### hotfix分支

当线上出现bug需要紧急修复时，从当前main分支派生hotfix分支。

修改线上bug，修改完成后合并回develop和main分支。

比如，在线上v1.0登录功能出现问题，我从main拉取代码创建新的分支`hotfix/v1.0_login`，修改完成后合并到main和develop上。

### tag

上线合并到main以后,保留版本历史记录,从main创建tag版本


## 分支生命周期


| 分支        | 说明                                                                                       | 创建来源      | 代码来源               | 目标分支         | 代码输入方式   | 生命周期             | 命名规则                     |
|-----------|--------------------------------------------------------------------------------------------|---------------|------------------------|------------------|----------------|----------------------|--------------------------|
| ★ main    | 主干分支，通常作为代码基线，所有发布的代码最终都会合并到此分支。                           | 无            | release, hotfix       | 无               | Pull request   | 长期                 | main                     |
| ★ develop | 开发分支，通常作为其他分支的源分支，也最终会合并回此分支                                     | 无            | feature, release, hotfix | 无           | Pull request   | 长期                 | develop                  |
| feature   | 功能分支，用于为未来的应用版本开发新的功能需求                                             | develop       | develop               | develop         | Merge          | 并入目标分支后，可以删除 | feature_{jira_issue_key} |
| ★ release | 发布分支，用于辅助新版本发布的准备工作，例如小bug的修复，或者版本号的修改等等              | develop       | develop               | develop, main   | Merge          | 并入目标分支后，可以删除 | release_{jira_issue_key} |
| hotfix    | 修复分支，用于正式版本的紧急修复                                                           | main          | main                  | develop, main, release | Merge   | 并入目标分支后，可以删除 | hotfix_{jira_issue_key}  |
| tag       | main发布版本快照                                                                          | main          | main                  | 无               | 无             | 长期                 | tag_{jira_issue_key}     | 


## 场景说明
#### 正常的业务需求流程

当接收到正常的业务需求时，需要约定一个大的发布版本（一次迭代）以及这个发布版本包含的多个jira任务，一个发布版本必须在一个时间点上发布；如果jira上的任务粒度太大，则需要拆分细化成更小的jira子任务（工作量在1~2人日为准，最好控制在一天以内）。

以develop为基准创建一个分支，分支名称为“feature-jira编号-开发人员姓名全拼”，如“feature-ONC-21-zhangsan”，jira任务ONC-21的所有开发工作都在feature-ONC-21-zhangsan，所有开发过程的commit  message需要填写具体的开发内容。

开发及单元测试工作完成后创建merge request合并到develop分支，合并请求消息同样需要复制jira的内容描述以及具体的开发内容。

开发人员的自测工作基于合并后的develop分支代码进行，如果这个发布版本所有jira任务全部自测通过后，基于测试通过的develop分支创建一个release分支，分支名称为“release-版本号”，如“release-ctrip1.0”，测试人员基于release分支进行测试。

测试人员继续在新建的release分支上进行回归测试和验证，如果存在bug直接在该分支修改并合并到develop分支；如果验证通过则准备生产上线，

生产上线时将release代码合并到main分支，并打tag，tag名称为“tag-版本号”，从release打包上线。

#### 紧急bug修复流程	
当发现线上bug需要紧急修复时（开发人员需要确保bug修复已经在jira录入），需要以main分支为基准创建一个hotfix分支，分支名称为“hotfix-jira编号-开发人员姓名全拼”；

bug修复代码直接在新建的hotfix分支上提交，commit  message需要填写具体的开发内容。测试人员直接在hotfix分支测试测试

通过后，开发人员同时请求合并到main分支,release分支,develop分支，合并请求消息同样需要复制jira的任务描述以及具体的开发内容。

生产上线时将hotfix代码合并到main分支，并打tag，tag名称为“tag-版本号-jira编号”，从release打包上线。

#### 高优先级开发任务流程
如果在其他发布版本或迭代在开发中，而优先级更高的迭代需要同时进行，则需要特别注意。在创建feature分支时，要确保develop分支和main分支时一致的没有被未上线甚至未测试的代码污染过的，如果是则直接以develop分支为基准创建新的分支，命名规范如同正常的业务需求流程；
如果develop分支上已经有其他未上线分支的代码且该分支代码上线优先级较低，则不能以develop分支为基准创建分支，需要以main分支为基准创建分支。

当更高优先级feature功能开发和自测完成后，需要上测试环境，这时，需要以main分支为基准创建一个release分支，release分支名称为“release-版本号”，所有较高优先级的feature分支合并到高优先级的release分支上，并在该分支进行测试。

release分支测试通过后，合并到main分支准备上生产，同时release合并到develop分支；main分支生产上线后打tag，tag名称为“tag-版本号”。
