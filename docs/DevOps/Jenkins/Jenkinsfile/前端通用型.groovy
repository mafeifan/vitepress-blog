pipeline {
    agent {
       docker {
          // 该镜像占用空间小, 适合大部分项目
          // npm install 如果失败，可能是镜像缺乏基本类库，比如C,尝试更换image，比如 https://hub.docker.com/r/circleci/node
          // vue3 vite项目请用其他基于Ubuntu的image比如 'circleci/node:14.17.5-bullseye'
          image 'tarampampam/node:lts-alpine'
       }
    }
    options {
        timeout(time: 15, unit: 'MINUTES')
    }
    // 避免 npm install 报权限问题
    environment {
        HOME = '.'
        // git仓库拉取凭据，请到Jenkins(Jenkins地址/credentials/store/system/domain/_/newCredentials)后台添加,ID填写在下方
        GIT_CRE_ID = 'your-github-private-key'
        // git分支
        GIT_BRANCH = 'develop'
        // git仓库地址
        GIT_URL = 'git@github.com:username/repo-name.git'
        // 服务器SSH访问配置，用于连接服务器并上传构建好的文件，Jenkins需要安装Publish over SSH插件，并到/configure添加服务器连接配置，将配置项的name填到下方
        SSH_PUBLISH_CONFIG_NAME = 'ref-test'
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: "${env.GIT_BRANCH}", credentialsId: "${env.GIT_CRE_ID}", url: "${env.GIT_URL}"
            }
        }
        stage('Check Node Version') {
            steps {
                // 打印当前所有变量
                sh "printenv"
                sh 'node -v'
                sh 'npm -v'
            }
        }
        stage('Node modules') {
            steps {
                sh 'npm install'
            }
        }

       // stage('Code Lint') {
        //     steps {
        //         sh 'npm run lint'
        //     }
        // }

        // stage('Test') {
        //     steps {
        //         echo 'jump this step'
        //         // sh 'npm run ci-test'
        //     }
        // }

        stage('Build') {
            options {
                timeout(time: 9, unit: 'MINUTES')
            }
            steps {
                sh 'npm run build'
            }
        }

        stage('Tar') {
            steps {
                sh 'tar -zcvf dist.gz dist'
            }
        }

        stage ('check build') {
            steps {
               script {
                    println pwd()
                    if (fileExists("dist.gz") == true) {
                       echo("dist.gz file is exists")
                    } else {
                       error("here haven't find dist.gz file")
                    }
               }
            }
        }

        stage('deploy') {
            steps {
               sshPublisher(publishers: [sshPublisherDesc(
                   configName: "${env.SSH_PUBLISH_CONFIG_NAME}",
                   transfers: [sshTransfer(
                       cleanRemote: false,
                       excludes: '',
                       execCommand: '''
# sh deploy.sh
DEST_PATH=/data/www/clients/client2/web108/web/
TODAY=$(date +%Y%m%d-%H%M%S)

cp -rf dist.gz $DEST_PATH
cd $DEST_PATH
tar -zcvf $TODAY-dist.gz dist
rm -rf dist
tar -xzvf dist.gz
''',
                       execTimeout: 120000,
                       flatten: false,
                       makeEmptyDirs: false,
                       noDefaultExcludes: false,
                       patternSeparator: '[, ]+',
                       remoteDirectory: '',
                       remoteDirectorySDF: false,
                       removePrefix: '',
                       sourceFiles: 'dist.gz')],
                    usePromotionTimestamp: false,
                    useWorkspaceInPromotion: false,
                    verbose: false)])
            }
        }
    }


    post {
        always {
           script{
               if (["ABORTED", "FAILURE", "UNSTABLE"].contains(currentBuild.currentResult) ){
                 slackSend channel: "#ref-app", message: "Build failure: ${env.JOB_NAME} -- No: ${env.BUILD_NUMBER}, please check detail in email!"
               } else {
                 slackSend channel: "#ref-app", message: "Build Success: ${env.JOB_NAME} -- Build No: ${env.BUILD_NUMBER}, please check on http://35.244.74.35/"
               }
           }
       }
    }
}
