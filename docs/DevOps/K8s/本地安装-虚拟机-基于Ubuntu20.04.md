## KK
```bash
wget https://github.do/https://github.com/kubesphere/kubekey/releases/download/v2.0.0-rc.3/kubekey-v2.0.0-rc.3-linux-64bit.deb
sudo dpkg  -i kubekey-v2.0.0-rc.3-linux-64bit.deb
export KKZONE=cn

# 生成配置文件 sample.yaml
kk create config --from-cluster
```

编辑配置文件，主要修改IP,密码,这里只按照k8s,没有安装kubersphere

```yaml
apiVersion: kubekey.kubesphere.io/v1alpha2
kind: Cluster
metadata:
  name: sample
spec:
  hosts:
  ##You should complete the ssh information of the hosts
  - {name: master, address: 192.168.50.111, internalAddress: 192.168.50.111}
  - {name: node1, address: 192.168.50.111, internalAddress: 192.168.50.111}
  roleGroups:
    etcd:
    - SHOULD_BE_REPLACED
    master:
    - master
    worker:
    - master
  controlPlaneEndpoint:
    ##Internal loadbalancer for apiservers
    #internalLoadbalancer: haproxy

    ##If the external loadbalancer was used, 'address' should be set to loadbalancer's ip.
    domain: lb.kubesphere.local
    address: ""
    port: 6443
  kubernetes:
    version: v1.21.5
    clusterName: cluster.local
    proxyMode: ipvs
    masqueradeAll: false
    maxPods: 110
    nodeCidrMaskSize: 24
  network:
    plugin: calico
    kubePodsCIDR: 10.233.64.0/18
    kubeServiceCIDR: 10.233.0.0/18
  registry:
    privateRegistry: ""
```    

等待完成

```
kk create cluster -f sample.yaml
```

## 前提


安装步骤到网络源配置时，输入阿里源
http://mirrors.aliyun.com/ubuntu/



几个显示切换快捷键
Host + F – 切换到全屏模式
Host + L – 切换到无缝模式
Host + C – 切换到比例模式
Host + Home – 显示控制菜单

Host为键盘上右边的ctrl键


我这里是把网络改为桥接，然后设置静态IP

* master 192.168.50.66
* vm2 192.168.50.49

`cat /etc/netplan/00-installer-config.yaml`

```yaml
# This is the network config written by 'subiquity'
network:
  ethernets:
    enp0s3:
      dhcp4: false
      addresses: [192.168.50.66/24]
      gateway4: 192.168.50.1
      nameservers:
        addresses: [192.168.50.1,143.143.143.143]
  version: 2
```

应用网络配置 `sudo netplan apply`

然后路由器绑定MAC地址



## 修改配置

以下命令每个节点都需要执行

```bash
# 禁止swap分区，这个是暂时关闭
sudo swapoff -a
# 永久关闭，注释swap那行
sudo vi /etc/fstab

# 
sudo apt-get install openssh-server

sudo/etc/init.d/ssh start

# 关闭防火墙
sudo ufw disable
# 移除ubuntu自带的snapd
sudo apt remove snapd
# 确保每个机器不会自动suspend（待机/休眠）
sudo systemctl mask sleep.target suspend.target hibernate.target hybrid-sleep.target
# 修改时区
sudo timedatectl set-timezone Asia/Shanghai
date -R
# 确认Linux内核加载了br_netfilter模块
lsmod | grep br_netfilter
# 确保sysctl配置中net.bridge.bridge-nf-call-iptables的值设置为了1。
cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
EOF

# 修改/etc/sysctl.d/10-network-security.conf
sudo vi /etc/sysctl.d/10-network-security.conf

# 将下面两个参数的值从2修改为1
# net.ipv4.conf.default.rp_filter=1
# net.ipv4.conf.all.rp_filter=1

# 然后使之生效
sudo sysctl --system
# 加入k8s下载阿里源
curl -s https://mirrors.aliyun.com/kubernetes/apt/doc/apt-key.gpg | sudo apt-key add -

sudo tee /etc/apt/sources.list.d/kubernetes.list <<EOF 
deb https://mirrors.aliyun.com/kubernetes/apt/ kubernetes-xenial main
EOF

# 安装依赖组件
sudo apt-get update && sudo apt-get install -y docker.io openssh-server net-tools ca-certificates curl software-properties-common apt-transport-https kubelet kubeadm kubectl && sudo apt-mark hold kubelet kubeadm kubectl

# 修改docker配置文件 vi /etc/docker/daemon.json文件如下所示
# 驱动改为systemd

{
 "exec-opts": ["native.cgroupdriver=systemd"],
 "registry-mirrors": ["https://c1iu8k4x.mirror.aliyuncs.com"]
}

# 检查驱动
sudo systemctl restart docker
sudo systemctl enable docker
sudo docker info | grep -i cgroup

# 输出类型

WARNING: No swap limit support
 Cgroup Driver: systemd
 Cgroup Version: 1

# 开机自启动
sudo systemctl enable kubelet && systemctl start kubelet
```

## master 节点命令
```bash
sudo kubeadm init --pod-network-cidr 172.16.0.0/16 \
--apiserver-advertise-address=192.168.50.66 \
--image-repository registry.cn-hangzhou.aliyuncs.com/google_containers \
--ignore-preflight-errors=all

# 这时看到master已经出现，但是status为 not ready，需要安装网络插件，可以是Flannel，Calico等
kubectl get node

# 安装 flannel
kubectl apply -f https://raw.githubusercontent.com/flannel-io/flannel/master/Documentation/kube-flannel.yml

```

## node 节点命令
```bash
sudo swapoff -a
sudo systemctl restart kubelet
sudo systemctl status kubelet
sudo kubeadm join 192.168.50.66:6443 --token ygwpny.2lj1tj2njduj6qjg \
        --discovery-token-ca-cert-hash sha256:b7fe3d7806fcf74a9742a67f8259e7f22edcbd284429cf439e04dda96f3c4a70
```

## 排错

> [kubelet-check] The HTTP call equal to 'curl -sSL http://localhost:10248/healthz' failed with error: Get "http://localhost:10248/healthz": dial tcp 127.0.0.1:10248: connect: connection refused.

检查并保证kubelet运行
```
sudo systemctl restart kubelet
sudo systemctl status kubelet
```


> error execution phase preflight: [preflight] Some fatal errors occurred:
        [ERROR Port-6443]: Port 6443 is in use

加入 `--ignore-preflight-errors=all`或者kubeadm reset 重置后再次执行


> 重启主机后CoreDNS启动失败

# 检查日志
journalctl -u kubelet -n 1000


## 后续

每添加一个node节点，设置为work节点，注意替换vm1为你实际的节点名

```
mafei@master:~$ kubectl get nodes
NAME     STATUS   ROLES                  AGE     VERSION
master   Ready    control-plane,master   3h12m   v1.23.1
vm2      Ready    <none>                 148m    v1.23.1
mafei@master:~$ kubectl label node vm2 node-role.kubernetes.io/worker=worker
node/vm2 labeled
mafei@master:~$ kubectl get nodes
NAME     STATUS   ROLES                  AGE     VERSION
master   Ready    control-plane,master   3h30m   v1.23.1
vm2      Ready    worker                 166m    v1.23.1
mafei@master:~$ 
```

## 参考

https://www.bilibili.com/video/BV1P5411r78j

https://zhuanlan.zhihu.com/p/138554103

https://segmentfault.com/a/1190000040780446