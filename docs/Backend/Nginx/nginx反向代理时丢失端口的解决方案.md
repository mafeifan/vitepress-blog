今天，配置nginx反向代理时遇到一个问题，当设置nginx监听80端口时转发请求没有问题。

但一旦设置为监听其他端口，就一直跳转不正常；如，访问欢迎页面时应该是重定向到登录页面，在这个重定向的过程中端口丢失了。
这里给出一个简短的解决方案，修改nginx的配置文件。
* 一、配置文件
```
    server {
        listen       90;
        server_name  zxy1994.cn;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Server $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host:$server_port; # 这里是重点,这样配置才不会丢失端口
        location / {
                proxy_pass http://127.0.0.1:9001;
        }
        location = /50x.html {
            root   html;
        }
    }
```
* 二、产生的原因

nginx没有正确的把端口信息传送到后端，没能正确的配置nginx，下面这行是关键
`proxy_set_header Host $host:$server_port;` 这一行是关键。

