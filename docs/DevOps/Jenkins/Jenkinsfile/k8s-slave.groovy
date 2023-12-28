//在Declarative Pipeline模式的代码中，可能会在一个stages{…}中声明一窜嵌套的stages{…}, 并以顺序执行。
//需要指出的是，一个stage{…}必须有且只有一个steps{…}, 或者parallel{…} 或者stages{…}
//依赖插件：[Utility Steps] [kubernetes] [pipeline] [build-user-vars-plugin] [HTTP Request] [build vars user]

import hudson.model.*;

// 公共
def registry = "d-harbor.xxx.cn"

// 项目
def project = "manage-support"
def APP_NAME = "gateway"
def image_name = ""

//认证
def SECRET_NAME = "d-harbor"
def harbor_auth="bd700edc-3a35-477c-90f8-35b3c42af2e3"

def gitlab_auth="811eda1c-e3d4-43aa-991a-bb943d5b1c33"
def gitlab_url="ssh://git@gitlab.xxx.com:22/support/gateway.git"

def k8s_auth = "21bcfbf0-78de-476e-8832-16204f01dfb6"
def company_maven = "b93a4cef-01df-4e05-a5ee-65e39fbdcd2a"
def aliyun_maven = "8e47a867-9431-4459-a6fd-8d426f8c3d6d"
def HTTP_HOST=""
def TG_PORT="9999"
def URI="/gateway"
def ENV=""
def INPUT_JSON="/tmp/service.json"

