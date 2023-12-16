NFS 即网络文件系统（Network File-System），可以通过网络让不同机器、不同系统之间可以实现文件共享。通过 NFS，可以访问远程共享目录，就像访问本地磁盘一样。
NFS 只是一种文件系统，本身并没有传输功能，是基于 RPC（远程过程调用）协议实现的，采用 C/S 架构。

## 环境

* 服务端 Ubuntu20.04 IP 49.111.111.111
* 客户端 Mac Big Sur

### 服务端

```bash
# 安装NFS服务
sudo apt-get install nfs-kernel-server
# 创建共享目录
sudo mkdir -p /nfsboot/
# 设置权限
sudo chmod -R 777 /nfsroot
# ubuntu为当前用户
sudo chown ubuntu:ubuntu /nfsroot/ -R
# 编译NFS配置we你按
sudo vim /etc/exports
# 在该文件末尾添加下面的一行，注意：你可以创建多个共享文件夹，在/etc/exports下添加多个条目。
# 格式 `NFS共享目录路径    客户机IP或者名称(参数1,参数2,...,参数n)`

# *:表示允许任何网段 IP 的系统访问该 NFS 目录
# no_root_squash:访问nfs server共享目录的用户如果是root的话，它对该目录具有root权限
# no_all_squash:保留共享文件的UID和GID（默认）
# rw:可读可写
# sync:请求或者写入数据时，数据同步写入到NFS server的硬盘中后才会返回，默认选项
# secure:NFS客户端必须使用NFS保留端口（通常是1024以下的端口），默认选项。
# insecure:允许NFS客户端不使用NFS保留端口（通常是1024以上的端口）

/nfsroot/ *(rw,sync,no_root_squash,insecure)

# 下面命令慎用，导致客户端被挂起
sudo systemctl restart rpcbind
sudo systemctl restart nfs-server
sudo systemctl status nfs-server

# 最好使用下面命令来重新加载配置

# -a 全部挂载或者全部卸载
# -r 重新挂载
# -u 卸载某一个目录
# -v 显示共享目录
sudo exportfs -arv
# 显示挂载目录
sudo exportfs -v
/nfsroot      	<world>(rw,wdelay,insecure,no_root_squash,no_subtree_check,sec=sys,rw,insecure,no_root_squash,no_all_squash)
```

| 参数 | 说明 |
| :-----| :----- | 
| ro | 只读访问 |
| rw | 读写访问 |
| sync | 所有数据在请求时写入共享 |
| async | nfs在写入数据前可以响应请求 |
| secure | nfs通过1024以下的安全TCP/IP端口发送 |
| insecure | nfs通过1024以上的端口发送 |
| wdelay | 如果多个用户要写入nfs目录，则归组写入（默认） |
| no_wdelay | 如果多个用户要写入nfs目录，则立即写入，当使用async时，无需此设置 |
| hide | 在nfs共享目录中不共享其子目录 |
| no_hide | 共享nfs目录的子目录 |
| subtree_check | 如果共享/usr/bin之类的子目录时，强制nfs检查父目录的权限（默认） |
| no_subtree_check | 不检查父目录权限 |
| all_squash | 共享文件的UID和GID映射匿名用户anonymous，适合公用目录 |
| no_all_squash | 保留共享文件的UID和GID（默认） |
| root_squash | root用户的所有请求映射成如anonymous用户一样的权限（默认） |
| no_root_squash | root用户具有根目录的完全管理访问权限 |
| anonuid=xxx | 指定nfs服务器/etc/passwd文件中匿名用户的UID |
| anongid=xxx | 指定nfs服务器/etc/passwd文件中匿名用户的GID |


::: warning
+ 注1：尽量指定主机名或IP或IP段最小化授权可以访问NFS 挂载的资源的客户端；注意如果在k8s集群中配合nfs-client-provisioner使用的话，这里需要指定pod的IP段，否则nfs-client-provisioner pod无法启动，报错 mount.nfs: access denied by server while mounting
+ 注2：经测试参数insecure必须要加，否则客户端挂载出错mount.nfs: access denied by server while mounting
+ 注3：NFS服务不能随便重启，要重启，就需要先去服务器上，把挂载的目录卸载下来
:::


### Mac客户端

首先需要确保网络能够ping通。

```bash
# 检查挂载
showmount -e 49.111.111.111

Exports list on 49.111.111.111:
/nfsboot

# 创建本地挂载目录
mkdir ~/nfs
sudo mount -t nfs -o nolock 49.111.111.111:/nfsroot/ /Users/mafei/nfs
umount /Users/mafei/nfs
```

## Mac永久挂载NFS

1. 打开System Preferences > Users & Groups
2. 点击右侧的Login Items,系统启动项
3. 点击下面的+号，添加一个新的挂载，位置是已经挂载的目录

![](http://pek3b.qingstor.com/hexo-blog/20220105215837.png)

## Linux客户端挂载

Ubuntu 16.04，首先需要安装 `nfs-common` 包

``` bash
apt install nfs-common
```
CentOS 7, 需要安装 `nfs-utils` 包

``` bash
yum install nfs-utils
```

另一个挂载NFS 共享的方式就是在 `/etc/fstab` 文件中添加一行。该行必须指明 NFS 服务器的主机名、服务器输出的目录名以及挂载 NFS 共享的本机目录。

以下是在 /etc/fstab 中的常用语法：

``` bash
example.hostname.com:/ubuntu /local/ubuntu nfs rsize=8192,wsize=8192,timeo=14,intr
```

## 参数优化

NFS高并发下挂载优化常用参数（mount -o选项）

async：异步同步，此参数会提高I/O性能，但会降低数据安全（除非对性能要求很高，对数据可靠性不要求的场合。一般生产环境，不推荐使用）。

noatime：取消更新文件系统上的inode访问时间,提升I/O性能，优化I/O目的，推荐使用。

nodiratime：取消更新文件系统上的directory inode访问时间，高并发环境，推荐显式应用该选项，提高系统性能，推荐使用。

## 参考
https://www.cnblogs.com/operationhome/p/11700700.html

https://www.cnblogs.com/keystone/p/12699479.html

https://www.cnblogs.com/me80/p/7464125.html

https://xiaozhuanlan.com/topic/8560297431

https://github.com/easzlab/kubeasz/blob/master/docs/guide/nfs-server.md

https://zhuanlan.zhihu.com/p/288594630
