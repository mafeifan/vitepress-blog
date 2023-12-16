/**
Date: '2021-10-13'
Author: mafei7776@gmail.com
Description: 优化docker pipeline
*/
pipeline {
  agent any
  environment {
    NAMESPACE      = "fineyma"
    PROJECT        = "express-demo"
    ARTIFACT_BASE  = "registry.cn-hangzhou.aliyuncs.com"
    ARTIFACT_IMAGE = "${ARTIFACT_BASE}/${NAMESPACE}/${PROJECT}"
  }
  stages {
    stage('debug')  {
        steps {
            script {
                sh "printenv"
            }
        }
    }

    stage('检出') {
      steps {
        git 'https://gitee.com/finley/docker-express-demo'
      }
    }
    stage('打包镜像') {
      steps {
        script {
            shortCommitId = sh(returnStdout: true, script: "git rev-parse HEAD").trim()
            env.LAST_COMMIT_ID = shortCommitId
            myapp = docker.build("${ARTIFACT_IMAGE}:${env.LAST_COMMIT_ID}")
        }
        // echo env.LAST_COMMIT_ID;
        // sh "docker build -t ${ARTIFACT_IMAGE}:${env.LAST_COMMIT_ID} ."
        // sh "docker tag ${ARTIFACT_IMAGE}:${env.LAST_COMMIT_ID} ${ARTIFACT_IMAGE}:latest"
      }
    }
    stage('推送到制品库') {
      steps {
        script {
            docker.withRegistry("https://${ARTIFACT_BASE}", "aliyun-docker-registry") {
              myapp.push("${env.LAST_COMMIT_ID}")
              myapp.push("${env.BUILD_ID}")
              // docker.image("${ARTIFACT_IMAGE}:latest").push()
            }
        }
      }
    }
    stage('clear') {
        steps {
            // clean workspace
            cleanWs()
        }
    }
  }
}
