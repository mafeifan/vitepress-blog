#### agent label 标签

当agnet数量变多时，如何区分这些agnet有哪些特点呢？比如哪些环境是node10，哪些是JDK8，为了区分，我们可以给不同的agent打标签(也叫tag)。一个agent可以拥有多个标签，为避免冲突，标签名不能包含空格，!&<>()|等这些特殊符号。打标签时可以考虑以下维度：
工具链： jdk, node, php 语言或工具的版本
操作系统：linux, windows, osx
系统位数: 32bit, 64bit

定义好标签后，可以在pipeline中指定他了，你可能见过
```groovy
pipeline {
   agent any
}
```
agent any 告诉 Jenkins master 任意可用的agent都可以执行
> agent 必须放在pipeline的顶层定义或stage中可选定义，放在stage中就是不同阶段使用不同的agent

通过标签指定 agent，比如某项目需要在JDK8中环境中构建
```groovy
pipeline {
  agent {
    label 'jdk8'
  }
  stages {
     stage ('build') {
         steps {
            echo 'build'
         }
     }
  }
}
```
实际上`  agent {
    label 'jdk8'
  }`是 `agent {
    node {
       label 'jdk8'
    } 
  } ` 的简写。

####  label 支持过滤多标签
```groovy
agent {
  label 'windows && jdk8'
}
```
node 除了 label 选项，还支持自定义工作目录
```groovy
agent {
  node {
    label 'jdk8'
    customWorkspace '/var/lib/custom'
  }
}
```
####  不分配 agent
`agent none` ，这样可以在具体的stages中定义

agent：指定流水线的执行位置，流水线中的每个阶段都必须在某个地方（物理机，虚拟机或 Docker 容器）执行，agent 部分即指定具体在哪里执行。

#### 指定在Docker镜像中运行
如下面例子，首先pull一个我打包好的docker镜像，这个镜像里面已经包含了nodejs10，npm和浏览器，可以方便的在里面执行npm install， npm test 跑测试等。
```groovy
pipeline {
  agent {
    docker {
       image 'finleyma/circleci-nodejs-browser-awscli'
    }
  }
  stage('Checkout') {
       steps {
          git branch: 'develop', credentialsId: 'github-private-key', url: 'git@github.com:your-name/angular-web.git'
     }
  }
  stage('Node modules') {
     steps {
        sh 'npm install'
     }
   }
  stage('Code Lint') {
     steps {
        sh 'npm run lint'
     }
  }
  stage('Unit Test') {
    steps {
      sh 'npm run test'
    }
  }
  // .... build, delpoy
}
```
#### when 指令中的 beforeAgent 选项
```groovy
pipeline {
   agent none
   stages {
     stage ('example build')  {
        steps {
           echo 'hello world'
        }
     }
     stage ('example deploy') {
       agent {
          label 'some-label'
       }
       when {
          beforeAgent true
          branch 'production' 
       }
       steps {
          echo  'deploying'
       }
     }
   }
}
```
只有当分支为 production时，才会进入 'example deploy' 阶段，这样避免了agent中拉取代码，从而达到加速pipeline执行的目的。


#### 参考
[https://www.jianshu.com/p/1ee7a828e2c2](https://www.jianshu.com/p/1ee7a828e2c2)


