如果你正在使用mac电脑，并且经常需要在本地部署一些站点，又讨厌频繁的修改服务器配置文件重启服务器。
强烈推荐使用Valet
Valet是一套包含了Nginx和DnsMasq工具，配合PHP。可以快速的创建站点。
#### 原理：
Valet 为您的 Mac 设置了开机后始终在后台运行 Nginx 服务。 然后，Valet 使用 DnsMasq 将所有指向安装在本地的计算机站点请求代理到 *.test 结尾的域名上。

默认情况下，Valet 使用 .test 顶级域名为你的项目提供服务。例如，如果你要使用 .app 而不是 .test ，就运行 valet domain app ，Valet 会自动将站点域名改为 *.app 。

Valet 提供两个命令来为 Laravel 的站点提供服务：park 和 link 。

##### park 命令
1. mkdir ~/projects,  cd ~/projects
2. 执行 valet park
3. 在projects目录中新建site1，然后再往site1放个index.php

浏览器打开`http://site1.test` 就能访问到


##### link 命令
可以针对某目录中提供单个站点而不是整个目录。

比如切换到 /projects/symfony-demo。默认可以通过`http://symfony-demo.test` 打开该站点。
如果需要自定义，可以在该目录下执行 `valet link my-symfony`
会有提示 `A [my-symfony] symbolic link has been created in [/Users/mafei/.config/valet/Sites/my-symfony].`

然后就可以通过浏览器`http://my-symfony.test` 访问到了。不要忘了后缀。

##### 支持Yii2项目
Valet 本身提供了很多开源项目，如Laravel，Lumen， Drupal，Wordpress等，但不支持Yii2项目。
网上有现成的 [驱动](https://github.com/incodenz/yii2-valet-driver) 实际就是告诉Valet项目的项目的根目录在哪。
比如有一个Yii2的项目，绝对路径是`~/sites/gee`
来到`~/sites/gee/frontend/web` 这是Yii2项目默认的前台入口目录，执行  `valet link gee`
再来到`~/sites/gee/backend/web` 执行  `valet link admin.gee`
我们就可以通过`http://gee.test`打开前台，`http://admin.gee.test`打开后台
##### 参考：
https://learnku.com/docs/laravel/5.6/valet/1356#the-park-command
