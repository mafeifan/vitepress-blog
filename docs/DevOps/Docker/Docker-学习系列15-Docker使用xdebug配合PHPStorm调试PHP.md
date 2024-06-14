PHPStorm整合一些了Docker相关的功能，并有官方的[Docker镜像](https://hub.docker.com/r/phpstorm/php-71-apache-xdebug/)

下面介绍怎么通过PHPStorm创建并运行一个docker容器项目并启用xdebug，以Windows系统为例
1. 运行 Docker for Windows，Docker运行成功后桌面右下角有图标，右键选择Settings
勾选 `"Expose daemon on tcp://localhost:2375"` 就是暴露守护进程。

> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-32abe015ec6f0d83.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

2. 比如有一个空项目叫 Docker-compose-demo，用PHPStorm打开
 新建 `docker-compose.yml`文件 

3. 内容如下：
```yaml
version: '2'
services:
  webserver:
    image: phpstorm/php-71-apache-xdebug-26
    ports:
      - "6080:80"
    volumes:
      - ./:/var/www/html
    environment:
      #change the line below with your IP address
      XDEBUG_CONFIG: remote_host=host.docker.internal
```
`host.docker.internal` 指运行IDE的本机IP
4.  PHPStorm 中菜单项 'Run - Edit Configurations' 配置Docker信息。因为之前我们开放了docker的守护进行，可以通过TCP协议，地址localhost:2372进行连接。PHPStorm连接上会显示 success

> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-11055592fc40363b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

5. 鼠标右键选择 `Run 'docker-compose.yml'`，通过PHPStorm下载镜像并运行容器
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-158940ebd3c8d5ae.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

可以看到本机安装过的Docker的容器和镜像。
当前正在执行 docker-compose.yml

> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-2f5f6d49f0b7819f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

运行成功了，可以直观的看到容器的相关信息
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-09b95cb716bf5062.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

6. 项目根目录创建index.php，浏览器打开 `localhost:6080` 查看效果
7. 因为已经配置了xdebug，直接就可以用。
具体 chrome浏览器安装 xdebug helper
新建index.php
内容：
```
$arr = ['jack', 'smith', 'www'];
foreach ($arr as $item) {
   # 在下面的 echo 处打断点
    echo $item;
}
```
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-7056ab428f86095d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
如图，每点一次步进就显示当前运行时的相关变量信息。非常方便。

### 总结：
使用docker大大方便了咱们的环境搭建流程。

这篇文章我是看了[官方的视频](https://www.youtube.com/watch?v=bWbXMy_mxxE) 后写的。

还有配置文件只配置了apache服务器，关于mysql等官方镜像中其实也提供了。请自行修改docker-compose.yml。

PHPStorm官方镜像：
https://github.com/JetBrains/phpstorm-docker-images/blob/master/docker-compose.yml
