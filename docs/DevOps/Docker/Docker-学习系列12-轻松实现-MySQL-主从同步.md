Docker 的一大好处是在本地可以很方便快速的搭建负载均衡，主从同步等需要多主机的环境。
可以说是极大方便了运维成本和难度。
本节在本地搭建 mysql 的一主一从的集群环境。

关于主从同步的流程图，放张网上找的流程图
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-9bd1d2570613f8de.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

以mysql5.7为例

1. 创建 mysql-master-slave 目录，比如完整路径是
D:/docker/mysql-master-slave
目录结构如下：
```yaml
-- master
  -- data
   mysqld.cnf
-- slave
  -- data
      mysqld.cnf
```
2.  其中master目录底下的 mysqld.cnf 配置文件内容为
```ini
[mysqld]
pid-file	= /var/run/mysqld/mysqld.pid
socket		= /var/run/mysqld/mysqld.sock
datadir		= /var/lib/mysql

#log-error	= /var/log/mysql/error.log

# By default we only accept connections from localhost
#bind-address	= 127.0.0.1

# Disabling symbolic-links is recommended to prevent assorted security risks
symbolic-links=0

# 以下是新增内容
# 标识不同的数据库服务器，而且唯一
server-id=1
# 启用二进制日志
log-bin=mysql-bin
log-slave-updates=1
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT
skip-host-cache
skip-name-resolve
```

slave 目录底下的 mysqld.cnf 内容为
```ini
[mysqld]
pid-file	        = /var/run/mysqld/mysqld.pid
socket		= /var/run/mysqld/mysqld.sock
datadir		= /var/lib/mysql
#log-error	= /var/log/mysql/error.log
# By default we only accept connections from localhost
#bind-address	= 127.0.0.1
# Disabling symbolic-links is recommended to prevent assorted security risks
symbolic-links=0

# 以下是新增内容
server-id=2
log-bin=mysql-bin
log-slave-updates=1
# 多主的话需要注意这个配置，防止自增序列冲突。
auto_increment_increment=2
auto_increment_offset=2
read-only=1
slave-skip-errors = 1062
skip-host-cache
skip-name-resolve
```

3. 基于官方mysql镜像，运行两个容器并指定一些参数
启动 名称为mysql_master的容器作为master数据库

`docker run --name mysql_master -d -p 3307:3306 -e MYSQL_ROOT_PASSWORD=123456 -v D:/docker/mysql-master-slave/master/data:/var/lib/mysql -v D:/docker/mysql-master-slave/master/mysqld.cnf:/etc/mysql/mysql.conf.d/mysqld.cnf  mysql:5.7`

`docker run --name mysql_slave -d -p 3308:3306 -e MYSQL_ROOT_PASSWORD=123456 -v D:/docker/mysql-master-slave/slave/data:/var/lib/mysql -v D:/docker/mysql-master-slave/slave/mysqld.cnf:/etc/mysql/mysql.conf.d/mysqld.cnf  mysql:5.7`

这个时候宿主机的 Navicat 应该可以连上容器里的两个数据库了。

4. 配置主从同步，新开终端进入容器
`docker exec -it mysql_master bash`
`mysql -u root -p`
创建一个同步数据权限的用户
`GRANT REPLICATION SLAVE ON *.* to 'backup'@'%' identified by '123456';`
查看状态，记住File、Position的值，在 Slave 中将用到
`show master status;`
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-b1ffc7e43d23e527.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

进入slave容器
`docker exec -it mysql_slave bash`
`mysql -u root -p`
设置主库链接
`change master to master_host='172.17.0.2',master_user='backup',master_password='123456',master_log_file='mysql-bin.000001',master_log_pos=0,master_port=3306;`
启动从库同步
`start slave`
查看状态，如果 Slave_SQL_Running_State 是 Slave has read all relay log; waiting for more updates 表示正常运行。
`show slave status \G`
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-bb110847401decb9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

5. 测试同步，在master上新建一个数据库
`docker exec mysql_master mysql -uroot -p123456 -e "CREATE DATABASE test"`
`docker exec mysql_slave mysql -uroot -p123456 -e "SHOW DATABASES"`

### 总结：
1. mysqld.cnf 文件的由来?
答：就是从容器内的 `/etc/mysql/mysql.conf.d/mysqld.cnf` 拷贝出来的
2. 主从同步的简单原理？
答：
MySQL的主从复制是一个异步的复制过程，数据库从一个Master复制到Slave数据库，在Master与Slave之间实现整个主从复制的过程是由三个线程参与完成的，其中有两个线程(SQL线程和IO线程)在Slave端，另一个线程(IO线程)在Master端。
master 数据变化时会产生bin log日志，slave上的线程拉去bin log，然后在slave上重新执行日志。这样就保证了数据一致性。
3. show slave status 中的Slave_IO_Running和Slave_SQL_Running的含义？
答：Slave 上会同时有两个线程在工作， I/O 线程从 Master 得到数据（Binary Log 文件），放到被称为
Relay Log 文件中进行记录。另一方面，SQL 线程则将 Relay Log 读取并执行。
为什么要有两个线程？这是为了降低同步的延迟。因为 I/O 线程和 SQL 线程都是相对很耗时的操作。
4. 从服务器同步失败？
答：看错误日志 `tail /var/log/mysql/error.log`
重新执行同步
`stop slave;`
`change master to master_log_file='mysql-bin.000100,master_log_pos=123'`
关于 file 和 pos，需在master上执行`show master status`获得。
或者使用 `mysqlbinlog` 命令分析。

5. 如何添加多个从节点?
和添加第一个从节点类似，先导出master的数据，复制第一个slave配置文件，唯一要改变的是server-id，不能和其他的重复。之后启动新的容器，进到容器内执行`change master to ...`。
还需要注意当前master没有写入等操作，最好先锁表，同步设置好后在解锁。[参考](https://blog.csdn.net/zhengwei125/article/details/50071041)

### 问题：
1. 如何添加slave节点服务器，如何主主备份
更多细节还得啃官方[文档](https://dev.mysql.com/doc/refman/5.7/en/replication.html)
2. 使用 docker compose 配置 mysql 主从 http://tarunlalwani.com/post/mysql-master-slave-using-docker/

### 参考：
* https://www.cnblogs.com/w2206/p/6963065.html
* https://github.com/Junnplus/blog/issues/1
