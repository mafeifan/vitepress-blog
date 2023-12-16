用爬虫过程中，如果用同一IP请求过多，会被服务端屏蔽，这时可以去网站上如 [西刺免费代理IP](https://www.xicidaili.com/) 找一些免费IP代理，如果你已经有了自己的服务器，并且运行的是 nginx 服务器，就可以把自己的服务器也当成免费的代理服务器。

1. 安装过程略，建议用Docker
2. sites-enabled 下新建配置文件，如 proxy
编辑内容如下：
```
    resolver      8.8.8.8;
    server {
       listen 8888;
       location / {
           proxy_pass http://$http_host$request_uri;
       }
    }
```
3. 重启 nginx `sudo nginx -s reload`

> 1. 注意, resolver是必填的
> 2. 仅供演示，有安全隐患，建议加上用户密码限制

使用Python测试
```
import urllib.request
import urllib.parse
#  proxy练习


# 可以找些免费的代理IP
# https://www.xicidaili.com/2019-06-01/henan

req_url = "http://www.baidu.com"
# 改为列表，当作代理池
proxy_addr = "163.204.240.138:8090"


def use_proxy(req_url, proxy_addr):
    proxy = urllib.request.ProxyHandler({"http": proxy_addr})
    opener = urllib.request.build_opener(proxy, urllib.request.HTTPHandler)
    urllib.request.install_opener(opener)
    data = urllib.request.urlopen(req_url).read().decode("utf-8", "ignore")
    return data

data = use_proxy(req_url, proxy_addr)
print(len(data))
```


