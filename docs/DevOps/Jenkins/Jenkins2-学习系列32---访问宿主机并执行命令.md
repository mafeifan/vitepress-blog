Jenkins是在Docker容器里内跑的，现在需要Jenkins进到外部的宿主机并执行命令。

这里牵涉到两个问题：

1. 我如何知道宿主机的IP
2. 我如何通过IP访问宿主机

### 第1个问题,获取宿主机的IP

方法1：宿主机执行`ifconfig`

```
br-afd31e8abae9: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 172.22.0.1  netmask 255.255.0.0  broadcast 172.22.255.255
        inet6 fe80::42:a9ff:fea7:24d4  prefixlen 64  scopeid 0x20<link>
        ether 02:42:a9:a7:24:d4  txqueuelen 0  (Ethernet)
        RX packets 5566  bytes 1789941 (1.7 MB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 8811  bytes 75927547 (75.9 MB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions

docker0: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        inet 172.17.0.1  netmask 255.255.0.0  broadcast 172.17.255.255
        inet6 fe80::42:63ff:fe9f:9251  prefixlen 64  scopeid 0x20<link>
        ether 02:42:63:9f:92:51  txqueuelen 0  (Ethernet)
        RX packets 18693  bytes 5563196 (5.5 MB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 23271  bytes 122914964 (122.9 MB)
        TX errors 0  dropped 0 overr+uns 0  carrier 0  collisions 0
```
会看到docker0中的inet，172.17.0.1就是docker中的IP。而宿主机的内部IP是172.22.0.1

如果进到Jenkins容器，直接ping这个地址是通的。

但问题是这个IP不一定是固定的，我们需要在启动Jenkins容器时将当前的宿主IP告诉容器。

方法2：容器内执行`ip route show | awk '/default/ {print $3}'`

方法3：解决方案

如果在MacOS或Windows运行docker，尝试直接在容器内运行`ping host.docker.internal`返回的是宿主机IP

对于Linux，在docker-compose.yaml加入

> 注：需要docker版本在20.04及以上

我们更新docker-compose.yml
```
extra_hosts:
- "host.docker.internal:host-gateway"
```

重新进到容器内,查看hosts文件
`cat /etc/hosts`
就会发现新增了一条`172.17.0.1	host.docker.internal`
直接ping host.docker.internal可以连通

如果docker-compose.yml
```
extra_hosts:
 - "somehost:162.242.195.82"
 - "otherhost:50.31.209.229"
```

/etc/hosts 就会看到

```
162.242.195.82  somehost
50.31.209.229   otherhost
```

### 第2个问题，通过SSH协议访问宿主机

这个简单，我们需要进到容器内，只需要生成一对密钥。然后再将ssh目录映射出来

假设有一正在运行的容器，名称为: jenkins_jenkins-compose

登录宿主机，将容器内的ssh目录拷贝到宿主机中
`docker cp jenkins_jenkins-compose:/root/.ssh ssh`

设置权限和所属
```
chown root:root -R ~/.ssh/
chmod 600 ~/.ssh/config
```
修改docker-compose
```
volumes:
 - /var/run/docker.sock:/var/run/docker.sock
 - /usr/bin/docker:/usr/bin/docker
 # 加入这行
 - /home/ubuntu/docker/jenkins/ssh:/root/.ssh
```

关于ssh/config文件
```
Host cloud2
    HostName host.docker.internal
    User ubuntu
    Port 22
    IdentityFile ~/.ssh/id_rsa
```

测试：
在容器内执行 ssh cloud2 ls，相当于进到cloud2主机，并执行ls命令,返回结果正常

## 参考
https://stackoverflow.com/questions/31324981/how-to-access-host-port-from-docker-container/61424570#61424570

https://github.com/qoomon/docker-host

https://stackoverflow.com/questions/52925194/how-to-run-shell-script-on-host-from-jenkins-docker-container

https://stackoverflow.com/questions/32163955/how-to-run-shell-script-on-host-from-docker-container
