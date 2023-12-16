本节通过学习 docker 的 nginx 镜像，容器的使用。以及如何映射文件。

1. 运行容器
`docker run --name my-nginx -d -p 8088:80 --rm nginx:1.15`
* -d：在后台运行
* -p：容器的80端口映射到 宿主机的 8088 端口
* --rm：容器停止运行后，自动删除容器文件
* --name：容器的名字为 my-nginx

> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-e508e54965926b10.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

docker run 其实等于 docker create + start 
因为tag为 1.15 的 nginx 镜像并不在本地，会先下载再运行

浏览器打开 locahost:8088 就能看到默认页面了

2. 官方推荐通过 Dockerfile 的方式制作镜像并运行容器

新建static-pages目录，结构如下：
```
static-pages
   -- index.html
   -- Dockerfile
```
index.html
```
<h1>Hello World</h1>
```

Dockerfile
```
FROM nginx:1.15
COPY . /usr/share/nginx/html
```
切换到Dockerfile所在路径

制作镜像 `docker build -t my-nginx .`，名称为 my-nginx，完整镜像名格式是：name:tag
参见 [文档](https://docs.docker.com/engine/reference/commandline/build/#tag-an-image--t)
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-62d5bde15f851d61.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

根据镜像运行一个容器
`docker run --name my-nginx -d  -p 8088:80 my-nginx:latest`
浏览器打开 locahost:8088 就能看到 hello-world 了

3.如果要修改nginx配置文件，我们把容器里面的 Nginx 配置文件拷贝到本地的当前目录。
执行 `docker container cp my-nginx:/etc/nginx .`
不要漏掉最后那个点。执行完成后，当前目录应该多出一个nginx子目录。
修改Dockerfile
```
FROM nginx:1.15
COPY index.html /usr/share/nginx/html
COPY nginx /etc/
```
然后修改 static-pages\nginx\conf.d\default.conf
```
server {
  listen       80;
  server_name  ng.test;
}
```
C:\Windows\System32\drivers\etc\HOSTS
需要添加  `127.0.0.10 ng.test` 保持和localhost一致即可
重新制作镜像 ` docker  build -t my-nginx:ng-test .`
运行容器 ` docker run  -d  -p 80:80 my-nginx:ng-test` 注意我映射的端口不再是8088，这样本地浏览器就能访问 ng.test 了

#### 细节
* 停止容器： 
先 docker ps 获取容器ID，比如是 934f93002018
然后 docker stop 934f93002018
* 重启容器`docker exec -it <mycontainer> kill -USR2 1`
