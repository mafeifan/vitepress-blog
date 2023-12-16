## 什么是RabbitMQ？
RabbitMQ是基于[AMQP协议](https://zh.wikipedia.org/wiki/%E9%AB%98%E7%BA%A7%E6%B6%88%E6%81%AF%E9%98%9F%E5%88%97%E5%8D%8F%E8%AE%AE)的消息队列服务软件，
主要支持高级消息队列 0-9-1 版本，可以通过插件支持1.0版本协议。

## 什么是AMQP 0-9-1？
AMQP 0-9-1是高级消息队列协议，是一种消息传递协议，它使符合要求的客户端应用程序能够与符合要求的消息传递中间件代理进行通信，AMQP规范了消息传递方和接收方的行为，以使消息在不同的提供商之间实现互操作性，就像SMTP，HTTP，FTP等协议可以创建交互系统一样。
类似的协议还有MQTT，XMPP等。

## RabbitMQ的优点

* 开源，支持多种消息协议的消息传递
* 插件系统，通过插件可以实现TLS，LDAP等
* 附带了一个易于使用的可视化管理工具，还有方便的命令行工具和HTTP API
* 支持集群
	
## 安装

RabbitMQ支持MacOS，Linux，Windows等多平台

如果你只是想尝鲜在本地跑跑玩玩，做做实验什么的，最推荐的方式是使用Docker安装

`docker run -it --rm --name RabbitMQ -p 5672:5672 -p 15672:15672 RabbitMQ:3-management`

注意这里的docker tag是3-management表示使用最新的3.x版本并安装management插件，这个插件提供了基于浏览器网页的UI界面，
可以非常直观的查看连接数，队列情况，甚至可以在线发消息

运行之后浏览器打开 `localhost:15672`，用户名密码都是guest

![](https://gitee.com/Finley/upic/raw/master/picGo/20210403222228.png)

登录成功进入主界面，几个tab分别是，Overview总览，Connections连接，Channels频道，Exchanges交换机，Queues队列和Admin管理

![](https://gitee.com/Finley/upic/raw/master/picGo/20210403222307.png)

对于其他平台的安装方式，详见[官网](https://www.rabbitmq.com/download.html)
需要注意RabbitMQ使用Erlang编程语言开发的，一般先要安装Erlang及其环境


## Ubuntu 18.04下安装RabbitMQ

参考的官网`https://www.rabbitmq.com/install-debian.html`

```shell script
sudo apt-get install curl gnupg debian-keyring debian-archive-keyring apt-transport-https -y
# primary RabbitMQ signing key
curl -fsSL https://github.com/rabbitmq/signing-keys/releases/download/2.0/rabbitmq-release-signing-key.asc | sudo apt-key add -

# Launchpad PPA signing key for apt
sudo apt-key adv --keyserver "keyserver.ubuntu.com" --recv-keys "F77F1EDA57EBB1CC"

# primary RabbitMQ signing key
sudo apt-key adv --keyserver "hkps://keys.openpgp.org" --recv-keys "0x0A9AF2115F4687BD29803A206B73A36E6026DFCA"

# Launchpad PPA signing key for apt
sudo apt-key adv --keyserver "keyserver.ubuntu.com" --recv-keys "F77F1EDA57EBB1CC"

# This Launchpad PPA repository provides Erlang packages produced by the RabbitMQ team
deb http://ppa.launchpad.net/rabbitmq/rabbitmq-erlang/ubuntu bionicmain
deb-src http://ppa.launchpad.net/rabbitmq/rabbitmq-erlang/ubuntu bionic main

sudo apt-get update -y

# This is recommended. Metapackages such as erlang and erlang-nox must only be used
# with apt version pinning. They do not pin their dependency versions.
sudo apt-get install -y erlang-base \
                        erlang-asn1 erlang-crypto erlang-eldap erlang-ftp erlang-inets \
                        erlang-mnesia erlang-os-mon erlang-parsetools erlang-public-key \
                        erlang-runtime-tools erlang-snmp erlang-ssl \
                        erlang-syntax-tools erlang-tftp erlang-tools erlang-xmerl

# 安装服务端

sudo apt-get install rabbitmq-server

# 检测运行状态

sudo service rabbitmq-server status

# 也可以用这个

sudo rabbitmq-diagnostics ping

# 自带一个诊断命令

sudo rabbitmq-diagnostics status
```

列出很多有用的信息
```
Status of node rabbit@VM-16-4-ubuntu ...
Runtime

OS PID: 28556
OS: Linux
Uptime (seconds): 360668
Is under maintenance?: false
RabbitMQ version: 3.8.14
Node name: rabbit@VM-16-4-ubuntu
Erlang configuration: Erlang/OTP 23 [erts-11.2] [source] [64-bit] [smp:2:2] [ds:2:2:10] [async-threads:1]
Erlang processes: 459 used, 1048576 limit
Scheduler run queue: 1
Cluster heartbeat timeout (net_ticktime): 60

Plugins

Enabled plugin file: /etc/rabbitmq/enabled_plugins
Enabled plugins:

 * rabbitmq_management
 * amqp_client
 * rabbitmq_web_dispatch
 * cowboy
 * cowlib
 * rabbitmq_management_agent

Data directory

Node data directory: /var/lib/rabbitmq/mnesia/rabbit@VM-16-4-ubuntu
Raft data directory: /var/lib/rabbitmq/mnesia/rabbit@VM-16-4-ubuntu/quorum/rabbit@VM-16-4-ubuntu

Config files


Log file(s)

 * /var/log/rabbitmq/rabbit@VM-16-4-ubuntu.log
 * /var/log/rabbitmq/rabbit@VM-16-4-ubuntu_upgrade.log

Alarms

(none)

Memory

Total memory used: 0.0961 gb
Calculation strategy: rss
Memory high watermark setting: 0.4 of available memory, computed to: 3.2785 gb

code: 0.0331 gb (33.93 %)
other_proc: 0.0303 gb (31.04 %)
other_system: 0.0134 gb (13.71 %)
allocated_unused: 0.011 gb (11.29 %)
other_ets: 0.0033 gb (3.43 %)
plugins: 0.0025 gb (2.61 %)
binary: 0.0015 gb (1.54 %)
atom: 0.0015 gb (1.49 %)
mgmt_db: 0.0004 gb (0.38 %)
metrics: 0.0002 gb (0.24 %)
connection_other: 0.0001 gb (0.1 %)
mnesia: 0.0001 gb (0.1 %)
quorum_ets: 0.0 gb (0.05 %)
msg_index: 0.0 gb (0.03 %)
connection_readers: 0.0 gb (0.02 %)
queue_procs: 0.0 gb (0.02 %)
connection_channels: 0.0 gb (0.01 %)
connection_writers: 0.0 gb (0.0 %)
queue_slave_procs: 0.0 gb (0.0 %)
quorum_queue_procs: 0.0 gb (0.0 %)
reserved_unallocated: 0.0 gb (0.0 %)

File Descriptors

Total: 3, limit: 32671
Sockets: 1, limit: 29401

Free Disk Space

Low free disk space watermark: 0.05 gb
Free disk space: 34.4991 gb

Totals

Connection count: 1
Queue count: 1
Virtual host count: 1

Listeners

Interface: [::], port: 25672, protocol: clustering, purpose: inter-node and CLI tool communication
Interface: [::], port: 5672, protocol: amqp, purpose: AMQP 0-9-1 and AMQP 1.0
Interface: [::], port: 15672, protocol: http, purpose: HTTP API
```

安装并启用rabbitmq_management插件

`sudo rabbitmq-plugins enable rabbitmq_management`

添加一个名为admin的用户，密码是123456

`sudo rabbitmqctl add_user admin 123456`

把admin用户设置为管理员权限

`sudo rabbitmqctl set_user_tags admin administrator`

分配admin用户的虚拟主机为/, 虚拟主机是为了隔离用户，类似命名空间，后面的*分别为配置，写，读权限

`sudo rabbitmqctl set_permission -p "/" admin ".*" ".*" ".*"`

RabbitMQ正常启动后会占用一些端口，5672 amqp 协议占用，15672 可以通过浏览器打开，注意防火墙要开启相应的端口

## 参考
* https://www.RabbitMQ.com/
* http://RabbitMQ.mr-ping.com/
* https://registry.hub.docker.com/_/rabbitmq/
* https://blog.csdn.net/weixin_43533358/article/details/83448357
