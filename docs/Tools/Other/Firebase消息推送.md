Firebase Cloud Messaging (FCM) 是一种跨平台(安卓，IOS，Web)消息传递解决方案，且无需任何费用。

最近用cordova开发app，客户希望用firebase带的消息推送功能，国内我们知道有激光推送，leancloud，而国外firebase非常出名。

cordova使用firebase需要注意以下几点：

* 因为firebase已被google收购，国内手机设备无法接收来自firebase的推送，除非开代理，要打开的端口和主机名见[官方文档](https://firebase.google.com/docs/cloud-messaging/concept-options#messaging-ports-and-your-firewall)

* 手机上的app运行状态分前台和后台
   * 前台运行时可以接收到消息推送，但是不会有消息栏的提醒(这是手机的默认行为)，对于安卓，如果要在前台显示推送，推荐使用[cordova-plugin-local-notification](https://github.com/katzer/cordova-plugin-local-notifications#readme) 插件
   * 后台运行或关闭时，手机收到推送会显示消息栏，如果用户点击通知，app会显示在前台，通知内容会被JS回调接收。如果不点击或关闭，通知将一直存在。
   
* 我们项目中使用的是[cordova-plugin-firebasex](https://github.com/dpa99c/cordova-plugin-firebasex) ，有个bug，手机息屏接收消息很快，亮屏app后台运行接收不稳定。
   
* 关于通知权限，对于安卓，不需要授权，但是对于apple，需要调用请求授权方法，如我们用到的`cordova-plugin-firebasex`插件需要调用提供的`grantpermission`方法。

    ![](https://pek3b.qingstor.com/hexo-blog/hexo-blog/20210907172030.png)


* 使用安卓模拟器时记得选用带GooglePlay标志的版本，然后需要在更多设置里更新GooglePlay的版本，并在虚拟机内部做一下接入点代理，记得勾选一下梯子的允许来自局域网的访问。

    ![](https://pek3b.qingstor.com/hexo-blog/hexo-blog/20210919135331.png)

* FCM发送推送分三种类型：
   * 按设备ID(针对性强，可以只发给某几台设备)，需要传`device token`
   * 按`topic`主题，比如定义一个名为`ad`的topic，只有订阅这个topic的设备才能接收到通知
   * 按target目标，这应该是firebase的特色，你可以针对某平台(ios或android),某个国家，某目标人群等统计相关参数发推送，很灵活。但是需要创建firebase创建项目时候开启google analysis
   
    ![](https://pek3b.qingstor.com/hexo-blog/hexo-blog/20210907171050.png)

* APN(Apple Push Notification)，不像安卓生态那么混乱，苹果生态中所有通知都走APN，大致流程：firebase通知APN，APN通知apple设备客户端。[技术文档](https://developer.apple.com/documentation/usernotifications)，
firebase连APN需要我们在apple后台生成验权文件，就是P8或P12，后面会讲。

* 对于安卓，确保在firebase项目设置中生成了`google-services.json`文件，对于ios，要生成`GoogleService-Info.plist`文件，生成文件在放到cordova项目根目录，对于ios，还需要到苹果开发者后后台生成p8或p12文件并上传到firebase项目ios集成页面中

> 强烈建议生成P8认证文件，P12文件有很多缺点: 流程繁琐，区分开发和正式环境，还有有效期。P8和P12文件生成流程参见:[iOS 推送设置指南](https://leancloud.cn/docs/ios_push_cert.html)

* 消息推送内容可以带[emoji](http://www.unicode.org/emoji/charts/full-emoji-list.html#1f633)

### 集成了如何测试？

如果是用的Cordova集成消息推送，建议先运行这个插件的[demo项目](https://github.com/dpa99c/cordova-plugin-firebasex-test)
安卓手机模拟器可以收到推送消息，苹果的必须真机，收到推送消息的前提的运行获取`FCM ID`和`FCM token`成功(记得开代理，或者保证能访问google)

![](https://pek3b.qingstor.com/hexo-blog/hexo-blog/20210908154923.png)

![](https://pek3b.qingstor.com/hexo-blog/hexo-blog/20210908154954.png)

### 如何使用命令行发送消息

可以直接用`curl`命令调用`https://fcm.googleapis.com/v1/projects/${project-id}/messages:send`发送消息
`${project-id}` 替换成firebase中project setting页面中生成的

```shell script
curl -X POST -H "Authorization: Bearer ya29.ElqKBGN2Ri_Uz...HnS_uNreA" -H "Content-Type: application/json" -d '{
  "message": {
    "topic" : "my-topic",
    "notification": {
      "body": "This is a Firebase Cloud Messaging Topic Message!",
      "title": "FCM Message"
    }
  }
}' https://fcm.googleapis.com/v1/projects/myproject-b5ae1/messages:send HTTP/1.1
```

## 参考

https://juejin.cn/post/6844904153274155022

https://github.com/katzer/cordova-plugin-local-notifications#readme

https://www.npmjs.com/package/cordova-plugin-fcm-with-dependecy-updated

https://developer.apple.com/documentation/usernotifications
