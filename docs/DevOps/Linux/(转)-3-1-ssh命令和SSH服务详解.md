原文：http://www.cnblogs.com/f-ck-need-u/p/7129122.html
本文对SSH连接验证机制进行了非常详细的分析，还详细介绍了ssh客户端工具的各种功能，相信能让各位对ssh有个全方位较透彻的了解，而不是仅仅只会用它来连接远程主机。
#### 1.1 非对称加密基础知识
对称加密：加密和解密使用一样的算法，只要解密时提供与加密时一致的密码就可以完成解密。例如QQ登录密码，银行卡密码，只要保证密码正确就可以。

非对称加密：通过公钥(public key)和私钥(private key)来加密、解密。公钥加密的内容可以使用私钥解密，私钥加密的内容可以使用公钥解密。一般使用公钥加密，私钥解密，但并非绝对如此，例如CA签署证书时就是使用自己的私钥加密。在接下来介绍的SSH服务中，虽然一直建议分发公钥，但也可以分发私钥。

所以，如果A生成了(私钥A，公钥A)，B生成了(私钥B，公钥B)，那么A和B之间的非对称加密会话情形包括：

(1).A将自己的公钥A分发给B，B拿着公钥A将数据进行加密，并将加密的数据发送给A，A将使用自己的私钥A解密数据。

(2).A将自己的公钥A分发给B，并使用自己的私钥A加密数据，然后B使用公钥A解密数据。

(3).B将自己的公钥B分发给A，A拿着公钥B将数据进行加密，并将加密的数据发送给B，B将使用自己的私钥B解密数据。

(4).B将自己的公钥B分发给A，并使用自己的私钥B加密数据，然后A使用公钥B解密数据。

虽然理论上支持4种情形，但在SSH的身份验证阶段，SSH只支持服务端保留公钥，客户端保留私钥的方式，所以方式只有两种：客户端生成密钥对，将公钥分发给服务端；服务端生成密钥对，将私钥分发给客户端。只不过出于安全性和便利性，一般都是客户端生成密钥对并分发公钥。后文将给出这两种分发方式的示例。

#### 1.2 SSH概要
(1).SSH是传输层和应用层上的安全协议，它只能通过加密连接双方会话的方式来保证连接的安全性。当使用ssh连接成功后，将建立客户端和服务端之间的会话，该会话是被加密的，之后客户端和服务端的通信都将通过会话传输。

(2).SSH服务的守护进程为sshd，默认监听在22端口上。

(3).所有ssh客户端工具，包括ssh命令，scp，sftp，ssh-copy-id等命令都是借助于ssh连接来完成任务的。也就是说它们都连接服务端的22端口，只不过连接上之后将待执行的相关命令转换传送到远程主机上，由远程主机执行。

(4).ssh客户端命令(ssh、scp、sftp等)读取两个配置文件：全局配置文件/etc/ssh/ssh_config和用户配置文件~/.ssh/config。实际上命令行上也可以传递配置选项。它们生效的优先级是：命令行配置选项 > ~/.ssh/config > /etc/ssh/ssh_config。

(5).ssh涉及到两个验证：主机验证和用户身份验证。通过主机验证，再通过该主机上的用户验证，就能唯一确定该用户的身份。一个主机上可以有很多用户，所以每台主机的验证只需一次，但主机上每个用户都需要单独进行用户验证。

(6).ssh支持多种身份验证，最常用的是密码验证机制和公钥认证机制，其中公钥认证机制在某些场景实现双机互信时几乎是必须的。虽然常用上述两种认证机制，但认证时的顺序默认是gssapi-with-mic,hostbased,publickey,keyboard-interactive,password。注意其中的主机认证机制hostbased不是主机验证，由于主机认证用的非常少(它所读取的认证文件为/etc/hosts.equiv或/etc/shosts.equiv)，所以网络上比较少见到它的相关介绍。总的来说，通过在ssh配置文件(注意不是sshd配置文件)中使用指令PreferredAuthentications改变认证顺序不失为一种验证的效率提升方式。

(7).ssh客户端其实有不少很强大的功能，如端口转发(隧道模式)、代理认证、连接共享(连接复用)等。

(8).ssh服务端配置文件为/etc/ssh/sshd_config，注意和客户端的全局配置文件/etc/ssh/ssh_config区分开来。

