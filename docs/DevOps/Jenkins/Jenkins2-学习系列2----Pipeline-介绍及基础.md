### pipeline 是什么
从某种抽象层次上讲，部署流水线(Deployment pipeline)是指从软件版本控制库到用户手中这一过程的自动化表现形式。

Jenkins 2.x 支持 pipeline as code，可以通过”代码“来描述部署流水线。

使用"代码”而不是UI的意义在于:
* 更好地版本化:将pipeline提交到软件版本库中进行版本控制。
* 更好地协作: pipeline的每次修改对所有人都是可见的。除此之外，还可以对pipeline进行代码审查。
* 更好的重用性:手动操作没法重用，但是代码可以重用。
::: tip
总结：创建Jenkins 项目尽量使用 pipeline 风格。是2.x最大特别，也是官方主推的特性，是发展趋势。
:::
### Jenkinsfile 是什么

Jenkinsfile就是一个文本文件，也就是部署流水线概念在Jenkins中的表现形式。像Dockerfile之于Docker。所有部署流水线的逻辑都写在Jenkinsfile中。
建议把Jenkinsfile跟项目源码一块加入到版本控制中，这样方便项目成员了解构建构建和流程。当然出于安全，有些环境变量和参数等可以管理在Jenkins管理平台上。具体后续会有介绍。

### pipeline 基本构成
写 pipeline 就是写 Groovy 代码，Jenkins pipeline 其实就是基于Groovy语言实现的一种领域DSL(Domain Specific Language)。

Jenkins pipeline支持两种语法，声明式和脚本式，前者简单，结构化好，后者灵活，扩展性好，但是需要对Groovy比较熟练。
声明式语法更符合阅读习惯，所有示例都会使用声明式语法。

pipeline的内容包含执行编译、打包、测试、输出测试报告等步骤。

如下图，声明式pipeline的语法结构概览，粗线边框的表示必需的

> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-0179c7d94aa620db.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

例1   一个最简单的声明式pipeline

```bash
pipeline {
  agent any
   // stages 包含一个或多个阶段(stage)的容器
  stages {
     // stage 阶段，pipleline流水线由一个或多个阶段(stage)组成，每个阶段必须有名称，这里build就是此阶段的名称
     stage('build') {
       // steps，阶段中的一个或多个具体步骤(step)的容器
       steps {
         # 这是是具体的步骤，真正”做事“的，不可再拆分的最小操作
         echo "hello world"
       }  
     }
  }
}
```
* 所有的声明必须包含在 pipeline 语句块中。
* 块只能由 stage, directives (指令，后续会讲到) 或 steps 组成。
* agent：指定流水线的执行位置，流水线中的每个阶段都必须在某个地方（物理机，虚拟机或 Docker 容器）执行，agent 部分即指定具体在哪里执行。
* echo 是内置命令，用来输出一段文本，还有些命令是安装插件后才有的，参见[官方文档](https://jenkins.io/doc/pipeline/steps/workflow-basic-steps/)。
* step： 步骤，可拆分最小单元，真正“做事”的语句。如`echo "hello world"`表示输出一句话。

::: tip
有些插件安装后可以直接在pipeline中使用，如发送邮件的`Extended E-mail Notification`，安装后可以直接
```
steps { 
    emailext to: 'mafeifan@qq.com', subject: "test", body:  "email content"
}
```
来发送邮件 
:::


### 参考
* https://blog.csdn.net/u011541946/article/details/78220110
* [流水线](https://jenkins.io/zh/doc/book/pipeline/)
* [流水线语法](https://jenkins.io/zh/doc/book/pipeline/syntax/)
