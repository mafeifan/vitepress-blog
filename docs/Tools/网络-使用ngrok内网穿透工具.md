需求：
1. 自己做的网站系统需要一个公网地址，方便给客户演示，传统做法是买个有公网地址的服务器，可是手头上又没有服务器。即便有服务器还要搭建环境，同步代码啥的，非常不方便。关键只是演示，没必要大动干戈。
2. 微信开发或聊天机器人开发等需要填写域名，比如微信窗口里打开IP地址会有警告提示，测试起来很麻烦。手头没有域名或者没有必要。

这时可以使用ngrok工具。他可以分配给你一个公网的二级域名，来绑定你本地的正在跑的http服务。
比如我本地跑了一个vue cli搭建的程序，跑起来后默认是 http://localhost:8080 。
当我安装 ngnok 后，执行 `./ngrok http 8080` (Windows系统下可能是ngrok.exe)
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-cc1e87db8b1f6b6b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

如图：工具随机分配给我了http和https两个地址，这个时候无论是手机还是电脑，还是其他地方的小伙伴访问 http://100a13a1.ngrok.io 就可以看到我本机上的 localhost:8080
打开web interface对应的地址，可以看到请求和响应内容，方便调试。

具体地址：
https://ngrok.com/

注意：
1. 对于免费用户，每次启动ngrok分配到的公网地址是会变的。
可以用国内的类似的服务，他提供了固定而且免费的地址。不过访问速度有点慢。毕竟是免费的。
https://ngrok.cc/
2. 当页面显示Invalid Host header，因为vue cli使用的是webpack server，基于安全对访问做了限制。在 build/webpack.dev.conf.js 内
```
//追加配置
devServer: {
    host: '0.0.0.0',
    disableHostCheck: true
  }
```
我的博客即将搬运同步至腾讯云+社区，邀请大家一同入驻：https://cloud.tencent.com/developer/support-plan?invite_code=v7er73kcqd35
