@Library('global-shared-library@master') _

def createVersion() {
    return new Date().format('yyyyMM') + "-${env.BUILD_NUMBER}"
}

pipeline {
    agent any

    environment {
       _version = createVersion()
       email_to='maf@shinetechchina.com'
    }

    parameters {
        choice(
            description: '选择通知方式：当前支持slack, 钉钉, 邮件',
            choices: '钉钉\nSlack\n邮件',
            name: 'p_notify',
        )
    }

    stages {
        stage ('build') {
            steps {
                script {
                    def util = new com.mafeifan.Utils()
                    def version = util.createVersion("${BUILD_NUMBER}")
                    echo "${version}"
                    sayHello 'yes'
                    echo "${_version}"
                }
            }
        }
    }

    post {
        always {
            script{
                if (params.p_notify == '钉钉') {
                    dingtalk (
                        robot: 'cages',
                        type: 'LINK',
                        title: "${currentBuild.result?: 'success'}",
                        text: [
                            '测试消息',
                            "${env.LAST_COMMIT_MSG}"
                        ],
                        messageUrl: "${env.BUILD_URL}console",
                        picUrl: 'https://mafeifan.pek3b.qingstor.com/Jenkins/icon/icon-error.jpeg'
                    )
                }
                else if (params.p_notify == 'Slack') {
                    slackSend channel: "#personal", message: "Job [${env.JOB_NAME}] Status: ${currentBuild.result?: 'success'} -- Build No: ${env.BUILD_NUMBER}"
                }
                else if (params.p_notify == '邮件') {
                    // 拉取定义好的配置文件
                    // /configfiles/editConfig?id=email-template
                    configFileProvider([configFile(fileId: 'email-template', targetLocation: 'email.html', variable: 'content')]) {
                        script {
                            template = readFile encoding: 'UTF-8', file: "${content}"
                            emailext(
                                to: "${email_to}",
                                subject: "Job [${env.JOB_NAME}] - Status: ${currentBuild.result?: 'success'}",
                                body: """${template}"""
                            )
                        }
                    }
                }
            }
       }
    }
}

