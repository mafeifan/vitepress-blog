### 问题：pipeline中使用docker进行docker build,push命令，会报没有docker命令。

原因：Jenkins本身是运行在容器中的，但是没有安装Docker，所以找不到命令

解决方案：把宿主机的docker和docker.sock映射到运行Jenkins的容器内，通过挂载卷的方式把/usr/bin/docker,/var/run/docker.sock挂载出来。
修改Dockerfile或者docker-compose文件
```bash
volumes:
 - /var/run/docker.sock:/var/run/docker.sock
 - /usr/bin/docker:/usr/bin/docker
```

### 报错：libltdl.so.7 cannot open shared object
原因：容器内 /usr/lib缺少这个libltdl.so.7
解决方案：安装即可
`apt-get install -y libltdl7.*`
