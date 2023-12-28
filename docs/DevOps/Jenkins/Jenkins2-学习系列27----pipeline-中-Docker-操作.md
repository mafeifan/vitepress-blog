#### 构建任务在指定Docker镜像中进行
如下面例子，首先pull一个我打包好的基于ubuntu的node镜像，这个镜像里面已经包含了nodejs10, wget, zip, curl, python，chrome，firefox, aws-cli 等常用工具，可以方便的在里面执行npm install，npm run test 启动浏览器跑测试等。
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

####  pipeline 中操作镜像
需要安装 Jenkins docker workflow 插件, 
下面的例子展示了：
* 连接远程Docker主机
* 登录私有Docker 仓库(阿里云镜像服务)
* 根据代码中的 Dockerfile 构建镜像并push
* 删除Docker远程主机中构建好的镜像，不占用空间
* 不包含目标主机中部署镜像
其实就说上篇文章中的pipeline版本
```groovy
#!groovy

pipeline {
    agent any
    
    environment {
        // PATH="/bin:/sbin:/usr/bin:/usr/sbin:/usr/local/bin"
        _docker_remote_server='tcp://192.100.155.155:2375'
        _aliyun_registry='https://registry.cn-zhangjiakou.aliyuncs.com'
    }

    stages {
        stage('debug')  {
            steps {
                script {
                    sh "printenv"
                }
            }
        }

        stage('connect remote docker') {
            steps {
                // 注意 代码是先拉到了Jenkins主机上，但是构建镜像在Docker远程
                git 'https://github.com/mafeifan/docker-express-demo.git'

                script {
                    docker.withServer("${env._docker_remote_server}") {
                         // 第一个参数是私有仓库地址，注意要带http(s)，第二个参数是账号密码登录凭证，需要提前创建
                        docker.withRegistry("${env._aliyun_registry}", 'aliyun-docker-registry') {
                            // 使用 ${GIT_PREVIOUS_COMMIT} 取不到 commint_id
                            // https://stackoverflow.com/questions/35554983/git-variables-in-jenkins-workflow-plugin
                            git_commit = sh(returnStdout: true, script: "git rev-parse HEAD").trim()
                            echo git_commit
                            def customImage = docker.build("fineyma/node-demo:${env.BUILD_NUMBER}-${git_commit}")
                            /* Push the container to the custom Registry */
                            customImage.push()
                            // 可以优化，用匹配搜索并删除
                            sh "docker rmi fineyma/node-demo:${env.BUILD_NUMBER}-${git_commit}"
                        }
                    }
                }

                // clean workspace
                cleanWs()
            }
        }
    }
}
```

> 这里 customImage.push() 貌似有个bug，构建之后的镜像有两个一样的，一个带registry name一个不带

> 关于 docker.build,  docker.withRegistry 等是Jenkins docker workflow 插件提供的, 可以看[源码](https://github.com/jenkinsci/docker-workflow-plugin/blob/master/src/main/resources/org/jenkinsci/plugins/docker/workflow/Docker.groovy)，其实是封装了docker build, docker login，你完全可以写原生的docker 命令

#### 关于远程容器部署
既然镜像已经成功上传到阿里云的镜像服务，理论上任何装有Docker的主机只要docker run就可以完成部署了(需要网络通)。
实现方法我想到有几种：
1. 阿里云的镜像服务提供触发器，即每当push新的镜像上去，可以发送一个post请求到配置的地址，这样可以完成容器部署操作。Jenkins可以添加一个job，暴露一个触发地址给阿里云镜像服务的触发器。
2. 在pipeline中添加ssh登录目标主机，然后添加 `docker run --rm fineyma/node-demo:${env.BUILD_NUMBER}-${git_commit}` step 步骤
3. 目标主机也开放dockerd，这样连登录都不需要了，直接docker client 操作远程Docker完成部署。

#### 参考
https://jenkins.io/doc/pipeline/steps/docker-workflow

https://www.jenkins.io/doc/book/pipeline/docker/
