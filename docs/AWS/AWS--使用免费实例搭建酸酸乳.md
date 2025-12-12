1. 注册AWS账户，略，需要信用卡
2. 底部切换语言为中文简体，右上角选择切换地区为亚太的一个，这里我选择的新加坡
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-f46daf09bb451820.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

3. 进到 [管理控制台](https://console.aws.amazon.com/console/home)，选择启动虚拟机

> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-dc1fde154ebedafc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

选择ES2，创建一台服务器实例
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-9a0eb276ed28d34c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

注意勾选“仅免费套餐”，这里选择的是比较新的Ubuntu Server 18.04

4. 配置选1核1G就行，直接点击“审核和启动”
5. 没有密钥对的话，先生成一个，会下载一个pem格式的文件，保存好，待会儿登录服务器要用到
6. 如果是Windows系统，下载 MobaXterm 软件，根据提示连接主机
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-a578280d5b90013b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

或者配置ssh config
```
Host aws-seoul
    HostName ec2-170-82-55.ap-northeast-2.compute.amazonaws.com
    User ubuntu
    Port 22
    IdentityFile ~/.ssh/aws-seoul.pem
```
7. 登录成功
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-5115f2734118cd83.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
8. 依次执行下面的命令，会让你设置密码，端口和加密方式(默认)
```
sudo wget --no-check-certificate https://raw.githubusercontent.com/teddysun/shadowsocks_install/master/shadowsocks-go.sh
sudo chmod +x shadowsocks-go.sh
sudo ./shadowsocks-go.sh 2>&1 | tee shadowsocks-go.log
```
安装成功后记录好信息
打开酸酸乳客户端，填入信息
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-e8cf2147fb310cee.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
9. 连接成功！
10. 如果无法连接，在AWS后台添加安全组，编辑入站规则，端口填写刚SSR设置的端口
在EC2控制面板，进入到了实例的安全组设置中。
在左下部点击 “入站” 标签页，并点击编辑。点击 “添加规则”，添加的规则中“类型”“协议” 都不需要改动。“端口范围”这里填上我们前面设置的端口，“来源”下拉框中选择“任何位置”。

11. 接下来还需要给服务器申请一个固定IP。点击弹性IP -> 分配新地址 -> 操作 -> 关联地址 。选择自己的实例并关联。

> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-13f2e3269e94f588.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

参考：[https://www.cnblogs.com/MingyaoZheng-blog/p/9786306.html](https://www.cnblogs.com/MingyaoZheng-blog/p/9786306.html)
