需求：需要把 Jenkins 的构建情况通过邮件，钉钉，Slack等通知告诉相关的测试，开发人员。
结合之前讲的 [post钩子]([https://www.jianshu.com/p/909cd0ce98d8](https://www.jianshu.com/p/909cd0ce98d8)
) 更进一步可以实现失败时只通知给开发人员，成功通知给所有人员等。

### 邮件通知
这个需要在Jenkins中配置发件人的信息，如SMTP服务器，默认的邮件内容等
来到Jenkins的Configure System

1. 首先在配置页面搜索 Location 配置 Jenkins 管理员的邮箱
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-3f2e6a645cc2a99c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

2. 搜索'E-mail Notification'

可能会发现有两个E-mail Notification，一个是`Extended E-mail Notification`另一个是`E-mail Notification`。前者是安装Jenkins时顺便安装的插件，后者是自带的。

自带的E-mail Notification功能较弱，我们配置 Extended E-mail Notification，配置项比较多，不懂的点问号图标。

> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-15374369d68c3237.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

3. 来到Pipeline项目的配置页面，
通过点击 Pipeline Syntax 来到 Snippet Generator， 生成pipeline脚本。
Step 选择 mailtext: Extended Email。
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-cd2e596c076a09a7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

修改pipeline，添加发送邮件的步骤，放到pipeline的post部分的always块内，你也可以改为failure
```groovy
    post {
      always {
        emailext to: 'mafeifan@qq.com', subject: "Job [${env.JOB_NAME}] - Status: ${currentBuild.result?: 'success'}", body: 
"""
<p>EXECUTED: Job <b>\' ${env.JOB_NAME}：${env.BUILD_NUMBER}\'
</b></p><p>View console output at "<a href= "${env.BUILD_URL}">
${env.JOB_NAME}：${env.BUILD_NUMBER}</a>"</p>
<p><i>(Build log is attached.)</i></p>
""", attachLog: true, compressLog: true
  }
```


效果如下：
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-bc6e26e081f58b82.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

你也可以使用全局配置默认subject和content，使用方法如下:
```groovy
post {
  always {
    emailext (
      to: 'my@my.dom', 
      replyTo: 'my@my.dom', 
      subject: '$DEFAULT_SUBJECT',
      body: '$DEFAULT_CONTENT',
      mimeType: 'text/html'
    );
  }
}
```
主要要用单引号包裹变量，否则groovy会尝试扩展变量

关于一些参数
* attachLog(可选)：将构建日志以附件形式发送
* compressLog(可选)：压缩日志
* recipientProviders(可选): List 类型，收件人列表类型
* replyTo(可选)：回复邮箱
* recipientProviders (可选)：收件人列表类型

类型名称 | helper方法名 | 描述
---- | ---  | ---
Culprits | culprits()  | 引发构建失败的人。最后一次构建成功和最后一次构建失败之间的变更提交者列表
Developers | developers()  | 此次构建所涉及的变更的所有提交者列表
Requestor | requestor() | 请求构建的人，一般指手动触发构建的人
Upstream Committers | upstreamDevelopers() | 上游job变更提交者的列表

更多参数见[文档](https://jenkins.io/doc/pipeline/steps/email-ext/)

### Slack 通知
Slack 号称邮件杀手，是一款国外很火的消息聚合平台服务，通过建立不同的频道降低团队沟通的干扰。

1. Jenkins 安装 [Slack Notification Plugin](https://plugins.jenkins.io/slack)

2. 打开[插件Github官网](https://github.com/jenkinsci/slack-plugin)
根据提示没有账号的话先申请账号

3. Slack 端集成 Jenkin CI，首先，网页端登录slack，进到自己的workspace，然后添加Jenkins应用，需要选择一个要推送通知的频道
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-a5ee5d7ea2cb6a3f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

4.  根据指引配置就可以了，非常人性，下图在FreeStyle类型的项目中可配
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-b7f463bfb9da4cb9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-88657094ea253303.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

5. 如果需要通过Pipeline代码触发
```groovy
post {
  always {
    slackSend channel: "#机器人", message: "Build Started: ${env.JOB_NAME} ${env.BUILD_NUMBER}"
  }
```
更多参数还是参见非常好用的Pipeline Syntax 的 Snippet Generator
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-8c634186b527adc4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

效果：
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-2a055f985f9cf673.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


### 钉钉通知
Slack 有时候国内速度访问比较慢，如果公司喜欢用钉钉，也可以集成钉钉通知。
步骤是类似的，不再赘述，见[文档]([https://github.com/jenkinsci/dingding-notifications-plugin/blob/master/readme-cn.md](https://github.com/jenkinsci/dingding-notifications-plugin/blob/master/readme-cn.md)
)


### 问题
使用邮件，想把构建日志作为邮件内容发送出去，但是使用 `${env.BUILD_LOG}` 返回 null，可以改为`\${BUILD_LOG}` groovy 会展开所有的变量，然后留给email ext 处理这个变量
网上也有人问了类似的[问题](https://stackoverflow.com/questions/48081510/cant-access-build-log-in-jenkins-pipeline)，可以使用 `currentBuild.rawBuild.getLog(15)` 获取最后的15行日志，不过需要在 scriptApproval 页面批准下 `method org.jenkinsci.plugins.workflow.support.steps.build.RunWrapper getRawBuild`
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-e3d683b62140b2fc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


### 参考
* [https://jenkins.io/doc/pipeline/steps/email-ext/](https://jenkins.io/doc/pipeline/steps/email-ext/)
* [https://www.cnblogs.com/yangxia-test/p/4366172.html](https://www.cnblogs.com/yangxia-test/p/4366172.html)
* [https://github.com/jenkinsci/slack-plugin](https://github.com/jenkinsci/slack-plugin)
* [Jenkins 钉钉通知插件](https://github.com/jenkinsci/dingtalk-plugin)
* [http://www.mydlq.club/article/7/](http://www.mydlq.club/article/7/)