//pipeline start
pipeline {
    agent {
        kubernetes {
            label "jenkins-slave"
            yaml '''
apiVersion: v1
kind: Pod
metadata:
  name: jenkins-slave
spec:
  containers:
  - name: jnlp
    image: "d-harbor.xxx.cn/public/jenkinslave:java"
    imagePullPolicy: Always
    volumeMounts:
      - name: docker-cmd
        mountPath: /usr/bin/docker
      - name: docker-sock
        mountPath: /var/run/docker.sock
      - name: maven-cache
        mountPath: /root/.m2
  volumes:
      - name: docker-cmd
        hostPath:
          path: /usr/bin/docker
      - name: docker-sock
        hostPath:
          path: /var/run/docker.sock
      - name: maven-cache
        hostPath:
          path: /root/.m2
'''
        }
    }

   parameters {
        gitParameter branch: '', branchFilter: '.*', defaultValue: 'master', description: 'select branch', name: 'Branch', quickFilterEnabled: false, selectedValue: 'NONE', sortMode: 'NONE', tagFilter: '*', type: 'PT_BRANCH'
        choice (choices: ['3', '5', '7'], name: 'REPLICAS')
        choice (choices: ['tech-center-mgt'], name: 'Namespace')
    }

//stages start
    stages {
        stage('Inner_Env'){
          steps{
            sh 'printenv'
          }
        }

        // service.json是一个字典, 存放了项目和域名的映射关系，后期可以扩展
        stage("Get_Svc_Json"){
          steps{
             sh """ curl -s https://software.xxx.cn/k8s/service.json -o ${INPUT_JSON} """
          }
        }

        stage('InitEnv_and_PullCode') {
            steps {
              script {
                 echo "${jk_host}"
                //根据jenkins域名选择环境信息
                if ("${jk_host}" == ""){
                  error('未发现环境变量：jk_host，请配置全局环境变量')
                }
                else if ("${jk_host}" == "d-jenkins.xxx.cn") {
                  // 测试环境
                  ENV="test"
                  image_name = "${registry}/${project}/${APP_NAME}:${ENV}-${env.BUILD_NUMBER}"
                  //解析字典文件，根据环境变量选择域名
                  println "read json file"
                  json_file = INPUT_JSON? INPUT_JSON.trim() : ""
                  prop = readJSON file : json_file
                  key = "${APP_NAME}" + "-" + "${ENV}"
                  HTTP_HOST = prop."${key}" ? prop."${key}".trim() : ""
                  println "HTTP_HOST: " + HTTP_HOST
                }
                else if ("${jk_host}" == "jk-k8s.xxx.cn") {
                  // 生产环境
                  ENV="prod"
                  image_name = "${registry}/${project}/${APP_NAME}:${ENV}-${env.BUILD_NUMBER}"
                  //解析字典文件，根据环境变量选择域名
                  println "read json file"
                  json_file = INPUT_JSON? INPUT_JSON.trim() : ""
                  prop = readJSON file : json_file
                  key = "${APP_NAME}" + "-" + "${ENV}"
                  HTTP_HOST = prop."${key}" ? prop."${key}".trim() : ""
                  println "HTTP_HOST: " + HTTP_HOST
                }
                else {
                  // 未知环境
                  error('未知jenkins')
                }

                // 生产环境prod，拉取master分支；测试环境test，拉取test分支
                if ("$ENV" == "") {
                  error('第一次构建，未发现环境变量：ENV，请再次执行')
                }
                else if ( "$ENV" == "test" ) {
                  checkout([$class: 'GitSCM', branches: [[name: "*/${ENV}"]], extensions: [], userRemoteConfigs:[[credentialsId: "${gitlab_auth}", url: "${gitlab_url}"]]])
                }
                else if ( "$ENV" == "prod" ){
                  checkout([$class: 'GitSCM', branches: [[name: "*/master"]], extensions: [], userRemoteConfigs: [[credentialsId: "${gitlab_auth}", url: "${gitlab_url}"]]])
                }
                else {
                  error('环境变量错误')
                }
              }
            }
        }

        //构建和重命名jar包
        stage('Build_Code') {
          steps{
            configFileProvider([configFile(fileId: "${company_maven}", targetLocation: "company_maven.xml")]){
                sh """
                    /bin/mvn -U clean install  --settings company_maven.xml -Dmaven.test.skip=true -P ${ENV} -am -T4
                    find ./target -maxdepth 1 -type f  -name "*.jar" | xargs -I '{}' mv '{}' ./target/app.jar

                """
             }
          }
        }


        stage('Build_Image') {
          steps{
            withCredentials([usernamePassword(credentialsId: "${harbor_auth}", passwordVariable: 'password', usernameVariable: 'username')]) {
                sh """
                  sed -i 's#@ENV#${ENV}#'  entrypoint.sh
                  sed -i 's#TG_PORT#${TG_PORT}#' Dockerfile
                  sed -i 's#TG_PORT#${TG_PORT}#' deploy.yaml
                  docker build -t ${image_name} -f Dockerfile .
                  docker login -u ${username} -p '${password}' ${registry}
                  docker push ${image_name}
                """
            }
          }
        }

        stage('Change_ConfigFile') {
          steps {
            configFileProvider([configFile(fileId: "${k8s_auth}", targetLocation: "admin.kubeconfig")]){
                sh """
                  sed -i 's#IMAGE_NAME#${image_name}#' deploy.yaml
                  sed -i 's#SECRET_NAME#${SECRET_NAME}# 'deploy.yaml
                  sed -i 's#REPLICAS#${REPLICAS}#' deploy.yaml
                  sed -i 's#APP_ANME#${APP_NAME}#' deploy.yaml
                  sed -i 's#HTTP_HOST#${HTTP_HOST}#' deploy.yaml
                  sed -i 's#TG_PORT#${TG_PORT}#' deploy.yaml
                  sed -i 's#URI#${URI}#' deploy.yaml
                """
            }
          }
        }

        stage('Deploy2K8s') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                script {
                    env.select = input message: 'deploy', ok: 'deploy',
                        parameters: [choice(name: 'select', choices: ['yes', 'no'], description: '')]

                        switch("${env.select}"){
                            case 'yes':
                                println('start deploy')
                                sh """ kubectl apply -f  deploy.yaml -n ${Namespace}  --kubeconfig=admin.kubeconfig """
                                break;

                            case 'no':
                                println('abort');
                                break;

                            default:
                                println('wrong choice')

                        }
                    }
                }
            }
        }


//stages end
    }

//push message
// http请求和解析https://www.lfhacks.com/tech/jenkins-httprequest/

    post {
        always {
           script{
              build_status=currentBuild.currentResult
              def BUILD_USER="null"
              wrap([$class: 'BuildUser']) {
                   BUILD_USER = "${env.BUILD_USER}"
                }

              // application/json
              //def requestBody = ["build_status":"${build_status}", "jenkins_url":"{jenkins_url}", "build_user":"{build_user}", "job_name":"${job_name}" ]

              //application/x-www-form-urlencoded
              def response = httpRequest \
              contentType: 'APPLICATION_FORM',
              url:"https://jkwebhook.xxx.cn/wk_wechat",
              httpMode: "POST",
              requestBody: "build_status=${build_status}&jenkins_url=${env.BUILD_URL}/console&build_user=${BUILD_USER}&job_name=${env.JOB_NAME}"
              ignoreSslErrors: true

           }
       }
    }






//pipeline end
}

