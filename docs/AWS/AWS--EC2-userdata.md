我们在初始一个 AWS EC2 实例时，可以通过 user data 让 EC2 第一次启动后做些事情，可以放置 shell script 或 cloud-init 指令。在控制台设置 user data 可用明文文本，由 awscli 创建时可使用一个文件，或者通过 API 用 base64 编码的内容。

下面是 user data 被执行时需知晓的一些知识

* 是脚本时必须以 #! 开始，俗称 Shebang, 如 #!/bin/bash
* user data 是以 root 身份执行，所以不要用 sudo, 当然创建的目录或文件的 owner 也是 root，需要 ec2-user 用* 户访问的话需要 chmod 修改文件权限，或者直接用 chown ec2-user:ec2-user -R abc 修改文件的所有者()
* 脚本不能交互，有交互时必须想办法跳过用户输入，如 apt install -y xzy, 带个  -y 标记
* 如果脚本中需访问 AWS 资源，权限由 Instance Profile 所指定的 IAM role 决定
* user data 中的脚本会被存储在  /var/lib/cloud/instances/<instance-id>/user-data.txt 文件中，因此也* 可以从这里验证 user data 是否设置正确。或者在 EC2 实例上访问 http://169.254.169.254/latest/* user-data 也能看到 user data 的内容。并且在 EC2 实例初始化后不被删除，所以以此实例为基础来创建一个新的 * AMI 需把它删除了
* user data 的大小限制为 16 KB, 指 base64 编码前的大小
* cloud-init 的输出日志在 /var/log/cloud-init-output.log, 它会捕获 cloud-init 控制台的输出内容

user data 的内容通常在创建好实例后，还得等一会才完全生效，马上用 SSH 登陆新创建后的实例一般还看不到效果，有可能得等分把钟。

脚本的内容会存储在 EC2 实例上，但它执行的控制台输出却没地方找，如果脚本执行过程中有问题就难以诊断了，这里有个办法可记录下 user data 中脚本执行的控制台输出，需在 user data 中加上一行，最后把调试也打开

```bash
#!/bin/bash -ex
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1
apt update
......
```

对，你没有看错，上面的 `exec > >(...` 两个大括号之间有空格

这样就能在实例的 `/var/log/user-data.log` 中看到所有 user data 中脚本执行的控制台输出了，错在哪一步也就能有的放矢的修正。

### 如何修改Userdata

1. 首先把实例停止
2. 在实例仍被选中的情况下，依次选择操作、实例设置和编辑用户数据。
3. 启动实例

## 参考

https://aws.amazon.com/cn/premiumsupport/knowledge-center/execute-user-data-ec2/

https://docs.amazonaws.cn/AWSEC2/latest/UserGuide/user-data.html#user-data-view-change
