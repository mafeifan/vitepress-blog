
```
$ ssh -R remote-port:target-host:target-port -N remotehost
# 访问 my.public.server:8080 相当于访问 内网服务器的 80 端口
ssh -R 8080:localhost:80 -N my.public.server


ssh -R 22:localhost:80 -N 52.81.89.90
```

* -R 远程端口转发
* 
