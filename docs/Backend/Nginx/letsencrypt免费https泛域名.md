这里我已经拥有了一个example.com域名，要生成这个域名的泛域名证书，又不想掏钱买，可以使用Let’s Encrypt

Let’s Encrypt 是一个非盈利的 CA 机构，目的是推动https的发展。
他们搞了一个非常有创意的事情，设计了一个 ACME 协议。 那为什么要创建 ACME 协议呢，传统的 CA 机构是人工受理证书申请、证书更新、证书撤销，完全是手动处理的。而 ACME 协议规范化了证书申请、更新、撤销等流程，只要一个客户端实现了该协议的功能，通过客户端就可以向 Let’s Encrypt 申请证书，也就是说 Let’s Encrypt CA 完全是自动化操作的。 任何人都可以基于 ACME 协议实现一个客户端，官方推荐的客户端是Certbot 。
Let’s Encrypt 支持两种证书，单域名和泛域名
为防止滥用，申请 Let’s Encrypt 证书的时候，需要校验域名的所有权，目前支持多种验证方式。
常见的是dns01：给域名添加一个 DNS TXT 记录


Certbot是可以生成的https证书的工具，要使用他，你需要保证：
* 懂一些命令行
* 一个http访问的站点，即已经安装并运行了服务器
* 80端口是开放的
* 可以通过SSH访问服务器
* 可以使用sudo
如果要配置泛域名证书，还需要知道域名的DNS提供商，并且可以修改DNS信息

1. 安装 certbot

打开 https://certbot.eff.org/

选择你的服务器和操作系统，
这里我选择Nginx服务器和Ubuntu18.04版本的操作系统
接着让你选择生成默认证书（单一域名）还是通配（泛域名）证书
这里我选择泛域名


```bash
sudo apt-get install software-properties-common
sudo add-apt-repository universe
sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update
sudo apt-get install certbot
```

2. 生成证书
`sudo certbot --server https://acme-v02.api.letsencrypt.org/directory -d *.example.com -d example.com --manual --preferred-challenges dns-01 certonly --agree-tos --manual-public-ip-logging-ok`

修改`example.com`为实际的域名

会提示
`
Please deploy a DNS TXT record under the name
_acme-challenge.example.com with the following value:

CqlWZaGWFSC1sj7Jww2juz9VJIzzJwWWoo-WUu-1Dow
`

这时候需要去域名DNS管理后台添加相应记录，不要着急next回车，因为DNS生效可能要等5-10分钟
回车后，如果出现

`
IMPORTANT NOTES:
 - Congratulations! Your certificate and chain have been saved at:
   /etc/letsencrypt/live/example.com/fullchain.pem
   Your key file has been saved at:
   /etc/letsencrypt/live/example.com/privkey.pem
   Your cert will expire on 2020-12-28. To obtain a new or tweaked
   version of this certificate in the future, simply run certbot
   again. To non-interactively renew all of your certificates, run
   "certbot renew"
 - If you like Certbot, please consider supporting our work by:

   Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
   Donating to EFF:                    https://eff.org/donate-le
`

3. 修改nginx配置，可以参考下面的配置，我的网站需要跑PHP

```
server {

    root /var/html/www;

	# Add index.php to the list if you are using PHP
	index index.php index.html index.htm index.nginx-debian.html;

    # 修改为泛域名
	server_name *.example.com;

	location / {
		# First attempt to serve request as file, then
		# as directory, then fall back to displaying a 404.
		# try_files $uri $uri/ =404;
		try_files $uri $uri/ /index.php?$query_string;
	}

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

	error_page 404 /index.php;

	# pass PHP scripts to FastCGI server
	#
	location ~ \.php$ {
		include snippets/fastcgi-php.conf;
	#
	#	# With php-fpm (or other unix sockets):
		fastcgi_pass unix:/var/run/php/php7.2-fpm.sock;
	#	# With php-cgi (or other tcp sockets):
	#	fastcgi_pass 127.0.0.1:9000;
	}

    listen [::]:443 ssl ipv6only=on; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    # 注意路径，改为刚才生成后显示的
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}

server {
    # http 转 https重定向
	rewrite ^(.*) https://$host$1 permanent;
	listen 80 default_server;
	listen [::]:80 default_server;

	server_name *.course.intogolf.nl;
    return 404; # managed by Certbot
}
```

4. sudo nginx -t 检查配置，无误后 sudo nginx -s reload

5. letsencrypt的证书有效期是三个月，可设置crontab自动任务进行更新
```
30 1 10 * * /usr/bin/certbot renew && /usr/sbin/nginx -s reload # 每月10日1点30分执行一次
```

先`which certbot`确定`certbot`实际的位置

### 参考
https://certbot.eff.org/lets-encrypt/ubuntubionic-nginx

https://blog.csdn.net/zcyuefan/article/details/82986844

https://www.jianshu.com/p/c6f6f277a23d