#### 容器网络调试工具 netshoot

网络问题是我们使用容器技术时候经常碰到的问题，容器明明启动成功了就是ping不通，为了使容器尽量精简，有时并没有top,ps,netstat等网络命令，
有一个方法是再启动一个包含很多工具命令的容器连接到出问题的容器同一网络进行调试，[netshoot](https://github.com/nicolaka/netshoot)就是这样的工具

源码其实非常简单,可以把他想象成一个调试外挂，哪个容器出问题了，就把他挂到同一网络。

```dockerfile
FROM debian:stable-slim as fetcher
COPY build/fetch_binaries.sh /tmp/fetch_binaries.sh

RUN apt-get update && apt-get install -y \
  curl \
  wget

RUN /tmp/fetch_binaries.sh

FROM alpine:3.13

RUN set -ex \
    && echo "http://nl.alpinelinux.org/alpine/edge/main" >> /etc/apk/repositories \
    && echo "http://nl.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
    && echo "http://nl.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories \
    && apk update \
    && apk upgrade \
    && apk add --no-cache \
    apache2-utils \
    bash \
    bind-tools \
    bird \
    bridge-utils \
    busybox-extras \
    conntrack-tools \
    curl \
    dhcping \
    drill \
    ethtool \
    file\
    fping \
    iftop \
    iperf \
    iproute2 \
    ipset \
    iptables \ 
    iptraf-ng \
    iputils \
    ipvsadm \
    jq \
    libc6-compat \
    liboping \
    mtr \
    net-snmp-tools \
    netcat-openbsd \
    nftables \
    ngrep \
    nmap \
    nmap-nping \
    openssl \
    py3-pip \
    py3-setuptools \
    scapy \
    socat \
    speedtest-cli \
    strace \
    tcpdump \
    tcptraceroute \
    tshark \
    util-linux \
    vim \ 
    git \
    zsh \
    websocat

# Installing httpie ( https://httpie.io/docs#installation)
RUN pip3 install --upgrade httpie

# Installing ctop - top-like container monitor
COPY --from=fetcher /tmp/ctop /usr/local/bin/ctop

# Installing calicoctl
COPY --from=fetcher /tmp/calicoctl /usr/local/bin/calicoctl

# Installing termshark
COPY --from=fetcher /tmp/termshark /usr/local/bin/termshark

# Setting User and Home
USER root
WORKDIR /root
ENV HOSTNAME netshoot

# ZSH Themes
RUN wget https://github.com/robbyrussell/oh-my-zsh/raw/master/tools/install.sh -O - | zsh || true
RUN git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
RUN git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k
COPY zshrc .zshrc
COPY motd motd

# Fix permissions for OpenShift
RUN chmod -R g=u /root

# Running ZSH
CMD ["zsh"]
```

#### 容器网络基础
> Docker

bridge 模式是 Docker 默认的网络设置，此模式会为每一个容器分配 Network Namespace、设置 IP 等，并将一个主机上的 Docker 容器连接到一个虚拟网桥上。
当 Docker server 启动时，会在主机上创建一个名为 docker0 的虚拟网桥，此主机上启动的 Docker 容器会连接到这个虚拟网桥上。虚拟网桥的工作方式和物理交换机类似，这样主机上的所有容器就通过交换机连在了一个二层网络中。
接下来就要为容器分配 IP 了，Docker 会从 RFC1918 所定义的私有 IP 网段中，选择一个和宿主机不同的IP地址和子网分配给 docker0，连接到 docker0 的容器就从这个子网中选择一个未占用的 IP 使用。
如一般 Docker 会使用 172.17.0.0/16 这个网段，并将 172.17.42.1/16 分配给 docker0 网桥（在主机上使用 `ifconfig` 命令是可以看到 docker0 的，可以认为它是网桥的管理接口，在宿主机上作为一块虚拟网卡使用）

>  Kubernetes

Kubernetes也使用Network Namespace概念。
Kubernetes为每个pod创建一个Network Namespace，其中该pod中的所有容器共享相同的网络名称空间(IP, tcp sockets等)。
这是Docker容器和Kubernetes之间的一个关键区别。

#### 举例

这个例子来自docker官网 `https://docs.docker.com/get-started/07_multi_container/`

下面的命令，创建了名称为todo-app的网络，起了个mysql容器，这个容器在网络中的名称是mysql，由--network-alias指定
```bash
docker network create todo-app
docker run -d \
     --network todo-app --network-alias mysql \
     -v todo-mysql-data:/var/lib/mysql \
     -e MYSQL_ROOT_PASSWORD=secret \
     -e MYSQL_DATABASE=todos \
     mysql:5.7
docker exec -it <mysql-container-id> mysql -u root -p
```

下面我们启动netshoot容器并加入同一网络，进入容器，使用dig命令来通过主机名查看IP地主
```bash
docker run -it --network todo-app nicolaka/netshoot
dig mysql
```
返回内容类似
```bash
 ; <<>> DiG 9.14.1 <<>> mysql
 ;; global options: +cmd
 ;; Got answer:
 ;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 32162
 ;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 0

 ;; QUESTION SECTION:
 ;mysql.				IN	A

 ;; ANSWER SECTION:
 mysql.			600	IN	A	172.23.0.2

 ;; Query time: 0 msec
 ;; SERVER: 127.0.0.11#53(127.0.0.11)
 ;; WHEN: Tue Oct 01 23:47:24 UTC 2019
 ;; MSG SIZE  rcvd: 44
```

还有种更简单的方式
`docker run -it --net container:<container_name> nicolaka/netshoot`

如果要排查宿主机的网络问题
`docker run -it --net host nicolaka/netshoot`

## 参考

https://docs.docker.com/get-started/07_multi_container/

https://docs.docker.com/engine/reference/commandline/network_create/#bridge-driver-options

https://www.huaweicloud.com/articles/5bb8f4efe7aaca9d4332750d73876db8.html