(9).很重要却几乎被人忽略的一点，ssh登录时会请求分配一个伪终端。但有些身份认证程序如sudo可以禁止这种类型的终端分配，导致ssh连接失败。例如使用ssh执行sudo命令时sudo就会验证是否要分配终端给ssh。
#### 1.3 SSH认证过程分析
假如从客户端A(172.16.10.5)连接到服务端B(172.16.10.6)上，将包括主机验证和用户身份验证两个过程，以RSA非对称加密算法为例。
`[root@xuexi ~]# ssh 172.16.10.6`
服务端B上首先启动了sshd服务程序，即开启了ssh服务，打开了22端口(默认)。
##### 1.3.1 主机验证过程
当客户端A要连接B时，首先将进行主机验证过程，即判断主机B是否是否曾经连接过。

判断的方法是读取~/.ssh/known_hosts文件和/etc/ssh/known_hosts文件，搜索是否有172.16.10.6的主机信息(主机信息称为host key，表示主机身份标识)。如果没有搜索到对应该地址的host key，则询问是否保存主机B发送过来的host key，如果搜索到了该地址的host key，则将此host key和主机B发送过来的host key做比对，如果完全相同，则表示主机A曾经保存过主机B的host key，无需再保存，直接进入下一个过程——身份验证，如果不完全相同，则提示是否保存主机B当前使用的host key。

