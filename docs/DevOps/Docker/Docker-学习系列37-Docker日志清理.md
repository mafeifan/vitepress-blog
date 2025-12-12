### 几个有用的文件大小查看命令

```bash
# 只查看一级目录统计的空间占用
alias dud="du -d 1 -h"

# 查看一级和二级目录的占用
alias du1="du -h --max-depth=1 *"
alias duf="du -sh"

cd /
du -sh * 

31G   var
14G   opt

# 有时候 ISPconfig 开启自动备份，会导致磁盘空间占用过大，请登录 IPSconfig 后台检查
root@jira:/var/backup# du -sh *
1.7G	web10
5.4G	web3
1.7G	web5
784M	web7

```

### 清理Docker镜像及日志

默认情况下，docker的日志是在`/var/lib/docker/containers/<container_id>/<container_id>-json.log中`

使用`sudo docker info` 发现日志驱动是`Logging Driver: json-file`,也应证了此点

有些`json.log`文件很大，记得清除掉

执行`docker images`列出本机存在的镜像，最后一列SIZE是镜像大小

强制删除多个镜像
`sudo docker rmi --force f439bc73d690 fa440e89e4c2` 

删除那些已停止的容器、dangling 镜像、未被容器引用的 network 和构建过程中的 cache
`docker system prune`  

删除 24 小时前下载的镜像
`docker image prune -a --filter "until=24h"`

安全起见，这个命令默认不会删除那些未被任何容器引用的数据卷，如果需要同时删除这些数据卷，你需要显式的指定 `--volumns` 参数。比如你可能想要执行下面的命令：
`docker system prune --all --force --volumns`

###  清理 Containerd 镜像
k8s  1.24版本后容器运行时从Docker换为了Containerd，所以当你登录到节点后会发现已经没有Docker命令了，换为了 ctr 或 crictl
```bash
crictl rmi --prune
```


### 使用 ncdu 查看磁盘占用情况

该命令默认会统计当前目录的文件占用情况，并直观的显示出来
我现在要查看整个磁盘个目录的占用情况
```
cd /
ncdu
```
![](https://pek3b.qingstor.com/hexo-blog/20211015220703.png)

![](https://pek3b.qingstor.com/hexo-blog/20211015215917.png)

### 删除 journal 日志
```
# 查看磁盘占用
journalctl --disk-usage

# 清理日志
journalctl --vacuum-size=10M

# 只保留一周的日志
journalctl --vacuum-time=1w
```

### 删除系统日志文件

```
cd /var/log
# 删除 /var/log 下的日志压缩包
rm -rf /var/log/*.gz
# 删除 /var/log 轮转日志
rm -rf /var/log/*.1
```
