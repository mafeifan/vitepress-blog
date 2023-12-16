### post 钩子

post 步骤在Jenkins pipeline语法中是可选的，包含的是整个pipeline或阶段完成后一些附加的步骤。
比如我们希望整个pipeline执行完成之后或pipeline的某个stage执行成功后发生一封邮件，就可以使用post，可以理解为”钩子“。

根据 pipeline 或阶段的完成状态，post 部分分成多种条件块，包括：

* always：不论当前完成状态是什么，都执行。
* changed：只要当前完成状态与上一次完成状态不同就执行。
* fixed：上一次完成状态为失败或不稳定（unstable），当前完成状态为成功时执行。
* regression：上一次完成状态为成功，当前完成状态为失败、不稳定或中止（aborted）时执行。
* aborted：当前执行结果是中止状态时（一般为人为中止）执行。
* failure：当前完成状态为失败时执行。
* success：当前完成状态为成功时执行。
* unstable：当前完成状态为不稳定时执行。
* cleanup：清理条件块。不论当前完成状态是什么，在其他所有条件块执行完成后都执行。post部分可以同时包含多种条件块。

以下是 post 部分的完整示例:

```groovy
pipeline {
  agent any
  stages {
     stage('build') {
       steps {
         echo "build stage"
       } 
      post {
        always {
          echo 'stage post always'
        }
      }
     }
  }

  post {
    changed {
       echo 'pipeline post changed'
    }
    always {
       echo 'pipeline post always'
    }
    success {
       echo 'pipeline post success'
    }
    // 省略其他条件块
  }
}
```


技巧，分组判断多个状态:

```groovy
    post {
        always {
           script{
              if (currentBuild.currentResult == "ABORTED" || currentBuild.currentResult == "FAILURE" || currentBuild.currentResult == "UNSTABLE" ){
                 slackSend channel: "#机器人", message: "Build failure: ${env.JOB_NAME} -- No: ${env.BUILD_NUMBER}, please check detail in email!"
               } else {
                 slackSend channel: "#机器人", message: "Build Success: ${env.JOB_NAME} -- Build No: ${env.BUILD_NUMBER}, please check on http://www.yourwebsite.com"
               }
           }  
       }
    }
```
又因为script内可以直接写Groovy代码，上面的判断可以进一步优化
`["ABORTED", "FAILURE", "UNSTABLE"].contains(currentBuild.currentResult)`

### 参考
[https://jenkins.io/zh/doc/book/pipeline/syntax/#post](https://jenkins.io/zh/doc/book/pipeline/syntax/#post)
