#### 凭证 Credentials
凭证可以是一段字符串如密码，私钥文件等，是Jenkins进行受限操作时的凭据。比如SSH登录远程服务器，用户名，密码或SSH key就是凭证。这些凭据不要明文写在Jenkinsfile中，Jenkins有专门管理凭证的地方和插件。

#### 添加凭证
添加凭证步骤（需要有凭证权限，这里使用超级管理员身份）
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-1a7215e023c630cd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-815d7322790bb209.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-224bc365af22dddc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

参数：
* Kind | 凭证类型
* Scope | 凭证作用域，分Global，用于pipeline就选这个，System，用于Jenkins系统本身，如电子邮件身份验证，代理连接等。
* ID | 在pipeline中使用凭证的唯一标识 | 可以自己起，如果不填Jenkins会分配一个，必须唯一，而且创建后无法修改。建议自己起成容易识别的，比如 xxx-project-dingtalk-robot-token

关于Kind凭证类型，有如下几种：
* Username with password | 用户名和密码
* Docker Host Certificate Authentication
* SSH Username with private key | 一对SSH用户名和密钥
* Secret file | 需要保密的文本文件，使用时Jenkins会将文件复制到一个临时目录中，再将文件路径设置到一个变量中，等构件结束后，所复制的Secret file就会被删除。
* Secret text | 需要保存的一个保密的文本串，如钉钉机器人或Github的api token
* Certificate

添加凭证后，需要安装"Credentials Binding Plugin"插件，就可以在pipeline中使用withCredentials步骤使用凭证了。

#### pipeline中使用凭证

* withCredentials
```
// 通过 credentialsId 取出对应凭证，然后赋值给名为'my_dingtalk_token'(自己起)的变量
// 根据变量在其他step中使用
withCredentials([string(credentialsId: 'dingding-robot-token', variable: 'my_dingtalk_token')]) {
    // 注意：构建记录中只会输出 ****
    echo "${my_dingtalk_token}"
}
```


比如钉钉讨论组建立机器人后会提供给你webhook的地址`https://oapi.dingtalk.com/robot/send?access_token=123456789abcde`，将后面的access_token 存到 Secret text 中。

* credentials

如果觉得withCredentials比较麻烦，声明式pipeline还提供了 helper 方法，在environment中使用credentials('credentials-id')就可以方便取出。

> 注意：credentials 指令只能使用在 environment 段中，而且目前只支持Secret text，Username with password 和 Secret file 三种。
```groovy
#!groovy

pipeline {
    agent any
    environment {
        ding_robot_token = credentials('dingding-robot-token')
    }

    stages {
        stage('debug') {
            steps {
                sh "printenv"
            }
        }
    }
    
    post {
        success {
          script {
            // 输出 **** ，即在console中看不到真实信息
            echo "${env.ding_robot_token}"
          }
          // 通知钉钉机器人，需要安装dingtalk插件
          dingTalk accessToken: "${env.ding_robot_token}", imageUrl: '', jenkinsUrl: '', message: '构建成功', notifyPeople: ''
        }
  }
}
```
#### 进阶：使用 Vault
如果你要管理很多服务器密钥，数据库密码，用户密码或token等敏感信息，可以使用 [Vault](https://www.hashicorp.com/products/vault/)  他是hashicorp公司出品的专业管理机密和保护敏感数据的工具。

他有以下功能：
* 提供 图形化界面，CLI命令和HTTP API
* 方便的密码维护和变更管理功能，比如密码需要定期更换，使用Vault只需要在vault端更新密码，通知应用重新拉取就可以了
* 动态定期生成唯一密码，省去人工维护麻烦
* 支持 ACL，角色，策略，认证等

安装非常简单，就一个二进制包，直接运行即可。具体使用请参考[官方文档]([https://learn.hashicorp.com/vault/getting-started/install](https://learn.hashicorp.com/vault/getting-started/install)
)写的非常清晰，再结合Jenkins的vault插件。就可以方便的管理凭证了。
