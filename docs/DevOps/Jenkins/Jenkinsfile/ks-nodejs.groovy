pipeline {
  agent {
    node {
      label 'nodejs'
    }
  }
  environment {
    NAMESPACE = 'zed-iot' //镜像的命名空间，可填组织名和个人名
    PROJECT = 'nodejs-demo' //镜像的项目名称，一般可与代码仓库名同名
    REGISTRY = 'shinetechzz.tpddns.cn:30002' //镜像的仓库地址
    ARTIFACT_IMAGE = "${REGISTRY}/${NAMESPACE}/${PROJECT}"
    DOCKER_CREDENTIAL_ID = 'harbor-admin' //镜像地址的登录凭证
    GIT_REPO = 'git@gitlab.osvie.com:kubesphere-pipline/nodejs.git' //私有代码仓库地址
    GIT_CREDENTIALS_ID = 'gitlab-id' //私有代码仓库凭证
    GIT_BRANCH_NAME = 'master' //拉取的代码分支
    KUBECONFIG_CREDENTIAL_ID = 'finley-test-kubeconfig'
  }
  stages {
    stage('打印当前环境变量') {
      steps {
        script {
          sh "printenv"
        }
      }
    }

    stage('检查工具') {
      steps {
        container('nodejs') {
          sh 'yarn -v'
          sh 'node -v'
          sh 'npm -v'
          sh 'docker version'
          sh 'docker images'
        }
      }
    }

    stage('检出代码') {
      steps {
        checkout(scm)
        // git branch: GIT_BRANCH_NAME, credentialsId: GIT_CREDENTIALS_ID, url: '${GIT_REPO}'
      }
    }

    stage('打包镜像') {
      steps {
        container('nodejs') {
          sh 'docker build -f Dockerfile -t $ARTIFACT_IMAGE:$GIT_BRANCH_NAME-$BUILD_NUMBER .'
        }
      }
    }

    stage('推送到镜像仓库') {
      agent none
      steps {
        container('nodejs') {
          withCredentials([usernamePassword(passwordVariable : 'DOCKER_PASSWORD',usernameVariable : 'DOCKER_USERNAME',credentialsId : "$DOCKER_CREDENTIAL_ID" ,)]) {
            sh 'echo "$DOCKER_PASSWORD" | docker login $REGISTRY -u "$DOCKER_USERNAME" --password-stdin'
            sh 'docker push $ARTIFACT_IMAGE:$GIT_BRANCH_NAME-$BUILD_NUMBER'
          }
        }
      }
    }

    stage('部署到k8s') {
      when {
        branch 'master'
      }
      steps {
        input(id: 'deploy-to-k8s', message: '确认部署到k8s?')
        kubernetesDeploy(configs: 'deploy/dev/**', enableConfigSubstitution: true, kubeconfigId: "$KUBECONFIG_CREDENTIAL_ID")
      }
    }

    stage('清理工作目录') {
      steps {
        cleanWs()
      }
    }
  }
}
