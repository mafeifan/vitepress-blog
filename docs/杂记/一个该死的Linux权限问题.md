今天在一个全新的Ubuntu16.04主机上配置PHP，MySQL，Nginx环境。
这种事情我已经做过很多遍了。应该是信手拈来。
环境很快就搭建起来了，本地浏览器访问主机IP后确始终显示不出来页面。
我配置的是8001端口，难道防火墙限制了？
这个主机是天猫聚石塔用的，查了文档果然有如下说明：
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-c4da1d731796a102.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

好吧，我不得不换成80端口。
然后我再刷新浏览器竟然显示 "File not found"。
下面是我的解决流程:
1. 一般来说这是nginx配置文件中root的项目根目录路径不对所致，检查nginx配置文件无误，排除。
2. 用 `tail -n 20 /var/log/nginx/error`  查看错误日志，内容是 `FastCGI sent in stderr primary script unknown while reading response header from upstream`
3. 查了一会网上说的，总结是俩原因： 一个是  nginx中的fastcgi_param段配置有误， 一个是文件权限问题。
4. 先排除 fastcgi_param 问题，因为同样的配置在其他同样的操作系统运行时正常。唯一不同的是在其他主机默认是ubuntu用户，在这个上面是root用户。所以我觉得是文件权限问题。
5. 先后给项目目录 加 www-data 用户组，给 /run/php/php-fpm.sock 提高权限。依然不行。
6. 正一筹莫展之际，我发现项目的全路径是 /root/project 而并不是 /home/root/project。 而/root的权限是  `drwx------`
当我执行完 `chmod 755 /root`。 页面终于打开了，我只想说一句，Linux真难啊。
