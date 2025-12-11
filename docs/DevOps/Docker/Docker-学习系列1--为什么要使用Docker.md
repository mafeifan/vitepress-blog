通过一个实际例子说下使用Docker的好处

最近有一个新的后台API项目需要运行在PHP5.3环境中，软件行业有个特点，版本更新快，工具层出不穷。PHP5.3至少是5年前的版本了。
PHP官方早已不维护，虽然提供源码，但是安装配置也很麻烦，又不想污染目前机器上PHP7环境。

所以想到了Docker，通过这篇 [文章](https://blog.eriksen.com.br/en/docker-image-multi-version-php-development)
我很快的就利用Docker解决了我的问题，我直接利用别人提供好的Docker镜像，可以快速实现PHP版本切换

我觉得Docker适合以下情况：

1. 运行特定的开发环境，比如要运行两个项目。一个要求PHP5.6，一个PHP7.0。不想来回切换。或者同时运行多个Node版本等等。
2. 喜欢尝鲜，折腾，docker有很强的隔离性。在docker里搞坏也不会破坏本地，用到的时候docker run 启动镜像和容器，不想用了`docker rm [容器名]`删掉即可。

以ThinkPHP3.2框架为例，通过docker跑起来，可以按如下步骤：

1. 安装 Docker，略
记得一定要切换为国内源，不然速度巨慢，还容易报错，推荐免费的 https://www.daocloud.io/mirror#accelerator-doc 或者搜索阿里docker镜像源。

2. 下载镜像
`docker pull eriksencosta/php-dev`
3. 项目目录是已经存在的
路径是 `D:/projects/live-ranking-api`
4. 运行容器  其中参数：
* -p 端口映射  
* -v 或者 --volume，挂载目录，冒号前是宿主机目录，后面的是容器内目录
* -t 或者 --tty 分配一个伪终端
* -i 或者 --interactive, 就是表示已交互方式运行容器，啥是交互方式？就是你输入命令，就返回命令的结果，
* -d 或者 --detach, 在容器在后台运行，并返回容器ID，这样可以不用再新开一个窗口
运行成功后会执行 /bin/bash 就是进去终端

docker run 后面可以带很多参数,[见官网](https://docs.docker.com/engine/reference/commandline/run/)

完整的命令如下：
`docker run -t -i  -p 8088:80 -v D:/projects/live-ranking-api:/var/www -d "eriksencosta/php-dev:latest" /bin/bash`
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-55b0e9da91db9375.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

5. 打开浏览器输入 `localhost:8088` 正常的话项目已经成功跑起来了
6. 切换PHP版本，在容器内的终端内输入 `phpenv命令` 列出当前可选择的PHP版本
```bash
# phpenv versions
  5.3
  5.3.29
  5.4
  5.4.35
  5.5
  5.5.19
  5.6
* 5.6.3 (set by /opt/phpenv/version)
```
执行 phpenv global 5.4
```bash
# phpenv global 5.4
# php -v
PHP 5.4.35 (cli) (built: Dec 14 2014 00:35:12)
Copyright (c) 1997-2014 The PHP Group
Zend Engine v2.4.0, Copyright (c) 1998-2014 Zend Technologies
    with Zend OPcache v7.0.3, Copyright (c) 1999-2014, by Zend Technologies
    with Xdebug v2.2.6, Copyright (c) 2002-2014, by Derick Rethans
```
启动 nginx
```bash
# webserver start
Starting PHP-FPM (PHP version 5.3) server.
Starting Nginx server.
Done.
```

#### 参考：
* https://hub.docker.com/r/eriksencosta/php-dev/

* https://github.com/eriksencosta/silex-docker-example

* https://docs.docker.com/engine/reference/commandline/run/
