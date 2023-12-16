> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-52a06ab10292d803.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

Docker官方提供了类似 github的平台，叫 https://hub.docker.com
可以 pull 官方或第三方提供的镜像，当然也可以发布自己的镜像供别人下载，互相学习。
大致流程：
docker hub 平台注册账号 -> `docker login` (登录) -> `docker image ls`  (查看本地镜像)  -> `docker push` （如 docker push finleyma/phpenv:tp3.2）

注册完成后如果要发布本地自己制作好的镜像，要执行命令 
先执行 `docker image ls` 查看本地存在的镜像
然后 docker push 某镜像 ,  比如提交上篇制作好的镜像 
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-adf6b309ae56fbfb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

刷新docker hub的个人 REPOSITORY 页面，会看到已经存在了
`https://hub.docker.com/r/finleyma/phpenv/`

这样的话其他项目成员可以直接执行
`docker run -t -i -p 8089:80 -v [他的项目路径]:/var/www "finleyma/phpenv:tp3.2" /bin/bash`
进到终端只需 `webserver start` 启动服务。
