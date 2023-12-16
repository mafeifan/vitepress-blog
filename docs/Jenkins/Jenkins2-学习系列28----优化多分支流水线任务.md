Multibranch Pipeline Job 应该是最常见的了。非常适用于一个项目中，不同分支对于不同构建任务。

之前的做法：项目代码的每个分支有维护单独的Jenkinsfile，这样不但麻烦而且冗余。

我们知道pipeline流水线由若干个stage阶段组成，其实stage中支持写when指令，即根据条件执行这个stage。

when 支持的条件有 branch, environment, express, not, anyOf, allOf 
具体使用可参见[官方文档](https://jenkins.io/zh/doc/book/pipeline/syntax/#when)

下面是个使用`when`选项优化后的`Jenkinsfile`，所有分支使用一份Jenkinsfile即可：

有几点细节说下：
1. `changset`  是提交中的变更的文件列表，这里项目中即包含后台PHP代码也包含前端的 JS 和 CSS文件，只有当提交中包含了JS或CSS文件才触发`npm run build`，加速构建，因为如果提交了 PHP 文件，没有必要构建前端资源
```groovy
 when {
   anyOf {
      // 是 ant 路径写法
      changeset "**/*.js"
      changeset "**/*.css"
    }
 }
```
2. 如果两次push代码间隔很短，有可能造成同时出现多个的`npm run build`，为避免这种情况加上了`disableConcurrentBuilds()`

3. 通过使用when, 只有往master分支提交代码才触发邮件step，post指令也可以写在stage中

4. 默认情况下，stage内的所有代码都将在指定的Jenkins agent上执行，when指令提供 beforeAgent选项，当他的值为true时，只有符合when条件时才会进入该Jenkins agent，这样就避免的没有必要的工作空间的分配
```groovy
// https://jenkins.io/zh/doc/book/pipeline/syntax

pipeline {
    agent {
        // 在Docker容器里跑Job，跑完Jenkins会自动删除容器
        docker {
            image 'node:8.15.0-alpine'
        }
    }
    // 避免 npm install 报权限问题
    environment {
        HOME = '.'
        _EMAIL_TO='mafeifan@qq.com'
    }
    options {
        // 不允许同时执行流水线, 防止同时访问共享资源等
        disableConcurrentBuilds()
        // 显示具体的构建流程时间戳
        timestamps()
    }
    stages {
        // 只有修改 JS 或 CSS 资源文件才触发 Build 步骤
        stage('Build') {
            when {
                anyOf {
                    changeset "**/*.js"
                    changeset "**/*.css"
                }
            }
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }
        // 只有触发 Master 分支才发邮件
        stage('Master') {
            when {
                beforeAgent true
                branch 'master'
            }
            steps {
                echo 'master branch'
            }
            post {
                always {
                    configFileProvider([configFile(fileId: 'email-groovy-template-cn', targetLocation: 'email.html', variable: 'content')]) {
                       script {
                           template = readFile encoding: 'UTF-8', file: "${content}"
                           emailext(
                               to: "${env._EMAIL_TO}",
                               subject: "Job [${env.JOB_NAME}] - Status: ${currentBuild.result?: 'success'}",
                               body: """${template}"""
                           )
                       }
                    }
                }
            }
        }
        stage('Staging') {
            when {
                beforeAgent true
                branch 'staging'
            }
            steps {
                echo 'This is staging branch'
            }
        }
        stage('Develop') {
            when {
                beforeAgent true
                branch 'develop'
            }
            steps {
                echo 'This is develop branch'
            }
        }
    }
}

```
