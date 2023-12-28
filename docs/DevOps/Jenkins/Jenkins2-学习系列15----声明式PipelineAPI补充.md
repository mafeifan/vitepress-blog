如果需要在pipeline中进行逻辑判断或者写Groovy脚本代码，需要写在script步骤中
请看如下例子：
```groovy
pipeline {
  agent any
  stages {
     stage('example')  {
        steps {
          script {
            def browsers = ['chrome', 'firefox']
            for (int i = 0; i < browsers.size(); i ++) {
               echo "testing ${browsers[i]}"
            }
          }
        }
     }
  }
}
```
绝大多数时候没有必要写script，建议都提取到不同的stage或使用共享库
pipeline内置了一些step
文件相关的有`deleteDir`, `dir`, `fileExists`, `isUnix`, `pwd`, `writeFile`,`readFile`
```groovy
steps {
   script {
       println pwd()
       json_file = "${env.WORKSPACE}/testdata/test_json.json"
       if (fileExists(json_file) == true && isUnix()) {
         echo("json file is exists")
       } else {
         error("here haven't find json file")
       }

       dir ("/var/logs") {
          deleteDir()
       }
   }    
}
```
命令相关的有
* `error` 主动报错，中止pipeline `error('there is an error')`
* `sh` 执行shell命令
支持参数有script（必填，shell脚本），encoding（执行后输出日志的编码），returnStatus（布尔类型，默认返回的是状态码，如果是一个非0的状态码，则会引发pipeline执行失败。
如果returnStatus参数为true，则无论状态码是什么，pipeline的执行不受影响），returnStdout（布尔类型，如果为true，则任务的标准输出将作为步骤的返回值，而不是打印到构建日志中）
> returnStatus 和 returnStdout 参数一般不会同时使用，因为返回值只能有一个，如果同时存在则只有returnStatus生效
* `bat` 和 `powershell` 在Windows系统上执行的批处理

其他：
* `withEnv`: 设置环境变量
在代码块中设置环境变量，仅在该代码块中生效，注意下面例子中sh被包裹的是单引号，说明变量解析是由shell完成而不是Jenkins。
```groovy
  withEnv(['MYTOOL_HOME=/usr/local/mytool']) {
    sh '$MYTOOL_HOME/bin/start'
  }
```
* `timeout` : 代码块的超时时间
* `waitUnit`: 等待条件满足，不断重复waitUnit内的代码直到为true，最好和timeout结合使用，避免死循环
```groovy
timeout(50) {
   waitUnit {
      script {
          def r = sh script: 'curl http://example', returnStatus: true
          return (r == 0)
      }
   }
}
```
* `retry`: 重复代码块，如果某次执行抛出异常，则中止本次执行，不会中止整个retry执行
* `sleep`: 暂停指定时间再执行
```bash
echo "hello"
sleep(120) // 休眠120秒
sleep(time: '2', unit: 'HOURS') //单位有  NANOSECONDS, MICROSECONDS, MILLISECONDS, SECONDS, MINUTES, HOURS, DAYS
echo "hello again"
```
### 参考
[https://jenkins.io/doc/pipeline/steps/workflow-basic-steps/](https://jenkins.io/doc/pipeline/steps/workflow-basic-steps/)
