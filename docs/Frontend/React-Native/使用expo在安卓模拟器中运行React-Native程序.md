看完这篇教程你会学到如何在安卓模拟器里运行一个React Native程序。

我的电脑及软件环境
系统： windows10 64
Node：8.5.0
然后安装下面的工具，不分先后。

首先说下 create-react-native-app
`npm install -g create-react-native-app`
并按照[教程]( http://facebook.github.io/react-native/docs/getting-started.html) 尝试启动，执行完执行`npm start`会出现个二维码，让我们在手机里安装[expo](https://expo.io/)，扫一扫就可以打开react native应用。注意要处在同一网络。经常会出现timeout。

[Android Studio 3.0](https://developer.android.com/studio/index.html) (注意这个不是必须的，我主要是用他来安装android sdk)
这个安装过程会比较慢，而且加上sdk等大约会占2G的空间。按照网站的视频安装就行，安装完就可以启动一个安卓程序了。
![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-a039542495aeea8b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

注意sdk的安装路径，我们要保证命令行可以直接运行adb。
我是在环境变量里添加了`C:\Users\{替换成你的计算机名}\AppData\Local\Android\Sdk\platform-tools`

[genymotion](https://www.genymotion.com/download/)
这个需要注册帐号，然后按照expo的推荐，安装安卓虚拟设备，可以是Nexus5。

安装 [expo XDE](https://expo.io/tools)
简单说expo是一个工具，可以运行react native，并且在genymotion模拟器里打开，提供live reload等功能，还可以发布你的程序。类似开发微信小程序那个工具。
[具体文档](https://docs.expo.io/versions/latest/introduction/faq.html)
实测发现不太稳定。可能会受到不同的电脑环境和环境变量的影响。
这里要注意一点ADB的配置
![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-f3b2f18fc7823445.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


大致流程：
1. 用 `create-react-native-app` 创建一个项目，比如名叫RN_First
![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-2f3ff77e28e19ab5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

2. 用Expo XDE打开这个项目并运行
运行后界面如下，
![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-92de03c0fbe3efe4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

3. 打开Genymotion并运行安卓模拟器

![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-7429cf9dd1cb86c0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

4. 然后在expo里选择Device-Open on Android，成功的话可以在安卓模拟器看到启动expo并打开了我们的RN项目

如果修改代码，比如App.js，会立即发生变化。
![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-ec7bedcc531af94a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-656ad0cefa1382ec.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



遇到的坑：
#####  ADB server didn't ACK, failed to start daemon

 答： 发现adb的环境变量设的不对，之前装过安卓sdk造成有两个adb。expo找的是老的adb。
[参考](https://stackoverflow.com/questions/5703550/eclipse-error-adb-server-didnt-ack-failed-to-start-daemon?rq=1)

##### Error running adb: Error running app. Error: Activity not started, unable to resolve Intent { act=android.intent.action.VIEW dat=exp://192.168.0.100:19000 flg=0x10000000 }
 答： 检查adb配置，最后重装expo解决。

原谅我用了粗话，因为第一次接触，走了不少弯路。

#### 关于模拟器里调试：
ios里按cmd+R，对于安卓，点击菜单按钮
![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-4cc227ac866dbb1e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


#### 总结：
1. 最好用mac开发react native，毕竟这个工具的开发者很多都用的MBP，坑会少一些。
2. 工具尽量从官方下载，不要胡乱从第三方网站下载
3. 开发前建议多看几遍 [expo](https://docs.expo.io/versions/latest/introduction/index.html) 文档。清楚你每步的操作是什么。

相关工具官方下载地址:
[Android Studio](https://developer.android.com/studio/index.html) 
[genymotion](https://www.genymotion.com/download/)
