## 目的

通过 IP:10080 访问 gitlab 站点不太优雅，也不方便识记
我们给 gitlab 站点绑定个域名并且带上SSL证书

## 申请免费SSL证书

由于我的 mafeifan.com 域名解析是托管在腾讯云, 可以在腾讯云的SSL证书服务里购买免费的域名证书

时长只有3个月

![](https://pek3b.qingstor.com/hexo-blog/202410261649111.png)

![](https://pek3b.qingstor.com/hexo-blog/202410261650124.png)

选择 nginx 类型，下载得到 gitlab.mafeifan.com_nginx.zip

登录服务器安装nginx
```bash
sudo yum install nginx -y
# 创建一个专门存放证书的目录
sudo mkdir -p /etc/nginx/my_certs
```

将证书放到指定目录

* /etc/nginx/my_certs/gitlab.mafeifan.com_bundle.crt
* /etc/nginx/my_certs/gitlab.mafeifan.com.key

新建nginx配置文件 `/etc/nginx/conf.d/gitlab.mafeifan.com-80-443.conf`
内容如下：

```bash
server {
    listen 80;
    server_name gitlab.mafeifan.com;
    rewrite ^(.*) https://$host$1 permanent;
}

server {
  listen 443;
  server_name gitlab.mafeifan.com;
  ssl on;
  ssl_certificate /etc/nginx/my_certs/gitlab.mafeifan.com_bundle.crt;
  ssl_certificate_key /etc/nginx/my_certs/gitlab.mafeifan.com.key;
  ssl_session_timeout 5m;
  ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
  ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE;
  ssl_prefer_server_ciphers on;
  location / {
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header Host $http_host;
    proxy_pass http://127.0.0.1:10080;
  }
}
```


修改`docker-compose.yml`

```
GITLAB_HTTPS=true
SSL_SELF_SIGNED=false

GITLAB_HOST=gitlab.mafeifan.com
GITLAB_PORT=443
```

重启

`docker-compose down && docker-compose up -d`

## 问题

1. gitlab 提供了一个 WebIDE 在线编辑代码的编辑器,发生了地址错误的情况

![](https://pek3b.qingstor.com/hexo-blog/202410261732112.png)

根据[文档](https://docs.gitlab.com/ee/user/project/web_ide/#update-the-oauth-callback-url)，把地址改为 `https://gitlab.mafeifan.com/-/ide/oauth_redirect`


