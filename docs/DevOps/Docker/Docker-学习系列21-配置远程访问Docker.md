Docker 为 Client/Server 架构。
* 服务端为 docker daemon (daemon是守护进程的意思，进程名叫dockerd)。 
docker daemon 支持三种方式的连接(unix，tcp 和 fd)。默认只使用第一种，监听`/var/run/docker.sock` unix套接字文件。

* 客户端为docker.service。
一般情况下客户端和服务端运行在同一主机上，但有时候我们需要连接远程某服务器的Docker，其实和mysql有点类似。比如mysql的守护进程叫mysqld。监听3306端口，跑在一台服务器上，我们本地客户端通过IP及3306端口连接mysqld服务端，就可以操作他了。
类似的，这就需要docker daemon开放tcp，要做如下设置。

> 注意，这样会不安全，如果你的docker daemon运行在公网上面，一旦开了监听端口，任何人都可以远程连接到docker daemon服务器进行操作）

配置远程访问Docker官方文档有详细教程 [https://docs.docker.com/install/linux/linux-postinstall/](https://docs.docker.com/install/linux/linux-postinstall/)

有两种方法一种是修改系统的 systemd 另一种是修改 Docker 的 daemon.json
两种方式选择一种即可，都修改会有冲突，官方建议使用第二种方式。

#### 修改 systemd unit 文件允许远程访问
1. `sudo systemctl edit docker.service` 打开文件
2. 添加或修改下面的
```ini
[Service]
ExecStart=
ExecStart=/usr/bin/dockerd -H fd:// -H tcp://127.0.0.1:2375
```

3. 保存，重启Docker `sudo systemctl daemon-reload`  `sudo systemctl restart docker.service`
4. 检查 `sudo netstat -lntp | grep dockerd` 会发现 Dockerd正在监听 2375 端口

#### 修改 daemon.json 允许远程访问
1. 打开Docker守护端的配置文件 `sudo vi /etc/docker/daemon.json`，检查host配置
2. 讲host部分内容修改如下
```json
{
  "hosts": ["unix:///var/run/docker.sock", "tcp://127.0.0.1:2375"]
}
```
3. 同上，重启，然后检查端口

> 在 daemon.json 中设置 hosts 并不支持Windows和Mac Docker 桌面版

关于daemon.json 的具体配置，见[官方文档]([https://docs.docker.com/engine/reference/commandline/dockerd/](https://docs.docker.com/engine/reference/commandline/dockerd/)
)

在任何装了docker客户端的机器上，测试 `docker -H tcp://192.168.3.201:2375 ps`

192.168.3.201 是刚才运行docker daemon的机器，如果连不上，检查防火墙是否开放了2375端口

#### 注意
如果你修改了`daemon.json`，手动重启dockerd进程时也带了参数，比如`dockerd --debug \
  --host tcp://192.168.59.3:2376` 可能会报错，即配置冲突，这时就需要用上面提到的方法，即创建`docker.conf`文件
另外查看日志分析错误的命令:
```
sudo dockerd --debug 
sudo journalctl -r -u docker
```

#### 错误记录
##### failed to start daemon: error while opening volume store metadata database: timeout
`ps axf | grep docker | grep -v grep | awk '{print "kill -9 " $1}' | sudo sh`
sudo dockerd --debug
```
# 其他方法
sudo systemctl start docker
sudo kill -SIGHUP $(pidof dockerd)
```
你会发现dockerd其实暴露了很多API接口，比如获取和操作images，container的，还暴露了一个_ping接口，用于测试连通性，直接使用
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-bd3c144478b66781.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

`curl http://ip:2375/_ping` 如果连通正常，返回OK

具体API参见：[https://docs.docker.com/engine/api/v1.40](https://docs.docker.com/engine/api/v1.40)

#### 安全性
允许Docker远程访问后一定要设置好防火墙或者用nignx加一层反向代理，也可以开启https访问，不过要生成证书，具体见下面参考中的链接。

#### 参考 
* [daemon](https://docs.docker.com/config/daemon/)
* [dockerd](https://docs.docker.com/engine/reference/commandline/dockerd/#daemon-configuration-file)
* [docker配置TLS认证开启远程访问](https://tankeryang.github.io/posts/docker%E9%85%8D%E7%BD%AETLS%E8%AE%A4%E8%AF%81%E5%BC%80%E5%90%AF%E8%BF%9C%E7%A8%8B%E8%AE%BF%E9%97%AE/)
* [https://docs.docker.com/engine/security/https/](https://docs.docker.com/engine/security/https/)
