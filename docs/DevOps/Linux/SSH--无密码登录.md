![](https://pek3b.qingstor.com/hexo-blog/hexo-blog/20201118110408.png)

虎符： 古代皇帝调兵遣将用的兵符，用青铜或者黄金做成伏虎形状的令牌，劈为两半，其中一半交给将帅，另一半由皇帝保存。只有两个虎符同时合并使用，持符者即获得调兵遣将权。

![](https://pek3b.qingstor.com/hexo-blog/hexo-blog/20201118110516.png)

ssh key跟虎符类似

通过ssh-keygen命令生成公钥文件和私玥文件，私玥存本地，不告诉其他人。
把公钥放到需要认证的服务器。然后通过ssh登录，会进行公私钥认证。匹配成功即实现无密码登录。
同理把公钥放到如github，码云等提供git仓库的服务商。就能实现ssh协议非账号密码pull push代码。

机器A 向 机器B 进行免密码登陆

## 流程

### 1. 生成公私钥对 

机器A执行，修改邮箱 
`ssh-keygen -t rsa -b 4096 -C "finley@mymac.com"`

一般一路回车，默认会在当前用户目录创建.ssh目录并生成id_ras私钥和id_ras.pub公钥
为了无密码登录服务器，需要将公钥上传到服务器的`authorized_keys`的文件中
就是说我用ssh方式敲你的门，我提供私钥，你提供公钥，算法匹配成功，就让我进去。

### 2. 添加公钥到机器B

不推荐手动拷贝，建议使用`ssh-copy-id`命令

如果对方机器SSH端口是22，不用特别指定

`ssh-copy-id -i ~/.ssh/id_rsa.pub 用户名@对方机器IP`

指定端口

`ssh-copy-id -i ~/.ssh/id_rsa.pub -p 5722 用户名@对方机器IP`

这个过程是将本地公钥加写到机器B的 ~/.ssh/authorized_keys 文件
这次需要输入机器B的登录密码

### 修改本地的`~/.ssh/config`添加连接配置项

```
Host cloud my
    HostName 140.xxx.xxx.183
    User ubuntu
    Port 22
    IdentityFile ~/.ssh/id_rsa
```

### 测试
机器A执行`ssh cloud`或`ssh my`查看是否可以顺利登录

## 排错

1.公钥拷贝成功了，还让输入帐号密码

答：尝试设置文件权限
```
    //用户权限
    chmod 700 /home/username

    //.ssh文件夹权限
    chmod 700 ~/.ssh/

    // ~/.ssh/authorized_keys 文件权限
    chmod 600 ~/.ssh/authorized_keys
```
2.检查ssh服务配置文件

vim /etc/ssh/sshd_config

```
// 这行可能被注释了，开启
RSAAuthentication yes
PubkeyAuthentication yes

#禁用root账户登录，如果是用root用户登录请开启
PermitRootLogin yes
```

重启服务`sudo systemctl restart sshd.service`

3.加 -v 参数，查看调试信息
ssh cloud -vvv


## 参考

https://www.cnblogs.com/guanyf/p/10600458.html
