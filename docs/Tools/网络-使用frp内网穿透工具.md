之前分享过一个 [ngrok内网穿透工具](https://www.jianshu.com/p/c34e8a1119ac)，这个不是开源的，再推荐一个国人开发的免费开源工具 [frp](https://github.com/fatedier/frp/blob/master/README_zh.md)，配置项更多，功能更强大。
不过需要你有一台公网IP的服务器，如果要访问内网的web服务，还需要一个域名。

### 准备
* 公网服务器，假设 系统 Linux Ubuntu,  公网IP 140.140.192.192， 绑定了域名 www.good.com
* 本机 Mac 系统，跑着一个Angular程序，在本地访问，地址是 localhost:4200

### 效果
利用frp，可以实现任何人都可以通过配置的端口如 `www.good.com:7001` 访问我本机的Angular程序

### 方法
1. 服务器和内网本机分别[下载](https://github.com/fatedier/frp/releases)对应系统平台的frp，
这里ubuntu服务器需要下载linux_arm_64， mac本机是darwin_amd64。
2. 先配服务端，在服务器上下载解压，编辑 frps.ini， 然后启动 `./frps -c ./frps.ini`
后台启动命令 `nohup ./frps -c ./frps.ini &`
```
[common]
bind_port = 7000
# 客户端定义的端口
vhost_http_port = 7001
```
3. 配置客户端，同样下载解压
```
wget https://github.com/fatedier/frp/releases/download/v0.23.1/frp_0.23.1_darwin_amd64.tar.gz
tar -zxvf  frp_0.23.1_darwin_amd64.tar.gz
```
编辑 `frpc.ini`
```
[common]
server_addr = 140.140.192.192   #公网服务器ip
server_port = 7001                       #与服务端bind_port一致
 
#公网访问内部web服务器以http方式
[web]
type = http         #访问协议
local_port = 4200   #内网web服务的端口号
custom_domains = www.good.com   #所绑定的公网服务器域名，一级、二级域名都可以
```
4. 浏览器打开 www.good.com:4300 测试
### 进阶
修改服务端的 frps.ini， 添加 dashboard 信息，重启启动后可以通过`140.140.192.192:7500`打开控制面板
```
[common]
bind_port = 7000
# 客户端定义的端口
vhost_http_port = 7001

dashboard_port = 7500
# dashboard 用户名密码，默认都为 admin
dashboard_user = admin
dashboard_pwd = admin
```
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-f1561d0838b92e15.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


### 注意事项
> 报 Invalid Host header

如果本机的web项目用了webpack server(目前vue cli, react cli, angular 本地开发用的都是这个) 
这个是webpack server的安全策略，如果是angular项目，需要在启动配置中加上 `--disable-host-check` 类似 `ng serve --open --host $IP --port $PORT --disable-host-check`

### 参考
https://blog.csdn.net/u013144287/article/details/78589643/
