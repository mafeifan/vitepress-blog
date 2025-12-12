#### Jenkins run in Docker 问题
1. 通过docker 跑的 Jenkins 安装插件失败 `Also:   java.lang.Throwable: HttpInput failure`
可能是Docker配置的网络问题
第二天，又自己好了。。

[https://issues.jenkins-ci.org/browse/JENKINS-58073?page=com.atlassian.jira.plugin.system.issuetabpanels%3Aall-tabpanel](https://issues.jenkins-ci.org/browse/JENKINS-58073?page=com.atlassian.jira.plugin.system.issuetabpanels%3Aall-tabpanel)

#### 插件

[Publish Over SSH](https://wiki.jenkins.io/display/JENKINS/Publish+Over+SSH+Plugin) 

* `Remote directory` 参数问题

Publish Over SSH是款很常用的插件，一般用于通过SSH将构建后的文件传到远程主机上。
其中的`Remote directory`选项是相对的登录后的路径。而不是远程主机的全路径
比如你登录主机后的pwd是`/home/mafei/`。即便你在Jenkins配置中填的`Remote directory`是`/var/www`。
执行后的实际路径是 `/home/mafei/var/www`

* execCommand 是要在远程主机上执行的shell命令

有两种方式：

第一种，在远程主机上放一个sh文件里面包含所有要在主机上执行的操作，比如`deploy.sh`
`execCommand: '''sh deploy.sh''' `

第二种，把具体命令都写execCommand里面
下面的脚本有一定的通用性，首先将之前步骤构建的dist压缩，上传到远程服务器，然后在远程上执行下面的命令，先重命名老的dist，然后将新的压缩包解压
```
execCommand: '''
# sh deploy.sh
# 这里可以定义变量
# DEST_PATH 项目的发布路径
DEST_PATH=/var/www/web/
TODAY=$(date +%Y%m%d-%H%M%S)

cp -rf dist.gz $DEST_PATH
cd $DEST_PATH
tar -zcvf $TODAY-dist.gz dist
rm -rf dist
tar -xzvf dist.gz
'''
```

* 使用注意事项：
1. Source files(要上传的文件) 和 Exec command(要在远程服务器执行的命令) 至少有一个必填的,
如果 Source files 为空，什么也不会传
2. Source files, Remove prefix, Remote directory 和 Exec command  这几个参数，可以使用 Jenkins  的environment variables 和 build parameters.

##### Extended E-mail Notification

配置Gmail
勾选 SSL，端口填写 465
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-5252e11e4087c7c5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

首次登陆 Google 会阻止，建议调低安全
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-c3f6ff50feddb0c8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
