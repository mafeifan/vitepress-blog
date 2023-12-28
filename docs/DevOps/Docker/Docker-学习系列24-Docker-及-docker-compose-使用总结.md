### 免sudo执行docker和docker-compose
[官方文档](https://docs.docker.com/install/linux/linux-postinstall) 有介绍
```bash
# 创建名为docker的用户组
sudo groupadd docker
# 把当前用户加入到这个用户组中
sudo usermod -aG docker $USER
# 重登session
# 测试，不带sudo跑一个测试镜像
docker run hello-world
```
### 跟随系统自自动docker
`sudo systemctl enable docker`
* Docker Machine 的目的是简化 Docker 的安装和远程管理。
通过 docker-machine 命令我们可以轻松的在远程主机上安装 Docker。
* pull 镜像的时候最好指定tag，不然默认会用latest。会导致版本问题。
如 pull mysql 会拉最新的8.0
* `CMD echo $HOME` ， 在实际执行中，会将其变更为：`CMD [ "sh", "-c", "echo $HOME" ]`， 所以 `CMD service nginx start` 不对，要使用 `CMD ["nginx", "-g", "daemon off;"]`

docker build 会加入上下文
如果加入  

.dockerignore 指定忽略目录文件


### 实用的命令
根据容器名称查询容器ID并删除
```
# 第一种写法

docker stop `docker ps -a| grep test-project | awk '{print $1}' `
docker rm   `docker ps -a| grep test-project | awk '{print $1}' `

# 第二种写法
docker stop  `docker ps -aq --filter name=test-project`
docker rm    `docker ps -aq --filter name=test-project`
```
根据镜像名称查询容器ID并删除
```
# 第一种写法
docker stop `docker ps -a| grep ygsama/test-project:1.0.2 | awk '{print $1}' `
docker rm   `docker ps -a| grep ygsama/test-project:1.0.2 | awk '{print $1}' `

# 第二种写法
docker stop  `docker ps -aq --filter ancestor=ygsama/test-project:1.0.2`
docker rm   `docker ps -aq --filter ancestor=ygsama/test-project:1.0.2`
```

根据镜像名称查询镜像ID并删除
```
docker images -q --filter reference=ygsama/test-project*:*
docker image rm `docker images -q --filter reference=10.2.21.95:10001/treasury-brain*:*`
```

### docker-compose

1. env问题
2. 重启 php-fpm
3. 慎用 docker-compose down
4. 环境变量 优先级 shell > .env
4. 执行 `docker-compose up`  之前执行先执行  `docker-compose config`就是把实际要运行的docker-compose.yml内容打印出来 

Windows 操作系统底下经常会有文件字符集问题，比如报 
`<input>:1:13: illegal character NUL`，需要转换成unix文件格式
可以打开 git bash 运行 dos2unix 后跟文件名

参考：
* https://docs.docker.com/compose/compose-file/#variable-substitution
* https://docs.docker.com/compose/environment-variables/#the-env-file
