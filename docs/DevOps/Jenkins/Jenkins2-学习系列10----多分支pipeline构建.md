Updated: 2019-08-15

如果希望通过 Webhook 触发 multibranch pipeline 项目需要安装 [multibranch-scan-webhook-trigger-plugin](https://github.com/jenkinsci/multibranch-scan-webhook-trigger-plugin) 插件
安装完之后，配置界面多出一个 Scan by webhook 选项
>  ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-e92092542fbe64a6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

实际中一个项目的代码仓库可能会有很多分支，比如develop，master等。Jenkins 支持创建多分支pipeline的任务。

#### 创建多分支项目

新建 "Item" 直接选择 "Multibranch Pipeline" 即可
Tab中有很多配置项，比如 General，Branch Sources，Build Configuration等

* Scan Multibranch Pipeline Triggers  触发 扫描分支频率，最低是1分钟
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-70b55405bde1054a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

* Orphaned Item 孤儿任务，所谓孤儿任务即代码仓库中该分支被删除，但是Jenkins分支中还保留着。

> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-02395b9767e6ad5d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-a5c114379d09880c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

* Health metric  健康指标
我也不清楚有什么用，望指教

::: warning
配置完成后，Jenkins就会自动执行首次构建，首先扫描所有的分支，如果根据配置的路径去找Jenkinsfile，找到后就立即执行。
:::

根据发现的分支数量，比如这里3个就自动创建了3个pipeline项目，点进去后可以像pipeline任务一样进行详细配置。
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-300c5c35bc88c3f8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


#### 使用 when 指令判断多分支

我们需要判断针对不同分支做不同事情，使用 if else 比较low，不够优雅

```groovy
stage("deploy to test") {
  steps {
      script {
          if (env.GIT_NAME == 'testing') {
            echo 'deploy to test'
          }
     }
   }
}
```

可以使用 when 指令
```groovy
stage("deploy to test") {
  when {
    branch 'testing'
   }
    steps {
      echo 'deploy to test'
    }
}

stage("deploy to prod") {
  when {
    branch 'production'
  }
   steps {
      echo 'deploy to prod'
   }
}
```

#### when指令的用法

when指令允许pipeline根据给定的条件，决定是否执行阶段内的步骤。when指令必须至少包含一个条件。when指令除了支持branch判断条件，还支持多种判断条件。
* changelog：如果版本控制库的changelog符合正则表达式，则执行
* changeset：如果版本控制库的变更集合中包含一个或多个文件符合给定的Ant风格路径表达式，则执行
```groovy
when {
  changeset "**/*.js"
}
```
* environment：如果环境变量的值与给定的值相同，则执行
```groovy
when {
  environment name: 'DEPLOY_TO', value: 'production'
}
```
* equals：如果期望值与给定的值相同，则执行
```groovy
when {
  equals expected: 2, actual: currentBuild.number
}
```
* expression：如果Groovy表达式返回的是true,则执行
当表达式返回的是字符串时，它必须转换成布尔类型或null;否则，所有的字符串都被当作true处理。
```groovy
when {
  expression {
    return env.BRANCH_NAME != 'master'
  }
}
```
* building Tag：如果pipeline所执行的代码被打 了tag,则执行
* tag：如果pipeline所执行的代码被打了tag,且tag名称符合规则，则执行
如果tag的参数为空，即tag ()，则表示不论tag名称是什么都执行，与buildingTag的效果相同。
```groovy
when {
  tag "release-*"
}
```

tag 条件支持comparator参数，支持的值如下：
-- EQUALS：简单的文本比较。
```groovy
when {
  tag "release-3.1", comparator: "EQUALS"
}
```
-- GLOB (默认值)：Ant风格路径表达式。由于是默认值，所以使用时一般省略。完整写法如下:
```groovy
when {
  tag "release-*", comparator: "GLOB"
}
```
-- REGEXP：正则表达式。使用方法如下:
```groovy
when {
  tag "release-\\d+", comparator: "REGEXP"
}
```
> tag条件块非常适合根据tag进行发布的发布模式。

以上介绍的都是单条件判断，when指令还可以进行多条件组合判断。

* allOf：所有条件都必须符合。下例表示当分支为master且环境变量DEPLOY TO的值为production时，才符合条件。
```groovy
allOf {
  branch "master";
  environment name: 'DEPLOY_TO', value: 'production'
}
```
注意，多条件之间使用分号分隔。
* anyOf：其中一个条件为true, 就符合。下例表示master分支或staging分支都符合条件。
```groovy
anyOf {
  branch "master";
  branch "staging";
}
```

#### Generic Webhook Trigger 插件在多分支pipeline场景下的应用
Generic Webhook Trigger 在之前已经介绍过，可以这么传参
```groovy
    triggers {
        GenericTrigger(
            genericVariables: [
              [key: 'ref', value: '$. ref']
            ],
            token: env.JOB_NAME ,
            regexpFilterText: '$ref',
            regexpFilterExpression: 'refs/heads/' + env.BRANCH_NAME,
        )
    }
```
env.BRANCH_NAME 为当前 pipeline 的分支名
#### 问题

Multibranch Pipeline Events 的作用是什么

![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-d174a685122cfa4c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


#### 参考
[converting-conditional-to-pipeline/](https://jenkins.io/blog/2017/01/19/converting-conditional-to-pipeline/)
