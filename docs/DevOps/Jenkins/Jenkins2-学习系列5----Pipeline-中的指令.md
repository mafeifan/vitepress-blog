### pipeline支持的指令
显然，基本结构满足不了现实多变的需求。所以，Jenkins pipeline通过各种指令(directive) 来丰富自己。指令可以被理解为对Jenkins pipeline基本结构的补充。

Jenkins pipeline支持的指令有:

* environment: 用于设置环境变量，可定义在stage或pipeline部分。
* tools: 可定义在pipeline或stage部分。它会自动下载并安装我们指定的工具，并将其加入PATH变量中。
* input: 定义在stage部分，会暂停 pipeline，提示你输入内容。
* options: 用于配置 Jenkins pipeline 本身的选项，比如 `options {retry (3) }`指当pipeline失败时再重试2次。options指令 可定义在stage或pipeline部分。
* parallel: 并行执行多个step。在pipeline插件 1.2版本后，parallel开始支 持对多个阶段进行并行执行。
* parameters: 与input不同，parameters是 执行pipeline前传入的一些参数。
* triggers: 用于定义执行pipeline的触发器。
* when: 当满足when定义的条件时，阶段才执行。

::: tip
parameters 和 when 的使用会在后面详情介绍

在使用指令时，需要注意的是每个指令都有自己的"作用域"。如果指令使用的位置不正确，Jenkins将会报错。
:::

options指令用于配置整个Jenkins pipeline本身的选项

例子
```groovy
pipeline {
    agent any
    options {
        timeout(time: 1, unit: 'HOURS') 
        disableConcurrentBuilds()
    }
    stages {
        stage('Example') {
            steps {
                echo 'Hello World'
            }
        }
    }
}
```
* 整个pipeline执行超过一个小时将中止
* 禁止pipeline同时执行，避免抢占资源或调用冲突

stage 的 options 指令类似于流水线根目录上的 options。

```groovy
pipeline {
    agent any
    stages {
        stage('Example') {
            options {
                timeout(time: 1, unit: 'HOURS') 
            }
            steps {
                echo 'Hello World'
            }
        }
    }
}
```
* 指定 Example 阶段的执行超时时间, 在此之后，Jenkins 将中止流水线运行。

options指令具体包含的参数比较多，不一一介绍了，见[文档](https://jenkins.io/zh/doc/book/pipeline/syntax/#options)

### 参考
[https://jenkins.io/zh/doc/book/pipeline/syntax/#options](https://jenkins.io/zh/doc/book/pipeline/syntax/#options)
