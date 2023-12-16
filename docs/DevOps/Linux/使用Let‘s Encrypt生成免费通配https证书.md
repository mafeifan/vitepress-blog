不同的操作系统方法有略微差异，这里以Ubuntu 18.04为例。

## 更新

证书过期续期方法

执行`sudo /snap/bin/certbot renew --force-renewal`

提示

```
Saving debug log to /var/log/letsencrypt/letsencrypt.log

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Processing /etc/letsencrypt/renewal/course.intogolf.nl.conf
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Could not choose appropriate plugin: The manual plugin is not working; there may be problems with your existing configuration.
The error was: PluginError('An authentication script must be provided with --manual-auth-hook when using the manual plugin non-interactively.')
Failed to renew certificate course.intogolf.nl with error: The manual plugin is not working; there may be problems with your existing configuration.
The error was: PluginError('An authentication script must be provided with --manual-auth-hook when using the manual plugin non-interactively.')

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
All renewals failed. The following certificates could not be renewed:
  /etc/letsencrypt/live/course.intogolf.nl/fullchain.pem (failure)
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
1 renew failure(s), 0 parse failure(s)

```

经查，不管是申请还是续期，只要是通配符证书，只能采用 dns-01 的方式校验申请者的域名，也就是说 certbot 操作者必须手动添加 DNS TXT 记录。

certbot 提供了一个 hook，可以编写一个 Shell 脚本，让脚本调用 DNS 服务商的 API 接口，动态添加 TXT 记录，这样就无需人工干预了。

--manual-auth-hook：在执行命令的时候调用一个 hook 文件

### 安装生成工具
```shell script
sudo apt update
sudo apt-get install letsencrypt
```

### 生成证书文件
```shell script
sudo certbot --server https://acme-v02.api.letsencrypt.org/directory -d *.example.com --manual --preferred-challenges dns-01 certonly --agree-tos --manual-public-ip-logging-ok
```

为了证明域名是属于你的，需要进行验证，其中`preferred-challenges=dns`表示使用dns验证方式
参数解释:
```
certonly:                    只生成证书
–manual:                     使用交互方式
–preferred-challenges=dns:   使用dns验证方式
–server:                     指定要用于生成证书的服务器地址
–agree-tos:                  同意条款
-d:                          指定要生成证书的域名
```

回车后，会出现类似如下提示
```
Please deploy a DNS TXT record under the name
_acme-challenge.example.com with the following value:

x4MrZ6y-JqFJQRmq_lGi9ReRQHPa1aTC9J2O7wDKzq8

Before continuing, verify the record is deployed.
```
需要在你的域名DNS中添加一条txt类型的记录，名为`_acme-challenge.example.com`值为`x4MrZ6y-JqFJQRmq_lGi9ReRQHPa1aTC9J2O7wDKzq8`
添加后先不要急着回车，等几分钟后回车，会出现成功提示
```
IMPORTANT NOTES:
 - Congratulations! Your certificate and chain have been saved at:
   /etc/letsencrypt/live/example.com/fullchain.pem
   Your key file has been saved at:
   /etc/letsencrypt/live/example.com/privkey.pem
   Your cert will expire on 2020-01-09. To obtain a new or tweaked
   version of this certificate in the future, simply run certbot
   again. To non-interactively renew *all* of your certificates, run
   "certbot renew"
 - Your account credentials have been saved in your Certbot
   configuration directory at /etc/letsencrypt. You should make a
   secure backup of this folder now. This configuration directory will
   also contain certificates and private keys obtained by Certbot so
   making regular backups of this folder is ideal.
 - If you like Certbot, please consider supporting our work by:

   Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
   Donating to EFF:                    https://eff.org/donate-le
```

会告诉你证书的生成地址

使用`sudo certbot certificates`来查看证书的过期时间和存放路径
```
Found the following certs:
  Certificate Name: example.com
    Domains: *.example.com
    Expiry Date: 2020-01-05 07:48:04+00:00 (VALID: 85 days)
    Certificate Path: /etc/letsencrypt/live/example.com/fullchain.pem
    Private Key Path: /etc/letsencrypt/live/example.com/privkey.pem
```

默认情况，证书的有效时间是三个月，为了防止过期，添加一条计划任务，自动续签，先编辑`sudo crontab -e`添加下行
```
0 1 * * * /usr/bin/certbot renew >> /var/log/letsencrypt/renew.log
```

最后打开nginx配置，引入证书，站点路径需要改为你实际的
```
server {
        root /home/example/;

        # Add index.php to the list if you are using PHP
        index index.php index.html index.htm index.nginx-debian.html;

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
        #       # With php-fpm (or other unix sockets):
                fastcgi_pass unix:/var/run/php/php7.2-fpm.sock;
        #       # With php-cgi (or other tcp sockets):
        #       fastcgi_pass 127.0.0.1:9000;
        }

        listen [::]:443 ssl ipv6only=on; # managed by Certbot
        listen 443 ssl; # managed by Certbot
        ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem; # managed by Certbot
        ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem; # managed by Certbot
        include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
        ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}
```


## 参考
https://github.com/ywdblog/certbot-letencrypt-wildcardcertificates-alydns-au

https://websiteforstudents.com/generate-free-wildcard-certificates-using-lets-encrypt-certbot-on-ubuntu-18-04/