询问是否保存host key的过程如下所示：
```
[root@xuexi ~]# ssh 172.16.10.6 
The authenticity of host '172.16.10.6 (172.16.10.6)' can't be established.
RSA key fingerprint is f3:f8:e2:33:b4:b1:92:0d:5b:95:3b:97:d9:3a:f0:cf.
Are you sure you want to continue connecting (yes/no)? yes
```
或者windows端使用图形界面ssh客户端工具时：
![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-44c2c87431a884f1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
在说明身份验证过程前，先看下known_hosts文件的格式。以~/.ssh/known_hosts为例。
```
[root@xuexi ~]# cat ~/.ssh/known_hosts
172.16.10.6 ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC675dv1w+GDYViXxqlTspUHsQjargFPSnR9nEqCyUgm5/32jXAA3XTJ4LUGcDHBuQ3p3spW/eO5hAP9eeTv5HQzTSlykwsu9He9w3ee+TV0JjBFulfBR0weLE4ut0PurPMbthE7jIn7FVDoLqc6o64WvN8LXssPDr8WcwvARmwE7pYudmhnBIMPV/q8iLMKfquREbhdtGLzJRL9DrnO9NNKB/EeEC56GY2t76p9ThOB6ES6e/87co2HjswLGTWmPpiqY8K/LA0LbVvqRrQ05+vNoNIdEfk4MXRn/IhwAh6j46oGelMxeTaXYC+r2kVELV0EvYV/wMa8QHbFPSM6nLz
```
该文件中，每行一个host key，行首是主机名，它是搜索host key时的索引，主机名后的内容即是host key部分。以此文件为例，它表示客户端A曾经试图连接过172.16.10.6这个主机B，并保存了主机B的host key，下次连接主机B时，将搜索主机B的host key，并与172.16.10.6传送过来的host key做比较，如果能匹配上，则表示该host key确实是172.16.10.6当前使用的host key，如果不能匹配上，则表示172.16.10.6修改过host key，或者此文件中的host key被修改过。

那么主机B当前使用的host key保存在哪呢？在/etc/ssh/ssh_host*文件中，这些文件是服务端(此处即主机B)的sshd服务程序启动时重建的。以rsa算法为例，则保存在/etc/ssh/ssh_host_rsa_key和/etc/ssh/ssh_host_rsa_key.pub中，其中公钥文件/etc/ssh/ssh_host_rsa_key.pub中保存的就是host key。
```
[root@xuexi ~]# cat /etc/ssh/ssh_host_rsa_key.pub   # 在主机B上查看
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC675dv1w+GDYViXxqlTspUHsQjargFPSnR9nEqCyUgm5/32jXAA3XTJ4LUGcDHBuQ3p3spW/eO5hAP9eeTv5HQzTSlykwsu9He9w3ee+TV0JjBFulfBR0weLE4ut0PurPMbthE7jIn7FVDoLqc6o64WvN8LXssPDr8WcwvARmwE7pYudmhnBIMPV/q8iLMKfquREbhdtGLzJRL9DrnO9NNKB/EeEC56GY2t76p9ThOB6ES6e/87co2HjswLGTWmPpiqY8K/LA0LbVvqRrQ05+vNoNIdEfk4MXRn/IhwAh6j46oGelMxeTaXYC+r2kVELV0EvYV/wMa8QHbFPSM6nLz
```

发现/etc/ssh/ssh_host_rsa_key.pub文件内容和~/.ssh/known_hosts中该主机的host key部分完全一致，只不过~/.ssh/known_hosts中除了host key部分还多了一个主机名，这正是搜索主机时的索引。

综上所述，**在主机验证阶段，服务端持有的是私钥，客户端保存的是来自于服务端的公钥。注意，这和身份验证阶段密钥的持有方是相反的。**
实际上，ssh并非直接比对host key，因为host key太长了，比对效率较低。所以ssh将host key转换成host key指纹，然后比对两边的host key指纹即可。指纹格式如下：
```
[root@xuexi ~]# ssh 172.16.10.6 
The authenticity of host '172.16.10.6 (172.16.10.6)' can't be established.
RSA key fingerprint is f3:f8:e2:33:b4:b1:92:0d:5b:95:3b:97:d9:3a:f0:cf.
Are you sure you want to continue connecting (yes/no)? yes
```
host key的指纹可由ssh-kegen计算得出。例如，下面分别是主机A(172.16.10.5)保存的host key指纹，和主机B(172.16.10.6)当前使用的host key的指纹。可见它们是完全一样的。
```
[root@xuexi ~]# ssh-keygen -l -f ~/.ssh/known_hosts
2048 f3:f8:e2:33:b4:b1:92:0d:5b:95:3b:97:d9:3a:f0:cf 172.16.10.6 (RSA)

[root@xuexi ~]# ssh-keygen -l -f /etc/ssh/ssh_host_rsa_key
2048 f3:f8:e2:33:b4:b1:92:0d:5b:95:3b:97:d9:3a:f0:cf   (RSA)
```
其实ssh还支持host key模糊比较，即将host key转换为图形化的指纹。这样，图形结果相差大的很容易就比较出来。之所以说是模糊比较，是因为对于非常近似的图形化指纹，ssh可能会误判。图形化指纹的生成方式如下：只需在上述命令上加一个"-v"选项进入详细模式即可。
```
[root@xuexi ~]# ssh-keygen -lv -f ~/.ssh/known_hosts
2048 f3:f8:e2:33:b4:b1:92:0d:5b:95:3b:97:d9:3a:f0:cf 172.16.10.6 (RSA)
+--[ RSA 2048]----+
|                 |
|                 |
|           .     |
|          o      |
|        S. . +   |
|      . +++ + .  |
|       B.+.= .   |·
|      + B.  +.   |
|       o.+.  oE  |
+-----------------+
```
更详细的主机认证过程是：先进行密钥交换(DH算法)生成session key(rfc文档中称之为shared secret)，然后从文件中读取host key，并用host key对session key进行签名，然后对签名后的指纹进行判断。(In SSH, the key exchange is signed with the host key to provide host authentication.来源：https://tools.ietf.org/html/rfc4419)
过程如下图：
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-86fe0dc3e967103c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#####1.3.2 身份验证过程
主机验证通过后，将进入身份验证阶段。SSH支持多种身份验证机制，它们的验证顺序如下：gssapi-with-mic,hostbased,publickey,keyboard-interactive,password，但常见的是密码认证机制(password)和公钥认证机制(public key)。当公钥认证机制未通过时，再进行密码认证机制的验证。这些认证顺序可以通过ssh配置文件(注意，不是sshd的配置文件)中的指令PreferredAuthentications改变。

如果使用公钥认证机制，客户端A需要将自己生成的公钥(~/.ssh/id_rsa.pub)发送到服务端B的~/.ssh/authorized_keys文件中。当进行公钥认证时，客户端将告诉服务端要使用哪个密钥对，并告诉服务端它已经访问过密钥对的私钥部分~/.ssh/id_rsa(客户端从自己的私钥中推导，或者从私钥同目录下读取公钥，计算公钥指纹后发送给服务端。所以有些版本的ssh不要求存在公钥文件，有些版本的ssh则要求私钥和公钥同时存在且在同目录下)，然后服务端将检测密钥对的公钥部分，判断该客户端是否允许通过认证。如果认证不通过，则进入下一个认证机制，以密码认证机制为例。

当使用密码认证时，将提示输入要连接的远程用户的密码，输入正确则验证通过。
#####1.3.3 验证通过
当主机验证和身份验证都通过后，分两种情况：直接登录或执行ssh命令行中给定某个命令。如：
```
[root@xuexi ~]# ssh 172.16.10.6 
[root@xuexi ~]# ssh 172.16.10.6  'echo "haha"'
```
(1).前者ssh命令行不带任何命令参数，表示使用远程主机上的某个用户(此处为root用户)登录到远程主机172.16.10.6上，所以远程主机会为ssh分配一个伪终端，并进入bash环境。

(2).后者ssh命令行带有命令参数，表示在远程主机上执行给定的命令【echo "haha"】。ssh命令行上的远程命令是通过fork ssh-agent得到的子进程来执行的，当命令执行完毕，子进程消逝，ssh也将退出，建立的会话和连接也都将关闭。(之所以要在这里明确说明远程命令的执行过程，是为了说明后文将介绍的ssh实现端口转发时的注意事项)

实际上，在ssh连接成功，登录或执行命令行中命令之前，可以指定要在远程执行的命令，这些命令放在~/.ssh/rc或/etc/ssh/rc文件中，也就是说，ssh连接建立之后做的第一件事是在远程主机上执行这两个文件中的命令。

#### 1.4 各种文件分布

以主机A连接主机B为例，主机A为SSH客户端，主机B为SSH服务端。

**在服务端即主机B上：**

* /etc/ssh/sshd_config  ：ssh服务程序sshd的配置文件。
* /etc/ssh/ssh_host_*   ：服务程序sshd启动时生成的服务端公钥和私钥文件。如ssh_host_rsa_key和ssh_host_rsa_key.pub。
                                  ：其中.pub文件是主机验证时的host key，将写入到客户端的~/.ssh/known_hosts文件中。
                                  ：其中私钥文件严格要求权限为600，若不是则sshd服务可能会拒绝启动。
* ~/.ssh/authorized_keys：保存的是基于公钥认证机制时来自于客户端的公钥。在基于公钥认证机制认证时，服务端将读取该文件。

**在客户端即主机A上：**

* /etc/ssh/ssh_config    ：客户端的全局配置文件。
* ~/.ssh/config              ：客户端的用户配置文件，生效优先级高于全局配置文件。一般该文件默认不存在。该文件对权限有严格要求只对所有者有读/写权限，对其他人完全拒绝写权限。
* ~/.ssh/known_hosts   ：保存主机验证时服务端主机host key的文件。文件内容来源于服务端的ssh_host_rsa_key.pub文件。
* /etc/ssh/known_hosts：全局host key保存文件。作用等同于~/.ssh/known_hosts。
* ~/.ssh/id_rsa              ：客户端生成的私钥。由ssh-keygen生成。该文件严格要求权限，当其他用户对此文件有可读权限时，ssh将直接忽略该文件。
* ~/.ssh/id_rsa.pub       ：私钥id_rsa的配对公钥。对权限不敏感。当采用公钥认证机制时，该文件内容需要复制到服务端的~/.ssh/authorized_keys文件中。
* ~/.ssh/rc                     ：保存的是命令列表，这些命令在ssh连接到远程主机成功时将第一时间执行，执行完这些命令之后才开始登陆或执行ssh命令行中的命令。
* /etc/ssh/rc                  ：作用等同于~/.ssh/rc。

#### 1.5 配置文件简单介绍
分为服务端配置文件/etc/ssh/sshd_config和客户端配置文件/etc/ssh/ssh_config(全局)或~/.ssh/config(用户)。

虽然服务端和客户端配置文件默认已配置项虽然非常少非常简单，但它们可配置项非常多。sshd_config完整配置项参见金步国翻译的[sshd_config中文手册](http://www.jinbuguo.com/openssh/sshd_config.html)，ssh_config也可以参考sshd_config的配置，它们大部分配置项所描述的内容是相同的。

##### 1.5.1 sshd_config
简单介绍下该文件中比较常见的指令。
```
[root@xuexi ~]# cat /etc/ssh/sshd_config

#Port 22                # 服务端SSH端口，可以指定多条表示监听在多个端口上
#ListenAddress 0.0.0.0  # 监听的IP地址。0.0.0.0表示监听所有IP
Protocol 2              # 使用SSH 2版本
 
#####################################
#          私钥保存位置               #
#####################################
# HostKey for protocol version 1
#HostKey /etc/ssh/ssh_host_key      # SSH 1保存位置/etc/ssh/ssh_host_key
# HostKeys for protocol version 2
#HostKey /etc/ssh/ssh_host_rsa_key  # SSH 2保存RSA位置/etc/ssh/ssh_host_rsa _key
#HostKey /etc/ssh/ssh_host_dsa_key  # SSH 2保存DSA位置/etc/ssh/ssh_host_dsa _key
 
 
###################################
#           杂项配置               #
###################################
#PidFile /var/run/sshd.pid        # 服务程序sshd的PID的文件路径
#ServerKeyBits 1024               # 服务器生成的密钥长度
#SyslogFacility AUTH              # 使用哪个syslog设施记录ssh日志。日志路径默认为/var/log/secure
#LogLevel INFO                    # 记录SSH的日志级别为INFO
#LoginGraceTime 2m                # 身份验证阶段的超时时间，若在此超时期间内未完成身份验证将自动断开
 
###################################
#   以下项影响认证速度               #
###################################
#UseDNS yes                       # 指定是否将客户端主机名解析为IP，以检查此主机名是否与其IP地址真实对应。默认yes。
                                  # 由此可知该项影响的是主机验证阶段。建议在未配置DNS解析时，将其设置为no，否则主机验证阶段会很慢
 
###################################
#   以下是和安全有关的配置           #
###################################
#PermitRootLogin yes              # 是否允许root用户登录
#MaxSessions 10                   # 最大客户端连接数量
#GSSAPIAuthentication no          # 是否开启GSSAPI身份认证机制，默认为yes
#PubkeyAuthentication yes         # 是否开启基于公钥认证机制
#AuthorizedKeysFile  .ssh/authorized_keys  # 基于公钥认证机制时，来自客户端的公钥的存放位置
PasswordAuthentication yes        # 是否使用密码验证，如果使用密钥对验证可以关了它
#PermitEmptyPasswords no          # 是否允许空密码，如果上面的那项是yes，这里最好设置no
 
###################################
#   以下可以自行添加到配置文件        #
###################################
DenyGroups  hellogroup testgroup  # 表示hellogroup和testgroup组中的成员不允许使用sshd服务，即拒绝这些用户连接
DenyUsers   hello test            # 表示用户hello和test不能使用sshd服务，即拒绝这些用户连接
 
###################################
#   以下一项和远程端口转发有关        #
###################################
#GatewayPorts no                  # 设置为yes表示sshd允许被远程主机所设置的本地转发端口绑定在非环回地址上
                                  # 默认值为no，表示远程主机设置的本地转发端口只能绑定在环回地址上，见后文"远程端口转发"
```

一般来说，如非有特殊需求，只需修改下监听端口和UseDNS为no以加快主机验证阶段的速度即可。

配置好后直接重启启动sshd服务即可
`[root@xuexi ~]# service sshd restart`

##### 1.5.2 ssh_config
需要说明的是，客户端配置文件有很多配置项和服务端配置项名称相同，但它们一个是在连接时采取的配置(客户端配置文件)，一个是sshd启动时开关性的设置(服务端配置文件)。例如，两配置文件都有GSSAPIAuthentication项，在客户端将其设置为no，表示连接时将直接跳过该身份验证机制，而在服务端设置为no则表示sshd启动时不开启GSSAPI身份验证的机制。即使客户端使用了GSSAPI认证机制，只要服务端没有开启，就绝对不可能认证通过。

下面也简单介绍该文件。
```
# Host *                              # Host指令是ssh_config中最重要的指令，只有ssh连接的目标主机名能匹配此处给定模式时，
                                      # 下面一系列配置项直到出现下一个Host指令才对此次连接生效
#   ForwardAgent no
#   ForwardX11 no
#   RhostsRSAAuthentication no
#   RSAAuthentication yes
#   PasswordAuthentication yes     # 是否启用基于密码的身份认证机制
#   HostbasedAuthentication no     # 是否启用基于主机的身份认证机制
#   GSSAPIAuthentication no        # 是否启用基于GSSAPI的身份认证机制
#   GSSAPIDelegateCredentials no
#   GSSAPIKeyExchange no
#   GSSAPITrustDNS no
#   BatchMode no                   # 如果设置为"yes"，将禁止passphrase/password询问。比较适用于在那些不需要询问提供密
                                   # 码的脚本或批处理任务任务中。默认为"no"。
#   CheckHostIP yes
#   AddressFamily any
#   ConnectTimeout 0
#   StrictHostKeyChecking ask        # 设置为"yes"，ssh将从不自动添加host key到~/.ssh/known_hosts文件，
                                     # 且拒绝连接那些未知的主机(即未保存host key的主机或host key已改变的主机)。
                                     # 它将强制用户手动添加host key到~/.ssh/known_hosts中。
                                     # 设置为ask将询问是否保存到~/.ssh/known_hosts文件。
                                     # 设置为no将自动添加到~/.ssh/known_hosts文件。
#   IdentityFile ~/.ssh/identity     # ssh v1版使用的私钥文件
#   IdentityFile ~/.ssh/id_rsa       # ssh v2使用的rsa算法的私钥文件
#   IdentityFile ~/.ssh/id_dsa       # ssh v2使用的dsa算法的私钥文件
#   Port 22                          # 当命令行中不指定端口时，默认连接的远程主机上的端口
#   Protocol 2,1
#   Cipher 3des                      # 指定ssh v1版本中加密会话时使用的加密协议
#   Ciphers aes128-ctr,aes192-ctr,aes256-ctr,arcfour256,arcfour128,aes128-cbc,3des-cbc  # 指定ssh v1版本中加密会话时使用的加密协议
#   MACs hmac-md5,hmac-sha1,umac-64@openssh.com,hmac-ripemd160
#   EscapeChar ~
#   Tunnel no
#   TunnelDevice any:any
#   PermitLocalCommand no    # 功能等价于~/.ssh/rc，表示是否允许ssh连接成功后在本地执行LocalCommand指令指定的命令。
#   LocalCommand             # 指定连接成功后要在本地执行的命令列表，当PermitLocalCommand设置为no时将自动忽略该配置
                             # %d表本地用户家目录，%h表示远程主机名，%l表示本地主机名，%n表示命令行上提供的主机名，
                             # p%表示远程ssh端口，r%表示远程用户名，u%表示本地用户名。
#   VisualHostKey no         # 是否开启主机验证阶段时host key的图形化指纹
Host *
        GSSAPIAuthentication yes
```
如非有特殊需求，ssh客户端配置文件一般只需修改下GSSAPIAuthentication的值为no来改善下用户验证的速度即可，另外在有非交互需求时，将StrictHostKeyChecking设置为no以让主机自动添加host key。

#### 1.6 ssh命令简单功能
此处先介绍ssh命令的部分功能，其他包括端口转发的在后文相关内容中解释，关于连接复用的选项本文不做解释。

语法：
```
ssh [options] [user@]hostname [command]
 
参数说明：
-b bind_address ：在本地主机上绑定用于ssh连接的地址，当系统有多个ip时才生效。
-E log_file     ：将debug日志写入到log_file中，而不是默认的标准错误输出stderr。
-F configfile   ：指定用户配置文件，默认为~/.ssh/config。
-f              ：请求ssh在工作在后台模式。该选项隐含了"-n"选项，所以标准输入将变为/dev/null。
-i identity_file：指定公钥认证时要读取的私钥文件。默认为~/.ssh/id_rsa。
-l login_name   ：指定登录在远程机器上的用户名。也可以在全局配置文件中设置。
-N              ：显式指明ssh不执行远程命令。一般用于端口转发，见后文端口转发的示例分析。
-n              ：将/dev/null作为标准输入stdin，可以防止从标准输入中读取内容。ssh在后台运行时默认该项。
-p port         ：指定要连接远程主机上哪个端口，也可在全局配置文件中指定默认的连接端口。
-q              ：静默模式。大多数警告信息将不输出。
-T              ：禁止为ssh分配伪终端。
-t              ：强制分配伪终端，重复使用该选项"-tt"将进一步强制。
-v              ：详细模式，将输出debug消息，可用于调试。"-vvv"可更详细。
-V              ：显示版本号并退出。
-o              ：指定额外选项，选项非常多。
user@hostname   ：指定ssh以远程主机hostname上的用户user连接到的远程主机上，若省略user部分，则表示使用本地当前用户。
                ：如果在hostname上不存在user用户，则连接将失败(将不断进行身份验证)。
command         ：要在远程主机上执行的命令。指定该参数时，ssh的行为将不再是登录，而是执行命令，命令执行完毕时ssh连接就关闭。
```
