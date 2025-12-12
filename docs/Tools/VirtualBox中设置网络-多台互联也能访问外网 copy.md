## 查看网关的命令

![](https://pek3b.qingstor.com/hexo-blog/20220225201307.png)

* ip route show
* route -n
* netstat -r

## 使用 NAT 网络

1. 偏好设置 - 添加 NAT 网络

![](https://pek3b.qingstor.com/hexo-blog/20220225200638.png)

2. 对每一个虚拟机进行网络设置，选择 NAT 网络

这样就可以让虚拟机访问外网了。

但是宿主机无法通过ssh访问虚拟机。

因为 NAT 中的虚拟机对于外部网络以及主机本身是不可见的

3. 解决方式是使用端口转发

![](https://pek3b.qingstor.com/hexo-blog/20220225210713.png)

不用重启虚拟机可以直接测试

宿主机 `ssh -p 22224 <login>@127.0.0.1` 可以访问虚拟机

宿主机浏览器访问 http://localhost:22225/ 可以看到nginx页面

## ubuntu20.04 配置静态IP

```
sudo vi /etc/netplan/50-cloud-init.yaml
sudo netplan apply
sudo netplan --debug apply
```

```yaml
network:
  ethernets:
    enp0s3:
        addresses: [192.168.1.2/24]
        gateway4: 192.168.1.1
        nameservers:
          addresses: [8.8.8.8,8.8.4.4]
        dhcp4: no
  version: 2
```



## 参考

[我应该对虚拟机使用哪种网络模式](https://kb.parallels.com/cn/4948)

[VMware虚拟机网络配置-NAT篇](https://zhuanlan.zhihu.com/p/130984945)
