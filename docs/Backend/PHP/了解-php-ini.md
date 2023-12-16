php.ini 有点复杂
首先php运行有命令行模式(比如 composer安装模块依赖)和 web模式(就是打开页面时正常模式)
两种模式加载的php.ini可能不一样。
### Windows
在Windows，如果你是用的wamp。命令行模式用到的php.ini在apache2目录下，正常模式，如果你使用的php版本是7.2。则用到的php.ini在php7.2目录下。
### MacOS
如果是用brew安装的PHP。跑的是fpm。
新建个test.php。内容 `<?php phpinfo() ?>`。浏览器运行。
会看到如下信息：
主配置文件是: `/usr/local/etc/php/7.1/php.ini`
额外的配置文件: `/usr/local/etc/php/7.1/conf.d` 
     ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-41c1e13c0a3173cf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
你还可以在 `/usr/local/etc/php/7.1/php-fpm.d/www.conf` 此文件下面定义配置项。这个文件被 [php-fpm.conf] 包含
 * [php-fpm.conf](http://php.net/manual/zh/install.fpm.configuration.php) 是php-fpm进程服务的配置文件
```
  ######设置错误日志的路径
  error_log = /var/log/php-fpm/error.log
  ######引入www.conf文件中的配置
  include=/usr/local/php7.1/etc/php-fpm.d/*.conf
```
 * `www.conf` 这是php-fpm进程服务的扩展配置文件 (php-fpm.d目录下)

![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-3c1ea4934d74cb69.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 可修改范围
![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-0cd7abe8a63bf5b4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
[核心配置选项说明](http://php.net/manual/zh/ini.core.php)

### 针对项目使用配置项
在项目入口目录新建 `.user.ini`

### 查看命令行模式下加载哪些ini文件
![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-5da7950228e4f032.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 参考
http://php.net/configuration.file
https://typecodes.com/web/php7configure.html

### 问题
mac下如何重启php-fpm？，我在
1.  /usr/local/etc/php/7.1/php-fpm.d/www.conf
2.  项目入口目录下新建了 .user.ini
3. /usr/local/etc/php/7.1/conf.d/php-memory-limits.ini
4. /usr/local/etc/php/7.1/php.ini
5. /usr/local/etc/php/7.1/conf.d/user.ini

上述5个配置文件都添加了 memory_limit 配置项，值分别是111M 到 555M
* 生效的是www.conf，然后去掉 www.conf 中的 `memory_limit = 111M`，重启 `brew services restart php71` 
值依然是111，非常纳闷。要么不是这么重启，要么还有缓存？
* 重启电脑后显示`memory_limit = 555M`， 因为加载顺序。 user.ini 在 php-memory-limits.ini 后面把前面的覆盖了。


### 监测配置项是否被加载
`var_dump(ini_get('curl.cainfo'));`
