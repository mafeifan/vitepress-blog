## 创建新站点
安装完nginx，会有sites-available和sites-enabled目录，只有在sites-enabled目录下创建的站点配置文件才会生效，
但是我们一般在sites-available目录下站点配置文件，然后软链接到sites-enabled，
这样有个好处是假设下面的 www.booking.com 站点不需要了，只需要删掉sites-enabled/www.booking.com文件即可，他只是链接文件，源文件还是在sites-available目录下面，方便还原。

## basic认证

有些网站页面需要输入正确的用户名和密码才能打开

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a14be72019cf437bab3466456da0827a~tplv-k3u1fbpfcp-watermark.image)

实现方法也比较简单

```
sudo apt-get install apache2-utils
cd /etc/nginx
# 使用htpasswd命令创建用户demo,密码123456文件名htpasswd的验证文件
sudo htpasswd -bc htpasswd demo 123456
# 编辑 nginx 站点配置文件
# 加入下面两行到 server 或 location 段中
auth_basic 'Restricted';  # 认证名称，随意填写 
auth_basic_user_file /usr/local/nginx/htpasswd; # 认证的密码文件，需要生成。
# 重启 nginx
sudo nginx -t && sudo nginx -s reload
```

## 显示目录文件列表

场景：有个存放每日备份数据库或日志的目录，希望显示列表，方便下载文件
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d07ab6b8a0fe4a3d92c87bf0766afca3~tplv-k3u1fbpfcp-watermark.image)

```
location / {
   root /data/www/file                   //指定实际目录绝对路径；
   autoindex on;                         //开启目录浏览功能；
   autoindex_exact_size off;             //关闭详细文件大小统计，让文件大小显示MB，GB单位，默认为b；
   autoindex_localtime on;              //开启以服务器本地时区显示文件修改日期！
   charset utf-8,gbk;                   //避免中文乱码
}
```

另外，如果希望请求文件是下载而不是显示内容，可以通过添加下面参数实现：
`add_header Content-Disposition attachment;`

## 反向代理

我们只需要记得正向代理代理的对象是客户端，最常见的就是VPN软件

反向代理代理的对象是服务端

客户端本来可以直接通过HTTP协议访问某网站应用服务器，如果网站管理员在中间加上一个Nginx，客户端请求Nginx，Nginx请求应用服务器，然后将结果返回给客户端，此时Nginx就是反向代理服务器。

例子：Nginx监听来自外部访问80的请求，转发给自己服务器占用18083端口的服务

```
server {
    listen 80;
    index index.html index.htm index.nginx-debian.html;
    server_name mqtt.demo.com;
    location / {
      proxy_pass  http://127.0.0.1:18083;
    }
}
```

## 关于 try_files 指令

```
location / {
    # First attempt to serve request as file, then
    # as directory, then fall back to displaying a 404.
    # $uri 是变量 如 www.xxx.com/aaa.php 则 $uri是aaa.php
    # 假设我们访问/a.php 先判断 a.php是不是文件,是返回
    # 如果不是再判断是不是目录（$uri/）,是返回
    # 如果都不是则返回404
    try_files $uri $uri/ =404;
}
#  所有的请求引导到index.php中
try_files $uri $uri/   /index.php?$query_string  =404;
```

## @ 符号的使用

@用于定义一个 location 块，且该块不能被外部 Client 所访问，只能被 Nginx 内部配置指令所访问，比如 try_files

c49fb81c8f9141ae3fe7f9db2da60bd7.htm 实际上个不存在的文件，
下面的含义的如果访问项目根目录或blog目录底下的以php结尾的文件都走php fpm解析流程

```
location ~ \.php$ {
    try_files /c49fb81c8f9141ae3fe7f9db2da60bd7.htm @php;
}
location /blog/\.php$ {
    try_files /c49fb81c8f9141ae3fe7f9db2da60bd7.htm @php;
}
location @php {
    try_files $uri =404;
    include /etc/nginx/fastcgi_params;
    fastcgi_pass unix:/var/lib/php7.2-fpm/web10.sock;
    fastcgi_index index.php;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    fastcgi_intercept_errors on;
}
```

## 使用Nginx解决跨域问题

当公司存在多个域名时，两个不同的域名相互访问就会存在跨域问题。

或者在进行前端开发时，通常前端代码在本地启动，而后端代码会部署在一台专用的后端开发服务器上，此时前端去调用后端接口时，就会出现跨域问题。

解决跨域的方法有很多，今天来说一下如何使用Nginx来解决跨域问题。

假设后端服务器，是使用Nginx作为对外统一入口的，在Nginx配置文件的server块中增加如下配置：

```
# 允许跨域请求的域名，*代表所有
add_header 'Access-Control-Allow-Origin' *;
# 允许带上cookie请求
add_header 'Access-Control-Allow-Credentials' 'true';
# 允许请求的方法，例如：GET、POST、PUT、DELETE等，*代表所有
add_header 'Access-Control-Allow-Methods' *;
# 允许请求的头信息，例如：DNT,X-Mx-ReqToken,Keep-Alive,User-Agent等，*代表所有
add_header 'Access-Control-Allow-Headers' *;
```

