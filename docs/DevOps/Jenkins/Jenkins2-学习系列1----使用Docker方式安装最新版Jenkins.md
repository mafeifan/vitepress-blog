服务器确保已经安装了docker和docker-compose。
当前用的是
Docker version 18.09.7, build 2d0083d
docker-compose version 1.24.0, build 0aa59064

下面的操作是当执行 docker 或 docker-compose 不用带 sudo
```bash
# 创建名为docker的用户组
sudo groupadd docker
# 把当前用户加入到这个用户组中
sudo usermod -aG docker $USER
# 重登session
# 测试，不带sudo跑一个测试镜像
docker run hello-world
```

新建 jenkins 用户
```bash
# 创建jenkins用户并添加同名组、创建用户目录,默认shell为bash
$ sudo useradd -mU jenkins -s /bin/bash 
$ sudo passwd jenkins #重置密码
$ su jenkins #使用jenkins用户登录
$ cd ~ #进入/home/jenkins目录
```

新建 jenkins-compose目录并在里面添加`docker-compose.yml` 文件，内容如下：
```yaml
version: '3'

services:
  jenkins-compose:
    # 注意镜像名称，lts表示长期支持版
    image: jenkins/jenkins:lts
    privileged: true # 解决权限问题
    restart: always 
    ports:
     - "8088:8080"
     - "50000:50000"
    environment:
     - JAVA_OPTS=-Duser.timezone=Asia/Shanghai
    volumes:
     - /var/run/docker.sock:/var/run/docker.sock
     - /usr/bin/docker:/usr/bin/docker
     - /home/ubuntu/jenkins-compose:/var/jenkins_home
```

执行 `docker-compose up -d jenkins-compose` 会下载镜像并在后台启动
然后 `docker-compose logs`  查看日志

留意并复制红框中的密码

> ![image.png](https://hexo-blog.pek3b.qingstor.com/2019/8/24/16cc3eaa69000662?w=1240&h=606&f=png&s=478129)

浏览器打开Jenkins地址，地址应该是服务器ip:8088

::: tip
打不开的话检查下防火墙开放8088端口
:::

粘贴刚复制的密码，点Continue
> ![image.png](https://hexo-blog.pek3b.qingstor.com/2019/8/24/16cc3eaa6915503b?w=1240&h=907&f=png&s=139020)

安装插件，建议选第一个
> ![image.png](https://hexo-blog.pek3b.qingstor.com/2019/8/24/16cc3eaa69463235?w=1240&h=981&f=png&s=190192)

安装完成后会自动跳转到管理员用户界面
> ![image.png](https://hexo-blog.pek3b.qingstor.com/2019/8/24/16cc3eaa695b87a7?w=1240&h=909&f=png&s=76171)

最终来到了欢迎页面
> ![image.png](https://hexo-blog.pek3b.qingstor.com/2019/8/24/16cc3eaa697012dd?w=1240&h=671&f=png&s=99707)


#### 修改时区
在【系统管理】-【脚本命令行】里运行
`System.setProperty('org.apache.commons.jelly.tags.fmt.timeZone', 'Asia/Shanghai')`

#### 修改Jenkins插件为国内源
首页 --> configure --> Manage Jenkins --> Advanced --> Update Site（页面最下方‘升级站点’）

替换URL为 清华大学仓库地址：

https://updates.jenkins.io/update-center.json
改为
https://mirror.tuna.tsinghua.edu.cn/jenkins/updates/update-center.json

如果插件页面为空，把https改为http

#### 问题：
* Jenkins更新比较频繁，如何更新版本？
见 medium 的这篇 [文章](https://medium.com/@jimkang/how-to-start-a-new-jenkins-container-and-update-jenkins-with-docker-cf628aa495e9)
