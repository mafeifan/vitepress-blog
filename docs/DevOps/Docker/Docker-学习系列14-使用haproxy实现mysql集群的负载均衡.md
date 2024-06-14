在[上节](/DevOps/Docker/Docker-学习系列13-实现-基于pxc-的mysql-多节点主主同步)中我们创建了 mysql 集群。
实际工作中，我们不希望让某一数据库节点处理所有的请求，这样的话单个负载高，性能差。

> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-6b9dcf8b92b5f9b5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

在这里我们使用haproxy作为负载均衡的中间件，类似的还有LVS，但是好像不支持虚拟机，在docker中用不了。
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-84aec2631cb05277.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 实现流程：
1. 下载镜像 `docker pull haproxy`
2. 宿主机创建 haproxy 的配置文件，比如路径是 D:\Docker\haproxy\haproxy.cfg
3. 最重要的就是配置文件了。这里内容如下：
```ini
global
        daemon
        # nbproc 1
        # pidfile /var/run/haproxy.pid
        # 工作目录
        chroot /usr/local/etc/haproxy

defaults
        log 127.0.0.1 local0 err #[err warning info debug]
        mode http                #默认的模式mode { tcp|http|health }，tcp是4层，http是7层，health只会返回OK
        retries 2                #两次连接失败就认为是服务器不可用，也可以通过后面设置
        option redispatch        #当serverId对应的服务器挂掉后，强制定向到其他健康的服务器
        option abortonclose      #当服务器负载很高的时候，自动结束掉当前队列处理比较久的链接
        option dontlognull       #日志中不记录负载均衡的心跳检测记录
        maxconn 4096             #默认的最大连接数
        timeout connect 5000ms   #连接超时
        timeout client 30000ms   #客户端超时
        timeout server 30000ms   #服务器超时
        #timeout check 2000      #=心跳检测超时

######## 监控界面配置 #################
listen admin_status
        # 监控界面访问信息
        bind 0.0.0.0:8888
        mode http
        # URI相对地址
        stats uri /dbs
        # 统计报告格式
        stats realm Global\ statistics
        # 登录账户信息
        stats auth admin:123456
########frontend配置##############

######## mysql负载均衡配置 ###############
listen proxy-mysql
        bind 0.0.0.0:3306
        mode tcp
        # 负载均衡算法
        # static-rr 权重, leastconn 最少连接, source 请求IP, 轮询 roundrobin
        balance roundrobin
        # 日志格式
        option tcplog
        # 在 mysql 创建一个没有权限的haproxy用户，密码为空。 haproxy用户
        # create user 'haproxy'@'%' identified by ''; FLUSH PRIVILEGES;
        option mysql-check user haproxy
         # 这里是容器中的IP地址，由于配置的是轮询roundrobin，weight 权重其实没有生效
        server MYSQL_1 172.18.0.2:3306 check weight 1 maxconn 2000
        server MYSQL_2 172.18.0.3:3306 check weight 1 maxconn 2000
        server MYSQL_3 172.18.0.4:3306 check weight 1 maxconn 2000
        # 使用keepalive检测死链
        # option tcpka
#########################################
```

4. 启动 haproxy 的容器，镜像名称为 h1，网络名称使用上节中创建的 pxc-network，就是和 mysql 集群处于同一网络。
`docker run -it -d -p 4001:8888 -p 4002:3306 -v D:/Docker/haproxy:/usr/local/etc/haproxy --name h1 --net=pxc-network`
5. 进去容器，并让 haproxy 加载配置
`docker exec -it h1 bash`
`haproxy -f /usr/local/etc/haproxy/`
6. 宿主机打开  `http://localhost:4001/dbs` 这是haproxy 提供的图形界面
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-3bcd4c134d733d46.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

可以看到每个mysql节点运行状态是绿色，说明正常。
7. 测试，停掉一个数据库节点 `docker stop pxc_node1` ，发现有一个变红了。
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-ef6c1883613f0363.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
8. 项目中可以使用配置的 4002 来连接数据库，这样请求会被分发到各个子节点。

### 总结：
1. 数据库的负载均衡配置还是比较简单的，关键是负载均衡算法，如果每个数据库节点配置都一样，可以使用轮询算法，如果不一样，可以使用权重算法，让配置高的多接收请求。
2. 官方的[教程](https://www.percona.com/doc/percona-xtradb-cluster/LATEST/howtos/haproxy.html)
