```groovy
#!groovy
import hudson.model.*;
 
println env.JOB_NAME
println env.BUILD_NUMBER
 
pipeline{
	
	agent any
	stages{
		stage("Check file download") {
			steps {
				script {
					try{
                        // 第二种写法
                        // 把linux执行打印结果存在一个字符串中，通过字符串包含的方法去判断文件是否存在
                        // out = sh(script: "ls /tmp/test ", returnStdout: true).toString().trim()
					    out = sh(script: "[ -f /tmp/test1/Python-3.7.1.tgz ]  && echo 'true' || echo 'false' ", returnStdout: true)
					    println out
                        // if(out.contains("Python-3.7.1.tgz")) {
					    if(out == "true") {
						    println "file download successfully."
					    } else {
                            // 进入异常            
							sh("exit 1")
						}
					} catch(Exception e) {
						println e
						error("fond error during check file download.")
					}
				}
			}
		}
	}
}
```


## 参考
https://blog.csdn.net/u011541946/article/details/84945882
