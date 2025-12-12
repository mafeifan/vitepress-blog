亚马逊 AWS(Amazon Web Service) 占据全球四成公有云市场份额(2021年统计)，排名第一

包含的产品多余牛毛
![](https://pek3b.qingstor.com/hexo-blog/20220228110738.png)

很多国外用户都在使用AWS的产品，著名的有S3，EC2，所有有必要了解一下。

这里介绍最基础的产品，VPC(Virtual Private Cloud)，虚拟私有云。

先看下一些基础概念

## 地域 Region
AWS 在世界各地有很多数据中心，一个 Region 就是多个数据中心的集群

目前在中国大陆地区有北京和宁夏两个 Region

## 可用区 AZ（Availability Zone）

每个 Region 中包含数个独立的，物理分隔开的 AZ（Availability Zone），每个 AZ 有独立的供电，制冷，安保。

同一 Region 内 AZ 之间由高带宽，极低延时的光纤网络相连，数据以加密形式传输。

ap-northeast-1 是 region 名称

ap-northeast-1a,ap-northeast-1c,ap-northeast-1d 是 AZ

你可以理解为北京Region cn-north-1，朝阳区有个AZ:cn-north-1c，海淀区有个AZ:cn-north-1d
同一Region下的AZ之间由高速网络连接，重要的数据可以放到多AZ里，假如朝阳区机房停电或失火，通过配置流量和数据可以使用海淀区的。
这就是简单的容灾备份。

## 虚拟私有网络 VPC

VPC（Amazon Virtual Private Cloud）是用户在 Region 中自定义的虚拟网络，是一个整体概念。

用户可以在一个 Region 中创建多个 VPC。

我们可以在 VPC 中选择 IP 网段，创建 Subnet，指定 Route Table，控制 ACL（Access Control list），设置网关等。

![](https://pek3b.qingstor.com/hexo-blog/20220228124658.png)

#### 多业务系统隔离

如果在一个地域的多个业务系统需要通过VPC进行严格隔离，例如，生产环境和测试环境，那么也需要使用多个VPC。

同样可以通过使用高速通道、VPN网关、云企业网等产品实现同地域VPC间互通。

![](https://pek3b.qingstor.com/hexo-blog/20220126133256.png)

#### 多地域部署系统

VPC是地域级别的资源，不支持跨地域部署。当有多地域部署系统的需求时，必须使用多个VPC。
可以通过使用高速通道、VPN网关、云企业网等产品实现跨地域VPC间互通。

![](https://pek3b.qingstor.com/hexo-blog/20220126134054.png)


![](https://pek3b.qingstor.com/hexo-blog/20220124175501.png)

当 VPC 创建完成后主路由表 和 Main network ACL 会自动创建。

用户可以在公有云上创建一个或者多个VPC，比如，一个大公司里每个部门分配一个VPC。对于需要连通的部门创建VPC连接。

IP段用CIDR表示

## CIDR

无类别域间路由（Classless Inter-Domain Routing、CIDR）是一个用于给用户分配IP地址以及在互联网上有效地路由IP数据包的对IP地址进行归类的方法。

遵从CIDR规则的地址有一个后缀说明前缀的位数，例如：192.168.0.0/16。这使得对日益缺乏的IPv4地址的使用更加有效。

也就是说，创建子网时要考虑你需要的资源数

| IP/CIDR |掩码| 主机数 |
| :-----| :---- | :----: |
| a.b.c.d/32   | 255.255.255.255 | 1 |
| a.b.c.0/28   | 255.255.255.240 | 16 |
| a.b.c.0/24   | 255.255.255.000 | 256 |
| a.b.0.0/16   | 255.255.000.000 | 65,536 |

## Subnet

子网是 VPC 中的 IP 地址范围。在创建 VPC 之后，可以在每个可用区中添加一个或多个子网。

我们一般创建两种子网 Private Subnet 和 Public Subnet。

简单来说，不能直接访问 internet 互联网的 Subnet 就是 Private Subnet，能直接访问 internet 的就是 Public Subnet。

当然 Private Subnet 也可以通过 NAT 的方式访问 internet

当我们在一个 VPC 中创建 Subnet 时需要给 Subnet 选择一个 AZ（Availability Zone），一个 Subnet 只能选择建在一个 AZ 中。

![](https://pek3b.qingstor.com/hexo-blog/20220124180035.png)

## 实战

![](https://pek3b.qingstor.com/hexo-blog/20220124175651.png)

实现图上的功能，创建两个子网

* 一个是 Public Subnet，可以访问因特网，另一个是 Private Subnet
* 一个是 Private Subnet，不能访问因特网

### 创建VPC

IPv4 CIDR: 192.168.0.0/16

name: finley-vpc

### 创建互联网网关

name: finley-internet-gateway

并attach到finley-vpc上

### 创建三个子网

分别为 public, private, public&private（私网通过NAT访问公网）

![](https://pek3b.qingstor.com/hexo-blog/20220124205316.png)

| subnet id | IPV4 CIDR | AZ | 用途
| :-----| :---- | :---- | 
| finley-public | 192.168.0.0/24 | ap-northeast-1a | 部署web服务器
| finley-private| 192.168.2.0/24 | ap-northeast-1d | 部署数据库
| finley-private&public | 192.168.1.0/24| ap-northeast-1c| 部署应用程序

![](https://pek3b.qingstor.com/hexo-blog/20220124210016.png)

### 创建两个路由表

路由表包含一组称为路由的规则，用于确定来自子网或网关的网络流量定向到何处。

路由表必须属于某VPC

一个公有子网，一个私有子网但可通过NAT访问公网

name: finley-public

编辑路由表

![](https://pek3b.qingstor.com/hexo-blog/20220124212059.png)

```
# 第一条表示到192.168.*.*的请求会发送至VPC中
192.168.0.0/16	local

# 第二条表示到其它IP的请求会发送至IGW
0.0.0.0/0	igw-0d1092780f692f46f 
```

编辑子网关联

![](https://pek3b.qingstor.com/hexo-blog/20220124212211.png)

创建第二个路由

name: finley-private

![](https://pek3b.qingstor.com/hexo-blog/20220124212410.png)

编辑子网关联，选择finley-private&public

### 创建EC2

创建两个EC2，一个名为finley-public-ec2，一个finley-private-ec2

VPC选择finley-vpc

![](https://pek3b.qingstor.com/hexo-blog/20220124213225.png)

申请弹性IP，得到公网IP：52.197.152.165 并关联给 finley-public-ec2

| 实例名 | 公有 IPv4 地址 | 私有 IPv4 地址
| :-----| :---- | :---- | 
| finley-public-ec2 | 52.197.152.165 | 192.168.0.107
| finley-private-ec2| 无 |192.168.2.197

> EIP（Elastic IP）是AWS提供的静态公共IP，可以从internet上访问到。实例即便被删除IP也会保留

![](https://pek3b.qingstor.com/hexo-blog/20220124214203.png)

SSH `ssh -i "aws-ty-2022.pem" ubuntu@52.197.152.165` 登录实例

> aws-ty-2022.pem 私钥是之前申请过的

检查网络配置，安装nginx或httpd，浏览器打开52.197.152.165，访问成功

```bash
ubuntu@ip-192-168-0-93:~$ ifconfig
eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 9001
        inet 192.168.0.93  netmask 255.255.255.0  broadcast 192.168.0.255
        inet6 fe80::4c3:76ff:feef:971  prefixlen 64  scopeid 0x20<link>
        ether 06:c3:76:ef:09:71  txqueuelen 1000  (Ethernet)
        RX packets 2795  bytes 2887062 (2.8 MB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 1519  bytes 178671 (178.6 KB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions
```

finley-private-ec2  只有一个私网地址，由于我们选择private子网

会得到一个私网地址，如192.168.2.197，即使有公网IP，也无法通过互联网访问

可以通过finley-public-ec2登录这个私有子网的实例

```
# 在本机执行
## 上传私钥到public ec2
scp ~/.ssh/aws.pem 52.197.152.165:~
## 登录public ec2
ssh -i ~/.ssh/aws.pem 52.197.152.165
# 在 public ec2 上执行
chmod 400 aws.pem
## 登录private-ec2
ssh -i ~/.ssh/aws.pem 192.168.2.197
# 进到私网实例，确实无法访问互联网
wget www.baidu.com
```

### 通过NAT网关使私有子网访问互联网

> 注意NAT是按小时收费的，用完及时释放

NAT 网关是一种网络地址转换 (NAT) 服务。可以使用 NAT 网关，以便私有子网中的实例可以连接到 VPC 外部的服务，但外部服务无法启动与这些实例的连接。

路由器将互联网流量从私有子网中的实例发送到 NAT 网关。NAT 网关通过使用自身的弹性 IP 地址作为源 IP 地址，将流量发送到互联网网关。

### 创建 NAT网关

NAT网关要创建在公有子网当中， 选择一个公有子网，创建成功后等待状态变为可用

参考：[计算机网络](https://weread.qq.com/web/reader/af532c005a007caf51371b1kf4b32ef025ef4b9ec30acd6)

![](https://pek3b.qingstor.com/hexo-blog/20220709070009.png)

### 

修改路由表，等状态变为available

| 目的地 | 目标 | 
| :-----| :---- | 
| 192.168.0.0/16	 | 本地
| 0.0.0.0/02| nat-gateway-id

此时finley-private-ec2可以访问互联网了，是通过NAT关联的IP

![](https://pek3b.qingstor.com/hexo-blog/20220124211624.png)

### 通过终端节点让私有网络访问aws服务(S3)

VPC 终端节点使您能够在 Virtual Private Cloud (VPC) 与支持的服务和之间建立连接，而无需使用互联网网关、NAT 设备、VPN 连接或 AWS Direct Connect 连接。

因此，VPC 不会对公有 Internet 公开。

实现私有地址访问公有服务，这里我们让私有子网中的实例访问S3服务，首先创建终端节点

![](https://pek3b.qingstor.com/hexo-blog/20220125223600.png)

实际上是添加了一条路由表信息

![](https://pek3b.qingstor.com/hexo-blog/20220125223815.png)

访问S3并下载文件成功

![](https://pek3b.qingstor.com/hexo-blog/20220125232150.png)

### VPC peering 对等连接

VPC 对等连接是两个 VPC 之间的网络连接

可以在自己的 VPC 之间创建 VPC 对等连接，或者在自己的 VPC 与其他AWS账户中的 VPC 之间创建连接

VPC 可位于不同区域内（也称为区域间 VPC 对等连接）。

例如，如果您有多个AWS账户，则可以通过在这些账户中的 VPC 间建立对等连接来创建文件共享网络。

您还可以使用 VPC 对等连接来允许其他 VPC 访问您某个 VPC 中的资源。

## 总结

* 首先我们选择Region，随后所有创建的内容都是存在此Region中
* 创建VPC，一个虚拟网络，在里面设置IP段，VPC是一个逻辑结构，并不和AZ（Availability Zone）直接相关
* 在VPC中创建Subnet，需指定IP段，并且指定所在的AZ，一个Subnet只能指定一个AZ，一个AZ可以容纳多个Subnet
* VPC中Subnet默认是可以相互访问的
* 新建的Subnet默认就是Private Subnet
* IGW(Internet gate way)是一个独立的组件配置在VPC上，使得VPC可以访问internet
* 在Private Subnet中配置了到IGW的路由后，就变成Public Subnet
* Public Subnet中的EC2还要再配置一个Public IP或者EIP就可以访问Internet
* 如果EC2可以访问internet，其关联的Security Group入站规则如果允许从internet访问，那么这个EC2就可以从internet中直接访问到
* 实践中我们把应用程序，数据库放在Private Subnet中，阻止从internet访问。把堡垒机和ALB（Application Load balancer）放在Public Subnet，允许从internet访问
* 配置了NAT路由的Private Subnet中EC2可以访问internet，但不能被internet访问到,因为这个EC2并没有IP，流量是通过NAT转换了，NAT有IP
* NAT gateway需要一个EIP（Elastic IP）并且把NAT配置在Public Subnet中
* 有时候Private Subnet中的EC2虽然不能访问外部internet，也需要访问特定服务如S3，RDS，这时候可以创建End Point
* 创建End Point需要选择Service种类，VPC,路由表，实际上会在选择的路由表上添加一条记录，前缀是vpce-
* 每个Subnet都必须关联一个路由表，创建的每个Subnet都会自动关联 VPC 的主路由表
* 创建Security Group时，只需指定VPC。之后可以把SG与EC2， RDS, VPC Endpoint相关连，用来控制这些服务的出入站IP和端口
* 所有 IPv4 流量 (0.0.0.0/0)，IPv6 流量 (::/0)

## 参考

https://aws.amazon.com/cn/vpc/faqs/

https://help.aliyun.com/document_detail/54095.html

https://docs.aws.amazon.com/zh_cn/vpc/latest/userguide/VPC_Subnets.html

https://www.bilibili.com/video/BV1wk4y1r7gX

https://www.iloveaws.cn/3707.html

https://zh.wikipedia.org/zh-hans/%E6%97%A0%E7%B1%BB%E5%88%AB%E5%9F%9F%E9%97%B4%E8%B7%AF%E7%94%B1