重新加载Nginx，便发现，已经可以跨域访问了。

## 验证头信息中的 referer 参数

请求头信息中的 referer 参数，记录了上一个页面的地址，Nginx可以对其进行校验，达到防盗链的目的。

通常在配置文件的location块中增加配置。

```
server {
    listen       80;   # 端口
    server_name  www.osvlabs.com;  # 服务名，可以是IP地址或者域名

    location / {   # 根路径
　　　　　root   html;  # 对应nginx安装目标下的html文件夹
        index  hello.html; # 指定首页为 hello.html
    }

    location ~* \.(GIF|PNG|jpg|bmp|jpeg) {  # *代表不区分大小写
        # 校验请求是否来自于osvlabs.com这个站点，不是则返回404页面
    　　valid_referers *.osvlabs.com;
    　　if ($invalid_referer) {
           return 404;
    　　}
　　　　 root /home/img;
　　}

    error_page 500 502 503 504  /50x.html;  # 指定这些状态码跳转的错误页
    location = /50x.html {
        root   html;
    }
}
```

## Nginx构建Tomcat集群

Nginx最常用的一个功能，就是为Tomcat构建集群，以达到实现高并发、高可用的目的。

首先在 upstream 块中，配置Tomcat集群中的服务地址，然后在location块中配置转发请求到此 upstream。

```
# 配置Tomcat集群中的服务器
upstream osvlabs {
    server 192.168.1.101:8080;
    server 192.168.1.102:8080;
    server 192.168.1.103:8080;
}

server {
    listen  80;
    server_name     www.osvlabs.com;

    location / {
        proxy_pass      http://osvlabs;
    }
}
```

默认按所有机器权重为1的轮询方式对集群服务进行访问，每个服务访问1次，然后访问下一个服务，适合集群中每台服务器性能差不多的情况。

权重配置也是经常用的，适用于机器性能有差异的情况。
```
upstream osvlabs {
　　server 192.168.1.101:8080  weight=1;
　　server 192.168.1.102:8080;
　　server 192.168.1.103:8080  weight=3;
}
```
weight 就是权重配置，不配默认是1，按照以上配置，在5次请求中，101和102会被访问1次，103会被访问3次。

使用down，可以标识某个服务已停用，Nginx便不会去访问他了。
```
upstream osvlabs {
    server 192.168.1.101:8080;
    server 192.168.1.102:8080 down;
    server 192.168.1.103:8080;
}
```

使用backup，可以标识101是备用机，当102、103宕机后，101会进行服务。
```
upstream osvlabs {
    server 192.168.1.101:8080 backup;
    server 192.168.1.102:8080;
    server 192.168.1.103:8080;
}
```

使用 max_fails 和 fail_timeout 将服务动态停用

max_fails 默认是1，fail_timeout默认是10s
```
upstream osvlabs {
    server 192.168.1.101:8080 max_fails=2 fail_timeout=10s;
    server 192.168.1.102:8080;
    server 192.168.1.103:8080;
}
```
如此配置，101服务器在10秒内如果失败次数达到2次，会停用10秒。10秒后，会尝试连接101服务器，如果连接成功则恢复轮询方式，如果不成功，再等待10秒尝试。

 
## 使用keepalive设置长链接数量，提高吞吐量

```
upstream osvlabs {
    server 192.168.1.101:8080;
    server 192.168.1.102:8080;
    server 192.168.1.103:8080;
    
    keepalive 50;
}

 server {
    listen  80;
    server_name     www.osvlabs.com;

    location / {
        proxy_pass      http://osvlabs;
        
        proxy_http_version    1.1;
        proxy_set_header    Connection "";
    }
}
```

需要在upstream块中增加 keepalive 配置，在server的location块中增加 proxy_http_version 和 proxy_set_header 配置。

这样设置可以减少连接断开、新建的损耗，增加吞吐量。

## 其他负载均衡策略

除了前面说到的轮询方式，Nginx在负载均衡时，还有其他策略。

* ip_hash：以客户端IP地址为依据，匹配服务器。
* hash $request_uri：以请求的URL为依据，匹配服务器。
* least_conn：以服务器连接数为依据，哪个服务器连接数少，匹配哪台服务器

```
upstream osvlabs {
    # ip_hash;
    # hash $request_uri;
    least_conn;

    server 192.168.1.101:8080;
    server 192.168.1.102:8080;
    server 192.168.1.103:8080;
}
```

## access_log过滤

一个网站，会包含很多元素，尤其是有大量的图片、js、css等静态元素。
这样的请求其实可以不用记录日志。

```
location ~* ^.+\.(gif|jpg|png|css|js)$ 
{
    access_log off;
}

或
location ~* ^.+\.(gif|jpg|png|css|js)$                                      
{
    access_log /dev/null;
}
```